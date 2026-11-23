/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17241d',
        forest: '#285844',
        moss: '#3f745c',
        lime: '#d9f479',
        cream: '#f6f7f1',
        lavender: '#e5e0ff',
        peach: '#ffd7b5',
        line: '#dfe5db',
      },
      fontFamily: {
        sans: ['Inter', 'Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      boxShadow: {
        soft: '0 18px 55px rgba(23, 36, 29, 0.08)',
        card: '0 8px 30px rgba(23, 36, 29, 0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
