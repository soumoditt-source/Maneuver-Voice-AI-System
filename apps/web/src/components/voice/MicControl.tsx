'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Play } from 'lucide-react';
import type { AgentState } from '@/lib/types';
import { useVoiceAssistant, useLocalParticipant } from '@livekit/components-react';

interface MicControlProps {
  agentState: AgentState;
  onEndCall: () => void;
}

const STATE_CONFIG = {
  idle:       { label: 'STANDBY',     color: 'rgba(255,255,255,0.3)', ring: '#ffffff40' },
  connecting: { label: 'CONNECTING',  color: '#00f5ff',               ring: '#00f5ff40' },
  listening:  { label: 'LISTENING',   color: '#00f5ff',               ring: '#00f5ff60' },
  thinking:   { label: 'THINKING',    color: '#7b2fff',               ring: '#7b2fff50' },
  speaking:   { label: 'SPEAKING',    color: '#ff006e',               ring: '#ff006e50' },
  ended:      { label: 'ENDED',       color: 'rgba(255,255,255,0.2)', ring: '#ffffff20' },
};

export default function MicControl({ agentState, onEndCall }: MicControlProps) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const cfg = STATE_CONFIG[agentState] || STATE_CONFIG.idle;

  const toggleMic = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (e) { console.error(e); }
  };

  const bars = [0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.4, 0.7, 1.0, 0.5, 0.8];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* State label */}
      <motion.div
        key={agentState}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <motion.span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: cfg.color }}
          animate={agentState === 'listening' || agentState === 'speaking'
            ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
            : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </motion.div>

      {/* Main orb button */}
      <div className="relative">
        {/* Outer ambient ring */}
        <motion.div
          className="absolute inset-0 rounded-full -m-4"
          style={{ border: `1px solid ${cfg.ring}` }}
          animate={['listening','speaking','thinking'].includes(agentState)
            ? { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }
            : { scale: 1, opacity: 0.2 }
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-0 rounded-full -m-8"
          style={{ border: `1px solid ${cfg.ring}` }}
          animate={['listening','speaking','thinking'].includes(agentState)
            ? { scale: [1, 1.12, 1], opacity: [0.2, 0.5, 0.2] }
            : { scale: 1, opacity: 0.1 }
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Waveform bars (visible while listening or speaking) */}
        <AnimatePresence>
          {(agentState === 'listening' || agentState === 'speaking') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-[2px]"
            >
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    background: agentState === 'speaking' ? 'var(--neon-pink)' : 'var(--neon-cyan)',
                    minHeight: 4,
                  }}
                  animate={{ height: [`${h * 20}px`, `${(1 - h) * 20 + 4}px`, `${h * 20}px`] }}
                  transition={{
                    duration: 0.4 + i * 0.05,
                    repeat: Infinity,
                    delay: i * 0.04,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core orb */}
        <motion.button
          onClick={toggleMic}
          className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${cfg.color}30, transparent 70%), rgba(2,4,10,0.6)`,
            border: `2px solid ${isMicrophoneEnabled ? cfg.color : '#ef444470'}`,
            boxShadow: isMicrophoneEnabled
              ? `0 0 30px ${cfg.ring}, 0 0 60px ${cfg.ring}, inset 0 0 20px ${cfg.ring}`
              : '0 0 20px rgba(239,68,68,0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          animate={agentState === 'speaking'
            ? { scale: [1, 1.04, 1] }
            : { scale: 1 }
          }
          transition={{ duration: 0.6, repeat: agentState === 'speaking' ? Infinity : 0 }}
        >
          {/* Shimmer on speaking */}
          {agentState === 'speaking' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(255,0,110,0.15), transparent)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <AnimatePresence mode="wait">
            {isMicrophoneEnabled ? (
              <motion.div key="mic-on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Mic className="w-10 h-10" style={{ color: cfg.color }} />
              </motion.div>
            ) : (
              <motion.div key="mic-off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <MicOff className="w-10 h-10 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mic toggle label */}
      <span className="font-space text-[10px] text-white/30 mt-10">
        {isMicrophoneEnabled ? 'Tap to mute' : 'Tap to unmute'}
      </span>

      {/* End call button */}
      <motion.button
        onClick={onEndCall}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-red-400 transition-all"
        style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
        whileHover={{
          background: 'rgba(239,68,68,0.2)',
          borderColor: 'rgba(239,68,68,0.6)',
          scale: 1.02,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <PhoneOff className="w-4 h-4" />
        <span className="font-mono text-xs tracking-widest uppercase">End Session</span>
      </motion.button>
    </div>
  );
}

export function StartCallButton({ onStartCall }: { onStartCall: () => void }) {
  return (
    <motion.button
      onClick={onStartCall}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="group relative flex items-center gap-4 px-10 py-5 rounded-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,47,255,0.15))',
        border: '1px solid rgba(0,245,255,0.4)',
        boxShadow: '0 0 40px rgba(0,245,255,0.2), 0 0 80px rgba(123,47,255,0.1)',
      }}
      whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(0,245,255,0.4), 0 0 120px rgba(123,47,255,0.2)' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1px solid rgba(0,245,255,0.3)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,245,255,0.2)' }}>
        <Play className="w-5 h-5 text-neon-cyan ml-0.5" fill="currentColor" />
      </div>
      <div className="relative text-left">
        <p className="font-orbitron font-bold text-xl text-white tracking-wider">SPEAK TO HUSAIN</p>
        <p className="font-space text-xs text-white/40 mt-0.5">AI Founder · Maneuver</p>
      </div>
    </motion.button>
  );
}
