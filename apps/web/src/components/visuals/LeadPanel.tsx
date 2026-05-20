'use client';

import { motion } from 'framer-motion';
import type { LeadData } from '@/lib/types';
import { User, Building, Briefcase, Mail, Phone, Target, Clock, DollarSign, Users, ArrowRight } from 'lucide-react';

interface LeadPanelProps {
  data: LeadData;
  progress: number;
}

const fields = [
  { key: 'name', label: 'Name', icon: User },
  { key: 'company', label: 'Company', icon: Building },
  { key: 'role', label: 'Role', icon: Briefcase },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'problem', label: 'Core Problem', icon: Target },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'budget', label: 'Budget', icon: DollarSign },
  { key: 'authority', label: 'Decision Maker', icon: Users },
  { key: 'next_action', label: 'Next Steps', icon: ArrowRight },
] as const;

export default function LeadPanel({ data, progress }: LeadPanelProps) {
  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-orbitron text-neon-cyan tracking-widest text-sm">LIVE DISCOVERY</h3>
        <span className="font-space text-xs text-neon-cyan/70">{progress}% Captured</span>
      </div>

      <div className="w-full bg-white/5 rounded-full h-1.5 mb-8 overflow-hidden">
        <motion.div 
          className="bg-neon-cyan h-full rounded-full shadow-[0_0_10px_#00f5ff]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {fields.map((f) => {
          const value = data[f.key as keyof LeadData];
          const isFilled = value !== null && value !== '';
          
          return (
            <motion.div 
              key={f.key}
              layout
              initial={{ opacity: 0.5 }}
              animate={{ opacity: isFilled ? 1 : 0.4 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                isFilled ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className={`mt-0.5 ${isFilled ? 'text-neon-cyan' : 'text-white/30'}`}>
                <f.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-space text-[10px] uppercase tracking-wider text-white/50 mb-1">
                  {f.label}
                </p>
                {isFilled ? (
                  <p className="font-inter text-sm text-white/90 leading-tight">
                    {value as string}
                  </p>
                ) : (
                  <div className="h-4 flex items-center">
                    <span className="flex gap-1">
                      <motion.span className="w-1 h-1 bg-white/20 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
                      <motion.span className="w-1 h-1 bg-white/20 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} />
                      <motion.span className="w-1 h-1 bg-white/20 rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} />
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
