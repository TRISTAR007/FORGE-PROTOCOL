import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#131417',
          raised: '#1B1D21',
        },
        surface: {
          DEFAULT: '#1C1E22',
          raised: '#24262B',
          hover: '#2A2C31',
        },
        line: {
          DEFAULT: '#2B2D33',
          faint: '#212327',
        },
        ink: {
          DEFAULT: '#F4F1EA',
          muted: '#ABADB4',
          faint: '#919299',
        },
        forge: {
          DEFAULT: '#FF6A2B',
          hover: '#FF8551',
          dim: '#3A2116',
          soft: '#472A1A',
        },
        brass: {
          DEFAULT: '#C9A15A',
          hover: '#DAB878',
          dim: '#2E2818',
        },
        ok: {
          DEFAULT: '#4ADE80',
          dim: '#173321',
        },
        danger: {
          DEFAULT: '#F2685E',
          dim: '#341A18',
        },
      },
      fontFamily: {
        display: ['var(--font-anton)', 'Impact', 'sans-serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        raised: '0 16px 40px -16px rgba(0,0,0,0.65)',
        glow: '0 0 0 1px rgba(255,106,43,0.4), 0 0 24px -4px rgba(255,106,43,0.45)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        ember: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease both',
        scaleIn: 'scaleIn 0.2s ease both',
        shimmer: 'shimmer 1.6s linear infinite',
        ember: 'ember 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
