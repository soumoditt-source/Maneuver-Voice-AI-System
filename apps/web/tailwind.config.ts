import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f5ff',
          violet: '#7b2fff',
          pink: '#ff006e',
          green: '#39ff14',
        },
        space: '#02040a'
      },
      fontFamily: {
        space: ['var(--font-space-grotesk)', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(to right, #00f5ff, #7b2fff)',
        'space-gradient': 'linear-gradient(to bottom, #02040a, #0a0b10)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 245, 255, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.8)' },
        },
        'scan-line': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        }
      }
    },
  },
  plugins: [],
}
export default config
