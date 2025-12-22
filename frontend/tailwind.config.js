/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5E6D3',
          100: '#E8D5B7',
          200: '#D9C5A0',
          300: '#C9B99B',
          400: '#B8A082',
          500: '#A68F6F',
          600: '#8B7556',
          700: '#6B5A42',
          800: '#4A3E2E',
          900: '#2A2118',
        },
        nude: {
          50: '#F5E6D3',
          100: '#E8DCC6',
          200: '#D9C5A0',
          300: '#C4A882',
          400: '#B8A082',
          500: '#A68F6F',
        },
        beige: {
          50: '#F5E6D3',
          100: '#E8D5B7',
          200: '#D4C4A8',
          300: '#C9B99B',
          400: '#B8A082',
          500: '#8B7556',
        },
      },
    },
  },
  plugins: [],
}

