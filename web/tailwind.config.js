/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ethiopia: {
          green: '#009b44',
          yellow: '#fed100',
          red: '#ef3340',
          blue: '#0055a5',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Noto Sans Ethiopic', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
