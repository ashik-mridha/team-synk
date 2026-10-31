const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** Borders are translucent white/black so they adapt to whatever surface they sit on. */
const border = (alpha) => `rgb(var(--border) / var(${alpha}))`;

const config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['13px', '20px'],
      base: ['14px', '22px'],
      lg: ['16px', '24px'],
      xl: ['18px', '26px'],
      '2xl': ['22px', '28px'],
      '3xl': ['28px', '34px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '1.05'],
      '6xl': ['60px', '1.05'],
      '7xl': ['72px', '1'],
      '8xl': ['96px', '1'],
    },
    extend: {
      colors: {
        background: token('background'),
        sidebar: token('sidebar'),
        surface: token('surface'),
        'surface-muted': token('surface-muted'),
        elevated: token('elevated'),
        border: border('--border-alpha'),
        'border-strong': border('--border-strong-alpha'),
        foreground: token('foreground'),
        muted: token('muted'),
        subtle: token('subtle'),
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          soft: token('primary-soft'),
          solid: token('primary-solid'),
          'solid-hover': token('primary-solid-hover'),
          text: token('primary-text'),
        },
        accent: token('accent'),
        success: {
          DEFAULT: token('success'),
          soft: token('success-soft'),
          text: token('success-text'),
        },
        warning: {
          DEFAULT: token('warning'),
          soft: token('warning-soft'),
          text: token('warning-text'),
        },
        danger: {
          DEFAULT: token('danger'),
          solid: token('danger-solid'),
          soft: token('danger-soft'),
          text: token('danger-text'),
        },
        info: { DEFAULT: token('info'), soft: token('info-soft'), text: token('info-text') },
        column: {
          todo: token('column-todo'),
          progress: token('column-progress'),
          done: token('column-done'),
        },
      },
      fontFamily: {
        heading: ['var(--font-body)', 'var(--font-bengali)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-bengali)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        input: '8px',
        chip: '6px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / var(--shadow-soft))',
        raised: '0 4px 12px rgb(var(--shadow) / var(--shadow-raised))',
        overlay: '0 16px 40px rgb(var(--shadow) / var(--shadow-overlay))',
        lifted: '0 12px 28px rgb(var(--shadow) / var(--shadow-overlay))',
      },
      transitionDuration: { DEFAULT: '140ms' },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'zoom-in': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.97)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'zoom-out': {
          from: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          to: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.97)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translate(-50%, 8px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'fade-out': 'fade-out 120ms ease-in',
        'zoom-in': 'zoom-in 150ms ease-out',
        'zoom-out': 'zoom-out 120ms ease-in',
        'slide-in-right': 'slide-in-right 180ms ease-out',
        'slide-out-right': 'slide-out-right 140ms ease-in',
        'slide-in-left': 'slide-in-left 180ms ease-out',
        'slide-out-left': 'slide-out-left 140ms ease-in',
        'pop-in': 'pop-in 120ms ease-out',
        'rise-in': 'rise-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};

module.exports = config;
