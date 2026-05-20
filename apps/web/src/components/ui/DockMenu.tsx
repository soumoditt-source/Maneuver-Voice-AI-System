'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, Info, Workflow, MessageSquare, Home, X } from 'lucide-react';
import type { VisualState } from '@/lib/types';

interface DockMenuProps {
  visualState: VisualState;
  onShowServices: () => void;
  onShowClients: () => void;
  onShowAbout: () => void;
  onShowProcess: () => void;
  onHome: () => void;
}

const DOCK_ITEMS = [
  { id: 'none', label: 'Dashboard', icon: Home },
  { id: 'services_slide', label: 'Services', icon: Layers },
  { id: 'clients_slide', label: 'Clients', icon: Users },
  { id: 'about_us', label: 'About', icon: Info },
  { id: 'process_diagram', label: 'Process', icon: Workflow },
];

export default function DockMenu({ visualState, onShowServices, onShowClients, onShowAbout, onShowProcess, onHome }: DockMenuProps) {
  const handlers: Record<string, () => void> = {
    none: onHome,
    services_slide: onShowServices,
    clients_slide: onShowClients,
    about_us: onShowAbout,
    process_diagram: onShowProcess,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-1 px-3 py-2 dock-menu"
    >
      {DOCK_ITEMS.map((item, i) => {
        const Icon = item.icon;
        const isActive = visualState === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={handlers[item.id]}
            className={`dock-item group relative ${isActive ? 'active' : ''}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-space tracking-wide">{item.label}</span>
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/90 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white whitespace-nowrap font-space">
                {item.label}
              </div>
            </div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="dock-active"
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.3)' }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
