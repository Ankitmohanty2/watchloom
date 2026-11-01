/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - Dark Netflix-like theme
        primary: {
          DEFAULT: '#FFD93D',
          50: '#FFFDF5',
          100: '#FFF9E0',
          200: '#FFF3C2',
          300: '#FFECA3',
          400: '#FFE685',
          500: '#FFD93D',
          600: '#F2C20D',
          700: '#C29A08',
          800: '#917305',
          900: '#614D03',
        },
        accent: {
          blue: '#0645F5',
          purple: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#06B6D4',
        },
        background: 'rgb(var(--background-rgb) / <alpha-value>)',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
        'foreground-strong': 'rgb(var(--foreground-strong-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--muted-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
        'accent-foreground': 'rgb(var(--accent-foreground-rgb) / <alpha-value>)',
        'brand-muted': 'rgb(var(--brand-muted-rgb) / <alpha-value>)',
        border: 'rgb(var(--border-rgb) / <alpha-value>)',
        card: 'rgb(var(--surface-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-alt': 'rgb(var(--surface-alt-rgb) / <alpha-value>)',
        'surface-hover': 'rgb(var(--surface-hover-rgb) / <alpha-value>)',
        hover: 'rgb(var(--hover-rgb) / <alpha-value>)',
        'dark-background': '#080D1A',
        'dark-foreground': '#FFF8E6',
        'dark-secondary': '#8E9BB5',
        'dark-border': '#1D2B45',
        'dark-card': '#0D1322',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.5rem',
        DEFAULT: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 217, 61, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 217, 61, 0.4)',
        'blue-glow': '0 0 20px rgba(6, 69, 245, 0.22)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

