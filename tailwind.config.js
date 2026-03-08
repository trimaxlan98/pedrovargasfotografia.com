/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#1F1C17',
        'near-black': '#F7F4EE',
        surface: '#FDFCF9',
        'surface-hover': '#F1ECE2',
        ivory: '#2A2620',
        gold: '#C9A96E',
        'gold-light': '#D4B87A',
        danger: '#E05C5C',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.15em',
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [],
}
