'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Zap, Globe, Cpu, User, Briefcase, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onEnter: (name: string, role: string) => void;
  restoredName?: string;
}

const FEATURES = [
  { icon: Zap,   title: 'Zero Latency',   desc: 'Custom ML routes UI in 0ms',   color: 'var(--neon-cyan)'   },
  { icon: Globe, title: 'Live Captions',   desc: 'See every word as you speak',  color: 'var(--neon-violet)' },
  { icon: Cpu,   title: 'Neural Voice',    desc: 'Deepgram Aura · Orion voice',  color: 'var(--neon-pink)'   },
];

// Mini animated particle canvas
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const N = 60;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,255,${p.a * 0.5})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,255,${(1 - dist / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function LandingPage({ onEnter, restoredName }: LandingPageProps) {
  const [name, setName] = useState(restoredName || '');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRestore, setShowRestore] = useState(!!restoredName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    onEnter(name.trim(), role.trim());
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #02040a 0%, #06020f 50%, #02040a 100%)' }}>

      {/* Particle field */}
      <ParticleCanvas />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #7b2fff 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #00f5ff 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(0,245,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center text-center"
      >
        {/* Logo */}
        <motion.div
          className="mb-8 relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="relative w-20 h-20 mx-auto">
            {/* Spinning rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,245,255,0.3)' }}
              animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full"
              style={{ border: '1px solid rgba(123,47,255,0.2)' }}
              animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(123,47,255,0.12))',
                boxShadow: '0 0 30px rgba(0,245,255,0.25), 0 0 60px rgba(123,47,255,0.1)',
              }}>
              <span className="font-orbitron text-3xl font-black"
                style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.8)' }}>M</span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl font-orbitron font-black mb-3 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #00f5ff, #ffffff, #7b2fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          MANEUVER
        </motion.h1>

        <motion.p
          className="font-mono text-xs tracking-[0.5em] mb-2 uppercase"
          style={{ color: 'rgba(0,245,255,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          VOICE AI SYSTEM
        </motion.p>

        <motion.p
          className="font-space text-base mb-10 leading-relaxed max-w-md"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Speak directly with Husain, our AI Founder. Experience zero-latency voice discovery powered by custom ML and neural TTS.
        </motion.p>

        {/* Restored session banner */}
        <AnimatePresence>
          {showRestore && restoredName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-4 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)' }}
            >
              <span className="font-space text-white/60">Welcome back, <span style={{ color: '#00f5ff' }}>{restoredName}</span></span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowRestore(false); setName(''); }}
                  className="text-white/30 hover:text-white/60 text-xs font-space transition-colors"
                >New session</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full pl-11 pr-4 py-4 rounded-2xl font-space text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,245,255,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Your role or company (optional)"
              className="w-full pl-11 pr-4 py-4 rounded-2xl font-space text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,245,255,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="group relative w-full py-4 rounded-2xl font-orbitron font-bold text-sm tracking-widest transition-all overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: name.trim() ? 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(123,47,255,0.2))' : 'rgba(255,255,255,0.04)',
              border: name.trim() ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              boxShadow: name.trim() ? '0 0 30px rgba(0,245,255,0.15)' : 'none',
            }}
            whileHover={name.trim() ? { scale: 1.02, boxShadow: '0 0 50px rgba(0,245,255,0.3)' } : {}}
            whileTap={name.trim() ? { scale: 0.98 } : {}}
          >
            {/* Shimmer */}
            {name.trim() && (
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <div className="relative flex items-center justify-center gap-3">
              <Mic className="w-4 h-4 text-neon-cyan" />
              <span>{isSubmitting ? 'CONNECTING...' : 'SPEAK TO HUSAIN'}</span>
              {name.trim() && !isSubmitting && (
                <ArrowRight className="w-4 h-4 text-neon-cyan group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </motion.button>
        </motion.form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="group p-3 rounded-xl transition-all cursor-default"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${f.color}50`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <f.icon className="w-5 h-5 mb-2" style={{ color: f.color }} />
              <p className="font-space font-semibold text-xs text-white/80 mb-0.5">{f.title}</p>
              <p className="font-space text-[10px] text-white/30">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="mt-8 font-mono text-[10px] tracking-[0.4em] uppercase"
          style={{ color: 'rgba(255,0,110,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          System Architecture · Soumoditya Das
        </motion.p>
      </motion.div>
    </div>
  );
}
