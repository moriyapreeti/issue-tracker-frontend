/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { 950: '#0B1524', 900: '#0F1B2D', 800: '#18283F', 700: '#243650', 500: '#5B6B82', 300: '#A9B4C4' },
        canvas: '#ECEFF3',
        brand: { 50: '#E5F4F3', 100: '#C6E8E6', 500: '#139A98', 600: '#0E7C7B', 700: '#0A6362' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,45,.06), 0 0 0 1px rgba(15,27,45,.05)',
        lift: '0 10px 30px -10px rgba(15,27,45,.35)',
      },
    },
  },
  plugins: [],
};
