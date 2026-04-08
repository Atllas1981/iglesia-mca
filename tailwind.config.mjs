/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'mca-blue': '#0b1f3a',
        'mca-gold': '#d4af37',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
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