import { useState, useCallback, useEffect } from 'react';
import type { AgentState, TranscriptTurn } from '@/lib/types';

export function useAgent() {
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<{serverUrl: string, participantToken: string, identity: string} | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Load saved transcript from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maneuver_transcript');
      if (saved) {
        const parsed = JSON.parse(saved) as TranscriptTurn[];
        if (parsed.length > 0) {
          setTranscript(parsed.slice(-50));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const connect = useCallback(async (participantName?: string, participantId?: string) => {
    try {
      setAgentState('connecting');
      setIsReconnecting(false);
      const params = new URLSearchParams();
      if (participantName) params.set('participantName', participantName);
      if (participantId) params.set('participantId', participantId);
      
      const res = await fetch(`/api/connection-details?${params.toString()}`);
      const data = await res.json();
      if (data.serverUrl && data.participantToken) {
        setConnectionDetails({ 
          serverUrl: data.serverUrl, 
          participantToken: data.participantToken, 
          identity: data.identity 
        });
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Failed to connect:', err);
      setAgentState('idle');
    }
  }, []);

  const reconnect = useCallback(async (identity: string, name: string) => {
    setIsReconnecting(true);
    await connect(name, identity);
  }, [connect]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionDetails(null);
    setAgentState('ended');
  }, []);

  const addTranscriptTurn = useCallback((turn: TranscriptTurn) => {
    setTranscript(prev => {
      const next = [...prev, turn];
      // Persist to localStorage
      try {
        localStorage.setItem('maneuver_transcript', JSON.stringify(next.slice(-50)));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    localStorage.removeItem('maneuver_transcript');
  }, []);

  return {
    agentState,
    setAgentState,
    transcript,
    addTranscriptTurn,
    clearTranscript,
    isConnected,
    isReconnecting,
    connect,
    reconnect,
    disconnect,
    connectionDetails
  };
}
