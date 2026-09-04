/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'mca-blue': '#0b1f3a',
        'mca-gold': '#d4af37',
        // Color institucional primario
        'mca-primary': {
          DEFAULT: '#0c2243',
          50:  '#e8edf4',
          100: '#c5d0e3',
          200: '#9fb0cf',
          300: '#7890bb',
          400: '#5a76ac',
          500: '#3d5c9d',
          600: '#2a4480',
          700: '#1a2f63',
          800: '#0c2243',
          900: '#061223',
        },
      },
      fontFamily: {
        // Fuente global (alinea con var(--font-sans))
        sans: ['Open Sauce Sans', 'sans-serif'],
        // Fuente destacada — clase `font-display` (alinea con var(--font-display))
        display: ['Satoshi', 'sans-serif'],
      },

      // --- AÑADE ESTO DESDE AQUÍ ---
      keyframes: {
        gradient: {
          '0%': { 'background-position': '0% center' },
          '100%': { 'background-position': '200% center' },
        },
      },
      animation: {
        gradient: 'gradient 3s linear infinite',
      },
      // --- HASTA AQUÍ ---
    },
  },
  plugins: [],
}