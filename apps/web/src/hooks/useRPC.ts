import { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { parseRPCEvent, RPC_EVENTS } from '@/lib/rpc-events';

interface UseRPCOptions {
  onShowServices: () => void;
  onShowServiceDetail: (name: string) => void;
  onShowProcess: () => void;
  onShowClients: () => void;
  onShowAbout: () => void;
  onHideVisuals: () => void;
  onUpdateLeadField: (field: string, value: string) => void;
  onSetAgentState: (state: string) => void;
  onTranscript: (role: 'user' | 'agent', text: string) => void;
}

export function useRPC(options: UseRPCOptions) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleData = (payload: Uint8Array, participant?: any) => {
      const event = parseRPCEvent(payload);
      if (!event) return;

      console.log('Received RPC event:', event);

      switch (event.event) {
        case RPC_EVENTS.SHOW_SERVICES:
          options.onShowServices();
          break;
        case RPC_EVENTS.SHOW_SERVICE_DETAIL:
          options.onShowServiceDetail(event.data.name as string);
          break;
        case RPC_EVENTS.SHOW_PROCESS:
          options.onShowProcess();
          break;
        case RPC_EVENTS.SHOW_CLIENTS:
          options.onShowClients();
          break;
        case RPC_EVENTS.SHOW_ABOUT:
          options.onShowAbout();
          break;
        case RPC_EVENTS.HIDE_VISUALS:
          options.onHideVisuals();
          break;
        case RPC_EVENTS.UPDATE_LEAD_FIELD:
          options.onUpdateLeadField(event.data.field as string, event.data.value as string);
          break;
        case RPC_EVENTS.SET_AGENT_STATE:
          options.onSetAgentState(event.data.state as string);
          break;
        case 'transcript':
          options.onTranscript(event.data.role as 'user' | 'agent', event.data.text as string);
          break;
      }
    };

    room.on('dataReceived', handleData);
    
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [room, options]);
}
