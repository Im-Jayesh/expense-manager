/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fafaf9',
        foreground: '#0a0a0a',
        card: '#ffffff',
        muted: {
          DEFAULT: '#f5f5f4',
          foreground: '#737373',
        },
        border: 'rgba(0, 0, 0, 0.08)',
        gold: {
          DEFAULT: '#c9a861',
          light: '#e8d5a8',
          dark: '#8b7355',
          bright: '#d4af37',
          muted: '#a0826d',
          medium: '#b8956a',
        }
      }
    },
  },
  plugins: [],
}