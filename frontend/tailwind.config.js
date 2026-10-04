/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14202B', soft: '#3D4B58', muted: '#66768A' },
        brand: { DEFAULT: '#0E6B5C', dark: '#0A4F44', light: '#E3F2EF', mid: '#2C8F7E' },
        marigold: { DEFAULT: '#F5B301', dark: '#D69A00', light: '#FFF4CC' },
        sale: { DEFAULT: '#D64545', light: '#FDECEC' },
        surface: { DEFAULT: '#F3F5F6', alt: '#E8ECEE' },
        line: '#DDE3E7',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,32,43,0.06), 0 4px 14px rgba(20,32,43,0.05)',
        pop: '0 10px 30px rgba(20,32,43,0.16)',
      },
      borderRadius: { xl: '14px' },
    },
  },
  plugins: [],
};
