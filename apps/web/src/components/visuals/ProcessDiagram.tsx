/**
 * ProcessDiagram — Maneuver Voice AI
 * Author: Soumoditya Das <soumoditt@gmail.com>
 * Animated 5-step process timeline with 3D card hover and close button
 */
'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const STEPS = [
  { num: '01', title: 'DISCOVERY',   desc: '1–2 weeks. Deep-dive into your business, users, and market. Zero assumptions.', color: '#00f5ff' },
  { num: '02', title: 'STRATEGY',    desc: '1–2 weeks. Solution architecture, tech stack selection, and a detailed roadmap.', color: '#7b2fff' },
  { num: '03', title: 'DESIGN',      desc: '2–6 weeks. Iterative UX sprints from wireframes to developer-ready prototypes.', color: '#ff006e' },
  { num: '04', title: 'BUILD',       desc: '4–16 weeks. Agile engineering with weekly demos. You see progress every sprint.', color: '#39ff14' },
  { num: '05', title: 'LAUNCH',      desc: 'Ongoing. Monitoring, optimization, and growth loops. We don\'t disappear post-launch.', color: '#00f5ff' },
];

interface ProcessDiagramProps {
  onClose?: () => void;
}

export default function ProcessDiagram({ onClose }: ProcessDiagramProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <p className="font-mono text-[9px] tracking-widest text-neon-violet/50 uppercase mb-1">HOW WE WORK</p>
          <h2 className="font-orbitron font-black text-lg tracking-widest text-white">OUR PROCESS</h2>
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

      {/* Steps */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 relative" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(123,47,255,0.2) transparent' }}>
        {/* Vertical connector line */}
        <div
          className="absolute left-[19px] top-5 bottom-5 w-px"
          style={{ background: 'linear-gradient(to bottom, rgba(0,245,255,0.3), rgba(123,47,255,0.1))' }}
        />

        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative flex items-start gap-4 group"
          >
            {/* Step circle */}
            <div
              className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-xs shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${step.color}20, rgba(2,4,10,0.9))`,
                border: `2px solid ${step.color}50`,
                color: step.color,
                boxShadow: `0 0 0 0 ${step.color}30`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${step.color}40`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}90`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${step.color}30`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}50`;
              }}
            >
              {step.num}
            </div>

            {/* Step card */}
            <div
              className="flex-1 p-4 rounded-xl transition-all duration-300 cursor-default"
              style={{
                background: `linear-gradient(135deg, ${step.color}08, rgba(2,4,10,0.6))`,
                border: `1px solid ${step.color}20`,
                borderLeft: `3px solid ${step.color}60`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${step.color}15, rgba(2,4,10,0.8))`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}40`;
                (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${step.color}08, rgba(2,4,10,0.6))`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}20`;
                (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
              }}
            >
              <h3 className="font-orbitron font-bold text-sm text-white mb-1 tracking-wider">{step.title}</h3>
              <p className="font-space text-xs text-white/50 leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
