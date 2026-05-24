/**
 * Maneuver Voice AI — Master App Page
 * Author: Soumoditya Das <soumoditt@gmail.com>
 * Architecture: LiveKit WebRTC + Groq LLM + Deepgram STT/TTS + Custom ML
 */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, RefreshCw, Activity } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useAgent }   from '@/hooks/useAgent';
import { useRPC }     from '@/hooks/useRPC';
import { useVisuals } from '@/hooks/useVisuals';
import { useLeads }   from '@/hooks/useLeads';
import { useSession } from '@/hooks/useSession';

import LoadingScreen  from '@/components/ui/LoadingScreen';
import LandingPage    from '@/components/ui/LandingPage';
import DockMenu       from '@/components/ui/DockMenu';

import Scene          from '@/components/3d/Scene';
import MicControl, { StartCallButton } from '@/components/voice/MicControl';
import TranscriptPanel from '@/components/voice/TranscriptPanel';

import LeadPanel      from '@/components/visuals/LeadPanel';
import ServicesSlide  from '@/components/visuals/ServicesSlide';
import ProcessDiagram from '@/components/visuals/ProcessDiagram';
import ClientsSlide   from '@/components/visuals/ClientsSlide';
import AboutSlide     from '@/components/visuals/AboutSlide';

// ─── Telemetry badge ──────────────────────────────────────────────────────────
function TelemetryBadge({ agentState }: { agentState: string }) {
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    // Simulate latency display — in prod would come from RPC timing
    const base: Record<string, number> = {
      idle: 0, connecting: 0, listening: 12, thinking: 180, speaking: 95, ended: 0,
    };
    setLatency((base[agentState] || 0) + Math.floor(Math.random() * 20));
  }, [agentState]);

  if (agentState === 'idle' || agentState === 'ended') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(0,245,255,0.05)',
        border: '1px solid rgba(0,245,255,0.15)',
      }}
    >
      <Activity className="w-3 h-3 text-neon-cyan" />
      <span className="font-mono text-[10px] text-neon-cyan/70 uppercase tracking-widest">
        {agentState === 'listening' ? `STT ${latency}ms` :
         agentState === 'thinking'  ? `LLM ${latency}ms` :
         agentState === 'speaking'  ? `TTS ${latency}ms` :
         agentState === 'connecting' ? 'Connecting...' : ''}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
    </motion.div>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />;

  return (
    <motion.button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      whileHover={{ scale: 1.1, borderColor: 'rgba(0,245,255,0.4)' }}
      whileTap={{ scale: 0.92 }}
      title="Toggle theme"
    >
      {theme === 'dark'
        ? <Sun size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
        : <Moon size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />}
    </motion.button>
  );
}

