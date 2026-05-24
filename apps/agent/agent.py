"""
Maneuver Voice AI — Agent Orchestrator
Author: Soumoditya Das <soumoditt@gmail.com>
Architecture: LiveKit VoicePipelineAgent + Groq LLM + Deepgram STT/TTS + Custom ML Intent Router
"""
import asyncio
import os
import logging
import json
import re
import aiohttp
from datetime import timedelta
from dotenv import load_dotenv

from livekit import rtc, api as lk_api
from livekit.agents.voice_assistant import VoicePipelineAgent
from livekit.plugins import openai, silero, deepgram
from livekit.agents import llm
from livekit.agents.utils import http_context

from prompts import SYSTEM_PROMPT
from lead_store import LeadStore
from tools import FounderTools

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("founder-agent")

# ── Strip any leaked tool-call syntax from LLM output before TTS/chat ────────
_TOOL_LEAK_RE = re.compile(
    r'\(\w+>[^)]*\)'          # (update_lead_field>{...})
    r'|\[\w+\([^)]*\)\]'       # [show_services_slide()]
    r'|<tool_call>.*?</tool_call>'  # XML-style tool calls
    r'|```[^`]*```',           # any code fences
    re.DOTALL
)

def clean_text(text: str) -> str:
    """Remove any leaked function/tool call artifacts from spoken text."""
    cleaned = _TOOL_LEAK_RE.sub('', text)
    # Collapse multiple spaces/newlines left behind
    cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()
    return cleaned or text  # fallback to original if we wiped everything


def build_groq_llm():
    """Groq llama-3.1-8b-instant: high limit tier."""
    return openai.LLM(
        model="llama-3.1-8b-instant",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ["GROQ_API_KEY"],
    )


