/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        warm: {
          50:  '#faf8f5',
          100: '#f3efe8',
          200: '#e8dfd2',
          300: '#d4c4a8',
          400: '#b89f7a',
          500: '#a08560',
          600: '#8b7050',
          700: '#725a42',
          800: '#5e4a38',
          900: '#1a1612',
          950: '#0f0d0b',
        },
      },
    },
  },
  plugins: [],
}
