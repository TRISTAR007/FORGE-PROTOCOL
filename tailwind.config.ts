import type { Config } from 'tailwindcss';

/*
 * Level Up Dojo theme — "night dojo": deep indigo surfaces, hot-pink
 * primary, gold + aqua accents.
 *
 * Token names are historical (the app began as "FORGE Protocol"):
 *   forge = primary accent (hot pink)   brass = gold accent
 * They are kept so the ~70 components using them didn't need renaming;
 * only the values changed.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0C0A1D',
          raised: '#130F2A',
        },
        surface: {
          DEFAULT: '#16122E',
          raised: '#1E1940',
          hover: '#262050',
        },
        line: {
          DEFAULT: '#2E2758',
          faint: '#1E1A3B',
        },
        ink: {
          DEFAULT: '#F6F2FF',
          muted: '#BDB5E0',
          faint: '#9C94C6',
        },
        forge: {
          DEFAULT: '#FF4D94',
          hover: '#FF75AE',
          dim: '#3A1534',
          soft: '#4D1B45',
        },
        brass: {
          DEFAULT: '#FFC94A',
          hover: '#FFD877',
          dim: '#33290F',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          dim: '#2A1E52',
        },
        aqua: {
          DEFAULT: '#3DE3F5',
          dim: '#0F2F3A',
        },
        ok: {
          DEFAULT: '#4ADE80',
          dim: '#12301F',
        },
        danger: {
          DEFAULT: '#FF6B7A',
          dim: '#3A1520',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF4D94 0%, #8B5CF6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFC94A 0%, #FF8A3D 100%)',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -14px rgba(8,4,30,0.8)',
        raised: '0 18px 44px -16px rgba(8,4,30,0.85)',
        glow: '0 0 0 1px rgba(255,77,148,0.35), 0 0 26px -4px rgba(255,77,148,0.5)',
        'glow-violet': '0 0 0 1px rgba(139,92,246,0.35), 0 0 30px -4px rgba(139,92,246,0.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          // `none` (not translateY(0)): with fill-mode `both` the final frame sticks, and any
          // lingering transform would trap position:fixed children inside the page column.
          '100%': { opacity: '1', transform: 'none' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        ember: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: '1' },
          '100%': {
            transform: 'translate3d(var(--confetti-drift, 0px), 105vh, 0) rotate(var(--confetti-rotate, 720deg))',
            opacity: '0.9',
          },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.85' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Coach animations
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.025)' },
        },
        hype: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
          '25%': { transform: 'translateY(-10px) rotate(-2deg) scale(1.03)' },
          '50%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
          '75%': { transform: 'translateY(-6px) rotate(2deg) scale(1.02)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-3px)' },
          '40%, 80%': { transform: 'translateX(3px)' },
        },
        auraPulse: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(0.96)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease both',
        scaleIn: 'scaleIn 0.2s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        ember: 'ember 2.4s ease-in-out infinite',
        confetti: 'confetti 3s cubic-bezier(0.2, 0.6, 0.4, 1) forwards',
        pulseRing: 'pulseRing 1s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        hype: 'hype 0.9s ease-in-out infinite',
        shake: 'shake 0.35s ease-in-out infinite',
        auraPulse: 'auraPulse 1.6s ease-in-out infinite',
        pop: 'pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.3) both',
        spinSlow: 'spinSlow 40s linear infinite',
        slideUp: 'slideUp 0.4s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
