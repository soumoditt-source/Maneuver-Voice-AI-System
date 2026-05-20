'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_STAGES = [
  'Initializing Neural Core...',
  'Connecting Voice Engine...',
  'Loading Alex Chen AI...',
  'System Online.',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stages = [600, 1100, 1700, 2200];
    const timers: NodeJS.Timeout[] = [];

    stages.forEach((delay, i) => {
      timers.push(setTimeout(() => {
        setStage(i);
        setProgress(((i + 1) / LOADING_STAGES.length) * 100);
      }, delay));
    });

    timers.push(setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 600);
    }, 3200));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#02040a] overflow-hidden"
        >
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            animation: 'float 8s ease-in-out infinite',
          }} />

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)' }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-violet/10 blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-neon-cyan/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Central M logo */}
          <div className="relative mb-12">
            {/* Outer spinning ring */}
            <motion.div
              className="absolute inset-0 -m-8 rounded-full border border-neon-cyan/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.4))' }}
            />
            {/* Inner counter-spinning ring */}
            <motion.div
              className="absolute inset-0 -m-4 rounded-full border border-neon-violet/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Pulsing dots on ring */}
            {[0, 90, 180, 270].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-neon-cyan rounded-full"
                style={{
                  top: '50%', left: '50%',
                  transformOrigin: '0 0',
                  transform: `rotate(${deg}deg) translate(40px, -50%)`,
                  filter: 'drop-shadow(0 0 4px rgba(0,245,255,0.8))',
                }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}

            {/* M Logo */}
            <motion.div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,47,255,0.15))',
                border: '1px solid rgba(0,245,255,0.4)',
                boxShadow: '0 0 30px rgba(0,245,255,0.3), 0 0 60px rgba(123,47,255,0.15)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="font-orbitron text-4xl font-black text-neon-cyan" style={{ textShadow: '0 0 20px rgba(0,245,255,0.8)' }}>
                M
              </span>
            </motion.div>
          </div>

          {/* Brand name */}
          <motion.h1
            className="font-orbitron text-4xl font-black tracking-[0.4em] mb-2 uppercase"
            style={{ color: 'rgba(255,255,255,0.95)', textShadow: '0 0 40px rgba(0,245,255,0.3)' }}
            initial={{ opacity: 0, letterSpacing: '1em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            MANEUVER
          </motion.h1>

          <motion.p
            className="font-mono text-xs tracking-[0.5em] text-neon-cyan/60 mb-16 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            VOICE AI SYSTEM v3.0
          </motion.p>

          {/* Loading bar */}
          <div className="w-72 relative">
            <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-violet))' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Progress glow */}
            <motion.div
              className="absolute top-0 h-[1px] w-8 rounded-full"
              style={{ background: 'rgba(0,245,255,0.9)', filter: 'blur(4px)', top: '0px' }}
              animate={{ left: `${Math.max(0, progress - 5)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />

            {/* Status text */}
            <motion.p
              key={stage}
              className="text-center font-mono text-xs text-white/40 mt-4 tracking-widest"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {LOADING_STAGES[stage]}
            </motion.p>
          </div>

          {/* Corner decorations */}
          {[
            'top-8 left-8 border-t-2 border-l-2 rounded-tl-lg',
            'top-8 right-8 border-t-2 border-r-2 rounded-tr-lg',
            'bottom-8 left-8 border-b-2 border-l-2 rounded-bl-lg',
            'bottom-8 right-8 border-b-2 border-r-2 rounded-br-lg',
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`absolute w-8 h-8 border-neon-cyan/40 ${cls}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.3 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