// ─── Right panel content — all slides with onClose ────────────────────────────
function RightPanel({
  visualState, hideVisuals, leadData, progress,
  showServices, showClients, showAbout, showProcess,
}: {
  visualState: string;
  hideVisuals: () => void;
  leadData: any;
  progress: number;
  showServices: () => void;
  showClients: () => void;
  showAbout: () => void;
  showProcess: () => void;
}) {
  return (
    <div className="w-full h-full overflow-hidden p-5">
      <AnimatePresence mode="wait">
        {visualState === 'services_slide' && (
          <motion.div key="srv" className="w-full h-full">
            <ServicesSlide onClose={hideVisuals} />
          </motion.div>
        )}
        {visualState === 'process_diagram' && (
          <motion.div key="proc" className="w-full h-full">
            <ProcessDiagram onClose={hideVisuals} />
          </motion.div>
        )}
        {visualState === 'clients_slide' && (
          <motion.div key="cli" className="w-full h-full">
            <ClientsSlide onClose={hideVisuals} />
          </motion.div>
        )}
        {visualState === 'about_us' && (
          <motion.div key="abt" className="w-full h-full">
            <AboutSlide onClose={hideVisuals} />
          </motion.div>
        )}
        {visualState === 'none' && (
          <motion.div key="lead" className="w-full h-full">
            <LeadPanel data={leadData} progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Agent interface (must be inside LiveKitRoom) ─────────────────────────────
function AgentInterface({ agentProps }: { agentProps: ReturnType<typeof useAgent> }) {
  const { setAgentState, addTranscriptTurn, agentState, transcript, disconnect } = agentProps;

  const {
    visualState, currentService,
    showServices, showServiceDetail, showProcess,
    showClients, showAbout, hideVisuals,
  } = useVisuals();

  const { leadData, updateLeadField, progress } = useLeads();

  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTranscript = useCallback((role: 'user' | 'agent', text: string) => {
    addTranscriptTurn({ role, content: text, timestamp: Date.now().toString() });
    if (role === 'agent') {
      setIsAgentTyping(false);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    }
  }, [addTranscriptTurn]);

  const handleAgentState = useCallback((state: string) => {
    setAgentState(state as any);
    if (state === 'thinking') {
      setIsAgentTyping(true);
      typingTimer.current = setTimeout(() => setIsAgentTyping(false), 10000);
    } else if (state !== 'thinking') {
      setIsAgentTyping(false);
    }
  }, [setAgentState]);

  useRPC({
    onShowServices:     showServices,
    onShowServiceDetail: showServiceDetail,
    onShowProcess:      showProcess,
    onShowClients:      showClients,
    onShowAbout:        showAbout,
    onHideVisuals:      hideVisuals,
    onUpdateLeadField:  updateLeadField,
    onSetAgentState:    handleAgentState,
    onTranscript:       handleTranscript,
  });

  return (
    <div className="relative w-full h-full flex z-10 overflow-hidden">
      <RoomAudioRenderer volume={1.0} />

      {/* ── LEFT: Transcript + Chat ───────────────────────────── */}
      <div
        className="hidden md:flex w-[340px] h-full shrink-0 flex-col"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <TranscriptPanel transcript={transcript} isAgentTyping={isAgentTyping} />
      </div>

      {/* ── CENTER: 3D scene + Dock + Mic ────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-end pb-10 relative">
        {/* Dock — top center */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <DockMenu
            visualState={visualState as any}
            onShowServices={showServices}
            onShowClients={showClients}
            onShowAbout={showAbout}
            onShowProcess={showProcess}
            onHome={hideVisuals}
          />
        </div>

        {/* Telemetry — below dock */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <AnimatePresence>
            <TelemetryBadge agentState={agentState} />
          </AnimatePresence>
        </div>

        {/* Mic orb */}
        <div className="z-20">
          <MicControl agentState={agentState} onEndCall={disconnect} />
        </div>
      </div>

      {/* ── RIGHT: Slides + Lead panel ──────────────────────── */}
      <div
        className="hidden md:flex w-[380px] h-full shrink-0 flex-col"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
      >
        <RightPanel
          visualState={visualState}
          hideVisuals={hideVisuals}
          leadData={leadData}
          progress={progress}
          showServices={showServices}
          showClients={showClients}
          showAbout={showAbout}
          showProcess={showProcess}
        />
      </div>

      {/* ── MOBILE: Bottom drawer ─────────────────────────────── */}
      <div
        className="md:hidden absolute bottom-0 left-0 right-0 z-30 flex flex-col"
        style={{
          height: '42vh',
          background: 'rgba(2,4,10,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {visualState === 'none' && (
              <TranscriptPanel key="mob-t" transcript={transcript} isAgentTyping={isAgentTyping} />
            )}
            {visualState !== 'none' && (
              <div className="p-4 h-full overflow-y-auto" key="mob-v">
                <RightPanel
                  visualState={visualState}
                  hideVisuals={hideVisuals}
                  leadData={leadData}
                  progress={progress}
                  showServices={showServices}
                  showClients={showClients}
                  showAbout={showAbout}
                  showProcess={showProcess}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
        {/* Mobile dock */}
        <div className="flex items-center justify-center py-2 border-t border-white/5 shrink-0">
          <DockMenu
            visualState={visualState as any}
            onShowServices={showServices}
            onShowClients={showClients}
            onShowAbout={showAbout}
            onShowProcess={showProcess}
            onHome={hideVisuals}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [loading, setLoading]   = useState(true);
  const [appState, setAppState] = useState<'landing' | 'agent'>('landing');

  const agentProps = useAgent();
  const { session, isRestored, saveSession, clearSession } = useSession();

  const handleEnter = useCallback((name: string, role: string) => {
    const data = saveSession(name, role);
    setAppState('agent');
    agentProps.connect(name, data.sessionId);
  }, [saveSession, agentProps]);

  const handleNewSession = useCallback(() => {
    clearSession();
    agentProps.disconnect();
    agentProps.clearTranscript();
    // Clear all persisted state so next session is completely fresh
    localStorage.removeItem('maneuver_transcript');
    localStorage.removeItem('maneuver_session');
    setAppState('landing');
  }, [clearSession, agentProps]);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#02040a' }}
    >
      <AnimatePresence mode="wait">

        {/* ── 1. Loading screen ── */}
        {loading && (
          <motion.div key="loading" className="absolute inset-0 z-50">
            <LoadingScreen onComplete={() => setLoading(false)} />
          </motion.div>
        )}

        {/* ── 2. Landing / Intro ── */}
        {!loading && appState === 'landing' && (
          <motion.div
            key="landing"
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.6 }}
          >
            <LandingPage
              onEnter={handleEnter}
              restoredName={isRestored ? session?.userName : undefined}
            />
            <div className="absolute top-5 right-5 z-50">
              <ThemeToggle />
            </div>
          </motion.div>
        )}

        {/* ── 3. Agent Experience ── */}
        {!loading && appState === 'agent' && (
          <motion.div
            key="agent"
            className="absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {/* 3D WebGL Background */}
            <Scene agentState={agentProps.agentState} />

            {/* Top bar */}
            <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 pointer-events-none">
              {/* Brand */}
              <div className="flex items-center gap-3 pointer-events-none select-none">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(0,245,255,0.1)',
                    border: '1px solid rgba(0,245,255,0.3)',
                  }}
                  animate={{ boxShadow: ['0 0 10px rgba(0,245,255,0.2)', '0 0 25px rgba(0,245,255,0.5)', '0 0 10px rgba(0,245,255,0.2)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span
                    className="font-orbitron font-black text-sm"
                    style={{ color: '#00f5ff', textShadow: '0 0 10px rgba(0,245,255,0.8)' }}
                  >
                    M
                  </span>
                </motion.div>
                <div>
                  <p className="font-orbitron text-sm font-bold tracking-[0.2em] text-white/85">MANEUVER</p>
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,0,110,0.55)' }}>
                    by Soumoditya Das
                  </p>
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                {session?.userName && (
                  <div
                    className="px-3 py-1.5 rounded-full flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="font-space text-xs text-white/50">{session.userName}</span>
                  </div>
                )}
                <motion.button
                  onClick={handleNewSession}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  whileHover={{ scale: 1.1, borderColor: 'rgba(255,0,110,0.5)' }}
                  whileTap={{ scale: 0.92 }}
                  title="New Session"
                >
                  <RefreshCw size={13} style={{ color: 'rgba(255,255,255,0.45)' }} />
                </motion.button>
                <ThemeToggle />
              </div>
            </header>

            {/* LiveKit Room or Start Call */}
            {agentProps.isConnected && agentProps.connectionDetails ? (
              <LiveKitRoom
                serverUrl={agentProps.connectionDetails.serverUrl}
                token={agentProps.connectionDetails.participantToken}
                connect={true}
                audio={true}
                video={false}
                onDisconnected={() => {
                  // Do NOT auto-reconnect — causes greeting loop. Let user decide.
                  agentProps.disconnect();
                }}
              >
                <AgentInterface agentProps={agentProps} />
              </LiveKitRoom>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <StartCallButton
                  onStartCall={() => agentProps.connect(
                    session?.userName ?? 'Guest',
                    session?.sessionId,
                  )}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
