/**
 * ServicesSlide — Maneuver Voice AI
 * Author: Soumoditya Das <soumoditt@gmail.com>
 * 3D flip-card services panel with proper layout and close button
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Smartphone, TrendingUp, Cpu, PenTool, Zap, X, ArrowLeft } from 'lucide-react';

const SERVICES = [
  {
    icon: Layers,
    name: 'Product Strategy',
    short: 'Market fit & roadmapping',
    desc: 'Deep market research, PMF validation, competitive analysis, and a clear product roadmap from idea to launch.',
    color: '#00f5ff',
    tag: 'STRATEGY',
  },
  {
    icon: PenTool,
    name: 'UX/UI Design',
    short: 'End-to-end design systems',
    desc: 'From wireframes to pixel-perfect high-fidelity prototypes. Design systems, user research, and accessibility.',
    color: '#7b2fff',
    tag: 'DESIGN',
  },
  {
    icon: Smartphone,
    name: 'Web & Mobile Dev',
    short: 'Full-stack engineering',
    desc: 'React, Next.js, React Native, Node.js. Production-grade code with CI/CD, testing, and observability.',
    color: '#ff006e',
    tag: 'ENGINEERING',
  },
  {
    icon: TrendingUp,
    name: 'Growth Marketing',
    short: 'Scale your acquisition',
    desc: 'SEO, paid acquisition, conversion rate optimization, and analytics. Data-driven growth loops.',
    color: '#39ff14',
    tag: 'GROWTH',
  },
  {
    icon: Cpu,
    name: 'AI Integration',
    short: 'Custom ML & Voice AI',
    desc: 'Custom ML models, LLM pipelines, Voice AI systems, and real-time AI agents like the one you\'re talking to.',
    color: '#00f5ff',
    tag: 'AI / ML',
  },
  {
    icon: Zap,
    name: 'Brand & Comms',
    short: 'Identity & positioning',
    desc: 'Brand identity, messaging strategy, content creation, and positioning that cuts through the noise.',
    color: '#7b2fff',
    tag: 'BRAND',
  },
];

interface ServiceCardProps {
  service: typeof SERVICES[0];
  index: number;
}

function ServiceCard({ service, index }: ServiceCardProps) {
  const [flipped, setFlipped] = useState(false);
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="relative h-[120px] cursor-pointer"
      style={{ perspective: '800px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-2xl p-4 flex items-center gap-4 group"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, ${service.color}10, rgba(2,4,10,0.8))`,
            border: `1px solid ${service.color}30`,
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = `${service.color}70`;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${service.color}20, 0 0 40px ${service.color}10`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = `${service.color}30`;
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${service.color}15`, border: `1px solid ${service.color}30` }}
          >
            <Icon className="w-6 h-6" style={{ color: service.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{ color: service.color, background: `${service.color}15` }}
              >
                {service.tag}
              </span>
            </div>
            <h3 className="font-space font-bold text-sm text-white leading-tight">{service.name}</h3>
            <p className="font-space text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{service.short}</p>
          </div>
          <div className="shrink-0 text-white/20 text-xs font-mono">TAP ↺</div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl p-4 flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${service.color}20, rgba(2,4,10,0.95))`,
            border: `1px solid ${service.color}50`,
            boxShadow: `0 0 30px ${service.color}20`,
          }}
        >
          <p className="font-space text-xs text-white/70 leading-relaxed">{service.desc}</p>
          <p className="font-mono text-[9px] mt-2" style={{ color: `${service.color}80` }}>
            TAP TO FLIP BACK
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ServicesSlideProps {
  onClose?: () => void;
}

export default function ServicesSlide({ onClose }: ServicesSlideProps) {
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
          <p className="font-mono text-[9px] tracking-widest text-neon-cyan/50 uppercase mb-1">WHAT WE DO</p>
          <h2 className="font-orbitron font-black text-lg tracking-widest text-white">OUR EXPERTISE</h2>
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

      <p className="font-space text-xs text-white/40 mb-4 shrink-0">Tap any card to learn more ↺</p>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,245,255,0.2) transparent' }}>
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.name} service={s} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
