import json
import logging
from typing import Annotated
from livekit.agents import llm

from knowledge_base import search_kb
from search_tools import web_search

logger = logging.getLogger(__name__)

class FounderTools(llm.FunctionContext):
    def __init__(self, room, lead_store, lead_id):
        super().__init__()
        self.room = room
        self.lead_store = lead_store
        self.lead_id = lead_id

    async def _publish_event(self, event_name: str, data: dict = None):
        if not data:
            data = {}
        msg = json.dumps({"event": event_name, "data": data})
        if self.room and self.room.local_participant:
            await self.room.local_participant.publish_data(msg.encode(), reliable=True)

    @llm.ai_callable(description="Show the services overview slide to the user")
    async def show_services_slide(self):
        logger.info("Tool called: show_services_slide")
        await self._publish_event("show_services_slide")
        return "Services slide is now visible to the user."

    @llm.ai_callable(description="Show a detailed view of a specific service")
    async def show_service_detail(self, service_name: Annotated[str, "The name of the service to show"]):
        logger.info(f"Tool called: show_service_detail for {service_name}")
        await self._publish_event("show_service_detail", {"name": service_name})
        return f"Detailed view for {service_name} is now visible."

    @llm.ai_callable(description="Show the maneuver process diagram")
    async def show_process_diagram(self):
        logger.info("Tool called: show_process_diagram")
        await self._publish_event("show_process_diagram")
        return "Process diagram is now visible to the user."

    @llm.ai_callable(description="Hide any visible visuals and return to normal view")
    async def hide_visuals(self):
        logger.info("Tool called: hide_visuals")
        await self._publish_event("hide_visuals")
        return "Visuals are now hidden."

    @llm.ai_callable(description="Update a field in the CRM for the current lead")
    async def update_lead_field(self, 
        field: Annotated[str, "The field name (name, company, role, email, phone, problem, timeline, budget, authority, next_action)"], 
        value: Annotated[str, "The value to store"]):
        logger.info(f"Tool called: update_lead_field - {field}: {value}")
        await self.lead_store.update_field(self.lead_id, field, value)
        await self._publish_event("update_lead_field", {"field": field, "value": value})
        return f"Successfully updated {field} to {value}."

    @llm.ai_callable(description="Search the Maneuver knowledge base for answers to user questions")
    async def search_maneuver_kb(self, query: Annotated[str, "The topic or question to search for"]):
        logger.info(f"Tool called: search_maneuver_kb for '{query}'")
        result = search_kb(query)
        return f"Knowledge Base Results:\n\n{result}"

    @llm.ai_callable(description="Search the live internet for recent news, market data, or info about the user's company")
    async def web_search_for_user(self, query: Annotated[str, "The search query"]):
        logger.info(f"Tool called: web_search_for_user for '{query}'")
        results = await web_search(query)
        if not results:
            return "No results found on the web."
        
        formatted = []
        for r in results:
            formatted.append(f"Title: {r['title']}\nSnippet: {r['snippet']}\n")
        
        await self._publish_event("search_result", {"query": query, "snippet": results[0]['snippet']})
        return "\n".join(formatted)

    @llm.ai_callable(description="Finalize the call and summarize the next steps")
    async def end_call_summary(self):
        logger.info("Tool called: end_call_summary")
        lead_data = await self.lead_store.finalize(self.lead_id)
        await self._publish_event("call_ended", {"lead_id": self.lead_id, "summary": lead_data.get("next_action", "No next action set.")})
        return "Call finalized and data saved."
