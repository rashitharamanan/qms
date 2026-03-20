export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lavender: { DEFAULT: '#6D28D9', light: '#8B5CF6', dark: '#4C1D95', pale: '#F5F3FF' },
        primary: { DEFAULT: '#6D28D9', light: '#8B5CF6', dark: '#4C1D95' }
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'] }
    }
  },
  plugins: []
}
