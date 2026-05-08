export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Elegant Plum + Lavender — brbymary.com color panel
        // Circle 1: #5C3D6E  deep plum
        // Circle 2: #8B7BAA  medium lavender
        // Circle 3: #BBA99B  warm taupe
        // Circle 4: #E8E2F0  soft white-lavender
        lavender: {
          DEFAULT: '#8B7BAA',
          light:   '#E8E2F0',
          dark:    '#5C3D6E',
          pale:    '#F2EEF8',
        },
        primary: {
          DEFAULT: '#5C3D6E',
          light:   '#8B7BAA',
          dark:    '#3D2654',
        },
        purple: {
          50:  '#F2EEF8',
          100: '#E8E2F0',   // soft white-lavender — circle 4
          200: '#D0C5E4',
          300: '#BBA99B',   // warm taupe          — circle 3
          400: '#8B7BAA',   // medium lavender     — circle 2
          500: '#7A6A9A',
          600: '#5C3D6E',   // deep plum           — circle 1
          700: '#4A2D5C',
          800: '#3D2654',   // darkest
          900: '#2A1840',
        },
        taupe: {
          DEFAULT: '#BBA99B',
          light:   '#D4C8BC',
          dark:    '#9A8880',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'bounce-slow': 'bounceSlow 2.4s ease-in-out infinite',
      },
      keyframes: {
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    }
  },
  plugins: []
}
