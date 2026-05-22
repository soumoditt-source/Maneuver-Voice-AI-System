from pydantic import BaseModel
from typing import Optional, List
import uuid
import datetime
import json
import os
import aiosqlite

LEAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "leads")
os.makedirs(LEAD_DIR, exist_ok=True)
DB_PATH = os.path.join(LEAD_DIR, "leads.db")

class Turn(BaseModel):
    role: str
    content: str
    timestamp: str

class LeadData(BaseModel):
    id: str
    call_id: str
    timestamp: str
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    problem: Optional[str] = None
    timeline: Optional[str] = None
    budget: Optional[str] = None
    authority: Optional[str] = None
    next_action: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = "neutral"
    call_duration_seconds: int = 0
    transcript: List[Turn] = []

class LeadStore:
    async def _init_db(self):
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS leads (
                    id TEXT PRIMARY KEY,
                    call_id TEXT,
                    timestamp TEXT,
                    name TEXT,
                    company TEXT,
                    role TEXT,
                    email TEXT,
                    phone TEXT,
                    problem TEXT,
                    timeline TEXT,
                    budget TEXT,
                    authority TEXT,
                    next_action TEXT,
                    notes TEXT,
                    sentiment TEXT,
                    call_duration_seconds INTEGER,
                    transcript TEXT
                )
            """)
            await db.commit()

    async def create_session(self, call_id: str) -> str:
        await self._init_db()
        lead_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "INSERT INTO leads (id, call_id, timestamp, transcript) VALUES (?, ?, ?, ?)",
                (lead_id, call_id, now, "[]")
            )
            await db.commit()
        return lead_id

    async def update_field(self, lead_id: str, field: str, value: str):
        allowed_fields = [
            "name", "company", "role", "email", "phone", "problem",
            "timeline", "budget", "authority", "next_action", "notes", "sentiment"
        ]
        if field not in allowed_fields:
            return
        
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(f"UPDATE leads SET {field} = ? WHERE id = ?", (value, lead_id))
            await db.commit()

    async def add_transcript_turn(self, lead_id: str, role: str, content: str):
        now = datetime.datetime.utcnow().isoformat()
        turn = {"role": role, "content": content, "timestamp": now}
        
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute("SELECT transcript FROM leads WHERE id = ?", (lead_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    transcript = json.loads(row[0])
                    transcript.append(turn)
                    await db.execute("UPDATE leads SET transcript = ? WHERE id = ?", (json.dumps(transcript), lead_id))
                    await db.commit()

    async def finalize(self, lead_id: str) -> Optional[dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    data = dict(row)
                    data["transcript"] = json.loads(data["transcript"])
                    
                    # save to JSON file
                    json_path = os.path.join(LEAD_DIR, f"{lead_id}.json")
                    with open(json_path, "w") as f:
                        json.dump(data, f, indent=2)
                        
                    return data
        return None

    async def get_all_leads(self) -> List[dict]:
        await self._init_db()
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM leads ORDER BY timestamp DESC") as cursor:
                rows = await cursor.fetchall()
                leads = []
                for r in rows:
                    data = dict(r)
                    data["transcript"] = json.loads(data["transcript"])
                    leads.append(data)
                return leads

    async def get_lead(self, lead_id: str) -> Optional[dict]:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    data = dict(row)
                    data["transcript"] = json.loads(data["transcript"])
                    return data
        return None
