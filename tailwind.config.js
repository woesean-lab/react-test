/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '3px',
      DEFAULT: '3px',
      md: '3px',
      lg: '3px',
      xl: '3px',
      '2xl': '3px',
      '3xl': '3px',
      full: '3px',
    },
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: {
          900: '#0b0f19',
          800: '#0f1625',
          700: '#11192d',
        },
        accent: {
          100: '#c5f3ff',
          200: '#8ae8ff',
          400: '#3ac7ff',
          500: '#2b9fff',
          600: '#1a7bd8',
        },
      },
      boxShadow: {
        glow: '0 10px 50px -12px rgba(58, 199, 255, 0.35)',
        card: '0 20px 70px -28px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
