/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        muted: 'hsl(217.2 32.6% 17.5%)',
        card: 'hsl(222.2 84% 4.9%)',
        border: 'hsl(217.2 32.6% 17.5%)',
        ring: 'hsl(212.7 26.8% 83.9%)'
      }
    }
  },
  plugins: []
}
