import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          primary: '#050816',
          secondary: '#0B1026',
          accent: '#6D5DF6',
          glow: '#6CF6FF',
          highlight: '#FFFFFF',
          nebula: '#7A4DFF',
          galaxy: '#3E74FF',
          cyan: '#7AF5FF',
          gold: '#FFD76A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        glass: '20px',
        'glass-lg': '28px',
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(108, 246, 255, 0.45)',
        'glow-strong': '0 0 48px -8px rgba(109, 93, 246, 0.65)',
        float: '0 24px 60px -24px rgba(0, 0, 0, 0.85)',
      },
      backdropBlur: {
        glass: '18px',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        radar: {
          '0%': { transform: 'scale(0.35)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        breathe: 'breathe 6s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
        radar: 'radar 2.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
