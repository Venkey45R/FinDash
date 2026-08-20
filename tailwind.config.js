/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['variant', '&:where(.dark, .dark *)'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'brand': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
        },
        'danger': {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        'surface': '#f8f9fc',
        'card': '#f4f5f7',
      },
    },
  },
  plugins: [],
}
