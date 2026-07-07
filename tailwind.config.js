/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f8f8f8',
          100: '#ebebeb',
          200: '#e0e0e0',
          300: '#c8c8c8',
          400: '#8a8a8a',
          500: '#707070',
          600: '#4d4d4d',
          700: '#2a2a2a',
          800: '#111111',
          900: '#171717',
        },
        develop: '#0a72ef',
        preview: '#de1d8d',
        ship: '#ff5b4f',
        destructive: '#ff5b4f',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '6px',
        lg: '8px',
      },
      boxShadow: {
        'vercel-card': 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px',
        focus: '0 0 0 2px #0a72ef',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}