import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://Atllas1981.github.io',
  base: '/iglesia-mca', // <-- Agregamos el "/" aquí
  integrations: [react(), tailwind()],
});