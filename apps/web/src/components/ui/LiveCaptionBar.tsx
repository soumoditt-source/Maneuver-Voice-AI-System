'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';

interface LiveCaptionBarProps {
  liveUserText: string;
  liveAgentText: string;
  isListening: boolean;
}

export default function LiveCaptionBar({ liveUserText, liveAgentText, isListening }: LiveCaptionBarProps) {
  const hasContent = !!(liveUserText || liveAgentText);

  return (
    <AnimatePresence>
      {hasContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 right-0 z-30 caption-bar px-6 py-3 pointer-events-none"
        >
          {liveUserText && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Mic className="w-3.5 h-3.5 text-neon-cyan" />
                <span className="font-mono text-[10px] text-neon-cyan/70 uppercase tracking-widest">You</span>
                {/* Pulse indicator */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
                </span>
              </div>
              <p className="font-space text-sm text-white/80 truncate">
                {liveUserText}
                <span className="inline-block w-1 h-4 bg-neon-cyan/80 ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          )}
          {liveAgentText && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <Volume2 className="w-3.5 h-3.5 text-neon-violet" />
                <span className="font-mono text-[10px] text-neon-violet/70 uppercase tracking-widest">Alex</span>
              </div>
              <p className="font-space text-sm text-white/80 truncate">
                {liveAgentText}
                <span className="inline-block w-1 h-4 bg-neon-violet/80 ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
