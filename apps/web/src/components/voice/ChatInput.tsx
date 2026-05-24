'use client';

import { useState } from 'react';
import { useChat } from '@livekit/components-react';
import { Send, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput() {
  const { send } = useChat();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await send(message);
    setMessage('');
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="open-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="mx-auto flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-black/10 dark:border-white/20 hover:border-neon-cyan/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-black/80 dark:text-white/80 bg-white/50 dark:bg-transparent"
          >
            <Keyboard className="w-5 h-5" />
            <span className="font-space tracking-wider text-sm">Type Message</span>
          </motion.button>
        ) : (
          <motion.form
            key="chat-form"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full glass-panel p-2 rounded-full border border-black/10 dark:border-neon-cyan/30 bg-white/90 dark:bg-space/80 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,245,255,0.1)] focus-within:border-neon-cyan focus-within:shadow-[0_0_25px_rgba(0,245,255,0.2)] transition-all"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-3 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors rounded-full"
            >
              <Keyboard className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to Husain..."
              className="flex-1 bg-transparent border-none outline-none text-black dark:text-white font-space placeholder:text-black/30 dark:placeholder:text-white/30"
              autoFocus
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-3 bg-neon-cyan text-white dark:text-space rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black dark:hover:bg-white transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