async def main():
    http_context._new_session_ctx()

    # ── Generate a fresh JWT every run — prevents 401 Invalid Token ──────────
    livekit_url = os.environ["LIVEKIT_URL"]
    api_key = os.environ["LIVEKIT_API_KEY"]
    api_secret = os.environ["LIVEKIT_API_SECRET"]
    room_name = os.environ.get("AGENT_ROOM_NAME", "founder-voice-room")

    token = (
        lk_api.AccessToken(api_key, api_secret)
        .with_identity("agent-founder")
        .with_name("Husain Topiwala · Maneuver")
        .with_grants(lk_api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_publish_data=True,
            can_subscribe=True,
        ))
        .with_ttl(timedelta(hours=12))  # 12 hour token — never expires mid-session
        .to_jwt()
    )

    room = rtc.Room()
    await room.connect(livekit_url, token)
    logger.info(f"✅ Agent connected to {room_name}")

    # ── Lead capture + tool context ──────────────────────────────────────────
    lead_store = LeadStore()
    lead_id = await lead_store.create_session(room.name)
    fnc_ctx = FounderTools(room, lead_store, lead_id)

    # ── System context ───────────────────────────────────────────────────────
    initial_ctx = llm.ChatContext().append(role="system", text=SYSTEM_PROMPT)

    # ── STT / LLM / TTS pipeline ─────────────────────────────────────────────
    session = aiohttp.ClientSession()

    stt = deepgram.STT(
        model="nova-2",
        language="en-US",
        http_session=session,
        interim_results=True,     # Live word-by-word captions
        endpointing_ms=3000,      # 3 second silence = end of utterance (long speech support)
        smart_format=True,
        punctuate=True,
        filler_words=True,
    )

    llm_plugin = build_groq_llm()
    tts = deepgram.TTS(model="aura-helios-en")   # Energetic, louder male voice

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(min_silence_duration=3.0),
        stt=stt,
        llm=llm_plugin,
        tts=tts,
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx,
        allow_interruptions=True,
        interrupt_min_words=3,        # Wait for 3+ words before allowing interruption
        max_endpointing_delay=6.0,    # Support long pauses mid-sentence (5000+ words)
        preemptive_synthesis=True,    # Begin TTS before LLM finishes = lower latency
    )

    # ── Helper: publish RPC event to frontend ────────────────────────────────
    def publish(payload: dict):
        if room and room.local_participant:
            data = json.dumps(payload).encode()
            asyncio.create_task(
                room.local_participant.publish_data(data, reliable=True)
            )

    # ── Transcript hooks (user and agent speech) ──────────────────────────────
    @agent.on("user_speech_committed")
    def on_user_speech(msg: llm.ChatMessage):
        text = msg.content if isinstance(msg.content, str) else str(msg.content)
        asyncio.create_task(lead_store.add_transcript_turn(lead_id, "user", text))
        publish({"event": "transcript", "data": {"role": "user", "text": text}})

        # Zero-latency local ML intent routing
        try:
            from intent_model import intent_router
            intent = intent_router.predict_intent(text.lower())
            if intent != "general":
                publish({"event": intent, "data": {}})
                logger.info(f"🎯 Intent routed: {intent}")
        except Exception as e:
            logger.warning(f"Intent model: {e}")

    @agent.on("agent_speech_committed")
    def on_agent_speech(msg: llm.ChatMessage):
        raw = msg.content if isinstance(msg.content, str) else str(msg.content)
        text = clean_text(raw)
        asyncio.create_task(lead_store.add_transcript_turn(lead_id, "agent", text))
        publish({"event": "transcript", "data": {"role": "agent", "text": text}})

    @agent.on("agent_state_changed")
    def on_state_change(state):
        state_str = state.name.lower() if hasattr(state, "name") else str(state)
        publish({"event": "set_agent_state", "data": {"state": state_str}})

    agent.start(room)

    has_greeted = False

    # ── Warm greeting function ─────────────────────────────────────────────────
    def greet_participant(participant: rtc.RemoteParticipant):
        nonlocal has_greeted
        if has_greeted:
            return
        has_greeted = True
        
        name = participant.name or "there"
        greeting = f"Hey {name}! I'm Husain from Maneuver. What brings you in today?"
        
        agent.chat_ctx.messages.append(
            llm.ChatMessage(
                role="system",
                content=f"[SYSTEM] Visitor name: {name}. You just greeted them with: '{greeting}'"
            )
        )
        agent.chat_ctx.messages.append(
            llm.ChatMessage(role="assistant", content=greeting)
        )
        asyncio.create_task(agent.say(greeting, allow_interruptions=True))

    # Greet existing participants (reconnect scenario)
    if room.remote_participants:
        participant = next(iter(room.remote_participants.values()))
        greet_participant(participant)

    @room.on("participant_connected")
    def on_participant_joined(participant: rtc.RemoteParticipant):
        logger.info(f"👤 Participant joined: {participant.identity} ({participant.name})")
        greet_participant(participant)

    # ── Text chat handler ──────────────────────────────────────────────────────
    @room.on("data_received")
    def on_data(data_packet: rtc.DataPacket):
        try:
            payload = json.loads(data_packet.data.decode("utf-8"))
            
            # Handle LiveKit useChat() messages OR custom chat_input
            text_msg = payload.get("message") or payload.get("text")
            
            if text_msg and isinstance(text_msg, str):
                text_msg = text_msg.strip()
                sender = getattr(data_packet.participant, "identity", "") if data_packet.participant else ""
                
                if not text_msg or sender == "agent-founder":
                    return

                logger.info(f"💬 Chat from {sender}: {text_msg}")
                agent.chat_ctx.messages.append(
                    llm.ChatMessage(role="user", content=text_msg)
                )

                async def respond_to_chat():
                    try:
                        # Generate response using the LLM and stream it to TTS
                        stream = agent.llm.chat(chat_ctx=agent.chat_ctx, fnc_ctx=agent.fnc_ctx)
                        await agent.say(stream, allow_interruptions=True)
                    except Exception as ex:
                        logger.error(f"Chat response error: {ex}")

                asyncio.create_task(respond_to_chat())
        except Exception as e:
            pass

    logger.info("🎙️ Husain is live and waiting for visitors...")
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
