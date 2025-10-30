/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
        },
        secondary: {
          yellow: '#FFB703',
          green: '#06D6A0',
        },
        text: {
          dark: '#1D1D1D',
        },
        bg: {
          light: '#FFF8F0',
          'icon-peach': '#FFE4D9',
          'icon-yellow': '#FFF1C7',
          'icon-green': '#E7FFF7',
          testimonials: '#FFF3E7',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'ui-sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
        lato: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
    },
  },
  plugins: [],
};