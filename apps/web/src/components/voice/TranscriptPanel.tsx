'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TranscriptTurn } from '@/lib/types';
import { MessageSquare, Send, Keyboard, X, ChevronDown } from 'lucide-react';
import { useChat, useTrackTranscription, useLocalParticipant, useRemoteParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface TranscriptPanelProps {
  transcript: TranscriptTurn[];
  isAgentTyping?: boolean;
}

export default function TranscriptPanel({ transcript, isAgentTyping = false }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const { chatMessages, send } = useChat();
  const { localParticipant } = useLocalParticipant();
  const agentParticipant = useRemoteParticipant('agent-founder');

  const localSegments = useTrackTranscription(localParticipant ? {
    participant: localParticipant,
    source: Track.Source.Microphone,
  } : undefined);

  const agentSegments = useTrackTranscription(agentParticipant ? {
    participant: agentParticipant,
    source: Track.Source.Microphone,
  } : undefined);

  const liveUserText = localSegments?.segments?.filter(s => !s.final).map(s => s.text).join(' ') || '';
  const liveAgentText = agentSegments?.segments?.filter(s => !s.final).map(s => s.text).join(' ') || '';

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, chatMessages, liveUserText, liveAgentText, isAgentTyping]);

  const allMessages = useMemo(() => {
    return [
      ...transcript.map((t, i) => ({
        id: `t-${t.timestamp}-${i}`,
        text: t.content,
        timestamp: Number(t.timestamp) || 0,
        isUser: t.role === 'user',
        source: 'voice' as const,
      })),
      ...chatMessages.map(m => ({
        id: m.id,
        text: m.message,
        timestamp: Number(m.timestamp) || 0,
        isUser: m.from?.identity !== 'agent-founder' && !m.from?.identity?.includes('agent'),
        source: 'chat' as const,
      })),
    ].sort((a, b) => a.timestamp - b.timestamp);
  }, [transcript, chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !send) return;
    await send(message.trim());
    setMessage('');
  };

  const formatTime = (ts: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col" style={{
      background: 'rgba(2, 4, 10, 0.7)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-neon-violet" />
            {allMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full flex items-center justify-center text-[7px] font-bold text-white">
                {allMessages.length > 9 ? '9+' : allMessages.length}
              </span>
            )}
          </div>
          <span className="font-orbitron text-[11px] tracking-widest text-white/70 font-semibold uppercase">
            Conversation
          </span>
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, flex: 1 }}
            exit={{ height: 0, opacity: 0 }}
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ minHeight: 0 }}
          >
            {allMessages.length === 0 && !liveUserText && !liveAgentText ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 text-center gap-3 py-12">
                <MessageSquare className="w-10 h-10 opacity-20" />
                <p className="font-space text-sm">Start speaking or type below</p>
                <p className="font-space text-xs opacity-50">Husain is listening...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {allMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest" style={{
                        color: msg.isUser ? 'rgba(0,245,255,0.5)' : 'rgba(123,47,255,0.5)'
                      }}>
                        {msg.isUser ? 'You' : 'Husain'}
                      </span>
                      {msg.source === 'chat' && (
                        <span className="text-[8px] text-white/20 font-space">(text)</span>
                      )}
                      <span className="text-[8px] text-white/20 font-mono">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className={`
                      px-4 py-2.5 max-w-[88%] text-sm leading-relaxed font-space rounded-2xl
                      ${msg.isUser ? 'bubble-user text-white' : 'bubble-agent text-white/85'}
                    `}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Live user caption in panel */}
                {liveUserText && (
                  <motion.div
                    key="live-user"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-end"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neon-cyan/50 mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping" />
                      You · live
                    </span>
                    <div className="px-4 py-2.5 max-w-[88%] text-sm leading-relaxed font-space rounded-2xl rounded-tr-sm"
                      style={{
                        background: 'rgba(0,245,255,0.06)',
                        border: '1px dashed rgba(0,245,255,0.2)',
                        color: 'rgba(255,255,255,0.5)',
                      }}>
                      {liveUserText}
                      <span className="inline-block w-0.5 h-3.5 bg-neon-cyan/60 ml-0.5 animate-pulse align-middle" />
                    </div>
                  </motion.div>
                )}

                {/* Husain typing indicator */}
                {(isAgentTyping || liveAgentText) && (
                  <motion.div
                    key="agent-typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neon-violet/50 mb-1">Husain</span>
                    {liveAgentText ? (
                      <div className="px-4 py-2.5 max-w-[88%] text-sm font-space rounded-2xl rounded-tl-sm"
                        style={{
                          background: 'rgba(123,47,255,0.06)',
                          border: '1px dashed rgba(123,47,255,0.2)',
                          color: 'rgba(255,255,255,0.5)',
                        }}>
                        {liveAgentText}
                        <span className="inline-block w-0.5 h-3.5 bg-neon-violet/60 ml-0.5 animate-pulse align-middle" />
                      </div>
                    ) : (
                      <div className="px-4 py-3 bubble-agent rounded-2xl rounded-tl-sm">
                        <div className="typing-indicator">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <AnimatePresence mode="wait">
          {!chatOpen ? (
            <motion.button
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setChatOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/30 hover:text-white/60 transition-colors text-sm font-space"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Keyboard className="w-4 h-4" />
              <span>Type a message to Husain...</span>
            </motion.button>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              onSubmit={handleSend}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Message Husain..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white font-space placeholder:text-white/25"
              />
              <motion.button
                type="submit"
                disabled={!message.trim()}
                className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 transition-all"
                style={{ background: message.trim() ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.9 }}
              >
                <Send className="w-3.5 h-3.5 text-black" />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
