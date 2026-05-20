import { RPCEvent } from './types';

export const RPC_EVENTS = {
  SHOW_SERVICES: 'show_services_slide',
  SHOW_SERVICE_DETAIL: 'show_service_detail',
  SHOW_PROCESS: 'show_process_diagram',
  SHOW_CLIENTS: 'show_clients',
  SHOW_ABOUT: 'about_us',
  HIDE_VISUALS: 'hide_visuals',
  UPDATE_LEAD_FIELD: 'update_lead_field',
  SET_AGENT_STATE: 'set_agent_state',
  CALL_ENDED: 'call_ended',
  SEARCH_RESULT: 'search_result',
} as const;

export function parseRPCEvent(payload: Uint8Array): RPCEvent | null {
  try {
    const text = new TextDecoder().decode(payload);
    const data = JSON.parse(text);
    return data as RPCEvent;
  } catch (err) {
    console.error('Failed to parse RPC event:', err);
    return null;
  }
}
