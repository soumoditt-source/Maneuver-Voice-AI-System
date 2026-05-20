'use client';

import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'maneuver_session';
const TRANSCRIPT_KEY = 'maneuver_transcript';

interface SessionData {
  userName: string;
  userRole: string;
  sessionId: string;
  lastSeen: number;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const data = JSON.parse(raw) as SessionData;
        // Only restore sessions less than 24 hours old
        if (Date.now() - data.lastSeen < 24 * 60 * 60 * 1000) {
          setSession(data);
        } else {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(TRANSCRIPT_KEY);
        }
      }
    } catch {
      // ignore
    }
    setIsRestored(true);
  }, []);

  const saveSession = useCallback((userName: string, userRole: string) => {
    const sessionId = localStorage.getItem(SESSION_KEY) 
      ? JSON.parse(localStorage.getItem(SESSION_KEY)!).sessionId 
      : `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const data: SessionData = { userName, userRole, sessionId, lastSeen: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
    return data;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TRANSCRIPT_KEY);
    setSession(null);
  }, []);

  const touchSession = useCallback(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      data.lastSeen = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }
  }, []);

  return { session, isRestored, saveSession, clearSession, touchSession };
}

export function usePersistentTranscript() {
  const loadTranscript = useCallback(() => {
    try {
      const raw = localStorage.getItem(TRANSCRIPT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const saveTranscript = useCallback((transcript: unknown[]) => {
    try {
      // Keep only last 50 turns to avoid storage bloat
      const trimmed = transcript.slice(-50);
      localStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(trimmed));
    } catch {
      // ignore quota errors
    }
  }, []);

  return { loadTranscript, saveTranscript };
}
