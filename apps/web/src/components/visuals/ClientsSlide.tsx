/**
 * ClientsSlide — Maneuver Voice AI
 * Author: Soumoditya Das <soumoditt@gmail.com>
 * Client showcase with shimmer hover, metric badges, and close button
 */
'use client';

import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, X } from 'lucide-react';

const CLIENTS = [
  { name: 'TechNova',           industry: 'FinTech',       metric: '+140% Conversion', icon: TrendingUp, color: '#00f5ff' },
  { name: 'AeroSpace Systems',  industry: 'B2B SaaS',      metric: '3× Pipeline',      icon: Award,       color: '#7b2fff' },
  { name: 'Luminary Health',    industry: 'Healthcare',    metric: '−40% CAC',         icon: TrendingUp, color: '#ff006e' },
  { name: 'Orbit Logistics',    industry: 'Supply Chain',  metric: 'Global Scale',     icon: Award,       color: '#39ff14' },
];

const STATS = [
  { value: '40+', label: 'Projects Shipped' },
  { value: '$12M', label: 'Revenue Generated' },
  { value: '98%', label: 'Client Retention' },
];

interface ClientsSlideProps {
  onClose?: () => void;
}

export default function ClientsSlide({ onClose }: ClientsSlideProps) {
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
          <p className="font-mono text-[9px] tracking-widest text-neon-cyan/50 uppercase mb-1">TRUSTED BY</p>
          <h2 className="font-orbitron font-black text-lg tracking-widest text-white">OUR CLIENTS</h2>
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

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}
          >
            <p className="font-orbitron font-black text-base text-neon-cyan">{stat.value}</p>
            <p className="font-space text-[9px] text-white/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Client cards */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,245,255,0.15) transparent' }}
      >
        {CLIENTS.map((client, i) => {
          const Icon = client.icon;
          return (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-4 rounded-2xl overflow-hidden cursor-default"
              style={{
                background: `linear-gradient(135deg, ${client.color}08, rgba(2,4,10,0.7))`,
                border: `1px solid ${client.color}20`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = `linear-gradient(135deg, ${client.color}15, rgba(2,4,10,0.9))`;
                el.style.borderColor = `${client.color}50`;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = `0 8px 30px ${client.color}15`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = `linear-gradient(135deg, ${client.color}08, rgba(2,4,10,0.7))`;
                el.style.borderColor = `${client.color}20`;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Shimmer sweep */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${client.color}10, transparent)`,
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />

              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${client.color}15`, border: `1px solid ${client.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: client.color }} />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-white transition-colors">
                      {client.name}
                    </h3>
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: `${client.color}80` }}>
                      {client.industry}
                    </span>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full font-orbitron font-bold text-xs"
                  style={{ background: `${client.color}15`, color: client.color, border: `1px solid ${client.color}30` }}
                >
                  {client.metric}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
