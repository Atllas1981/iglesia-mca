import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // <-- Revisa que esta línea esté

export default defineConfig({
  site: 'https://Atllas1981.github.io',
  base: '/iglesia-mca',
  integrations: [react(), tailwind()], // <-- Y esta también
});