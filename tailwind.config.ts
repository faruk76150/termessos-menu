import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8ee',
          100: '#f9eed4',
          200: '#f2d9a3',
          300: '#e9bf6a',
          400: '#e0a43a',
          500: '#d48d22',
          600: '#b8701a',
          700: '#955218',
          800: '#7a4219',
          900: '#67381a',
          950: '#3c1d0a',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

export default config
