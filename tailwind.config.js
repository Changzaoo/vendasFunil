/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        apple: {
          blue: '#0071E3',
          'blue-dark': '#0058b0',
          gray: '#F5F5F7',
          'gray-2': '#FBFBFD',
          'gray-3': '#E8E8ED',
          'gray-4': '#D2D2D7',
          text: '#1D1D1F',
          'text-2': '#424245',
          'text-3': '#6E6E73',
          'text-4': '#86868B',
          red: '#FF3B30',
          green: '#34C759',
          orange: '#FF9500',
          yellow: '#FFCC00',
          purple: '#AF52DE',
          teal: '#5AC8FA',
        },
      },
      borderRadius: {
        apple: '12px',
        'apple-sm': '8px',
        'apple-lg': '18px',
        'apple-xl': '24px',
      },
      boxShadow: {
        apple: '0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)',
        'apple-md': '0 4px 16px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.06)',
        'apple-lg': '0 8px 32px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.06)',
        'apple-xl': '0 20px 60px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.06)',
        'apple-inset': 'inset 0 0 0 1px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  safelist: [
    { pattern: /badge-(blue|green|red|orange|gray)/ },
    { pattern: /bg-apple-(blue|green|red|orange|purple|teal|yellow)/ },
    { pattern: /text-apple-(blue|green|red|orange|purple|teal|yellow)/ },
    { pattern: /border-apple-(blue|green|red|orange|purple|text-4)/ },
    { pattern: /translate-x-(1|5)/ },
  ],
  plugins: [],
}
