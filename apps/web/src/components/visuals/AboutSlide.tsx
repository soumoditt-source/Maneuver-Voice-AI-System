/**
 * AboutSlide — Maneuver Voice AI
 * Author: Soumoditya Das <soumoditt@gmail.com>
 * About page with team profile, expertise bullets, and close button
 */
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code2, Rocket, Target, X, ExternalLink } from 'lucide-react';

const EXPERTISE = [
  { icon: Code2,   title: 'AI Engineering',   desc: 'Custom LLMs, Voice Agents, RAG pipelines', color: '#00f5ff' },
  { icon: Rocket,  title: 'Growth Systems',   desc: 'Predictive B2B lead generation at scale',  color: '#7b2fff' },
  { icon: Target,  title: 'Conversion Ops',   desc: 'High-ticket automated sales closing',       color: '#ff006e' },
];

const MILESTONES = [
  '2020 — Founded in Bangalore, India',
  '2022 — First $1M ARR milestone',
  '2024 — Expanded to 3 continents',
  '2026 — Launched Maneuver Voice AI',
];

interface AboutSlideProps {
  onClose?: () => void;
}

export default function AboutSlide({ onClose }: AboutSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <p className="font-mono text-[9px] tracking-widest text-neon-pink/50 uppercase mb-1">WHO WE ARE</p>
          <h2 className="font-orbitron font-black text-lg tracking-widest text-white">MANEUVER</h2>
        </div>
        {onClose && (
          <motion.button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-5 pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,0,110,0.15) transparent' }}
      >
        {/* Tagline card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,0,110,0.1), rgba(123,47,255,0.1))',
            border: '1px solid rgba(255,0,110,0.2)',
          }}
        >
          <p className="font-space text-sm text-white/75 leading-relaxed">
            We are a tactical Go-To-Market engineering firm. We don't just run ads —  
            we build <span style={{ color: '#00f5ff' }}>autonomous revenue engines</span> that compound over time.
            Founded by AI engineers and growth experts with a bias for speed.
          </p>
        </motion.div>

        {/* Core Expertise */}
        <div>
          <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase mb-3">CORE EXPERTISE</p>
          <div className="space-y-2">
            {EXPERTISE.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-default group"
                  style={{
                    background: `${item.color}08`,
                    border: `1px solid ${item.color}20`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `${item.color}15`;
                    el.style.borderColor = `${item.color}40`;
                    el.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `${item.color}08`;
                    el.style.borderColor = `${item.color}20`;
                    el.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-sm text-white">{item.title}</h4>
                    <p className="font-space text-[10px] text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase mb-3">JOURNEY</p>
          <div className="space-y-2">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00f5ff' }} />
                <p className="font-space text-xs text-white/50">{m}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
