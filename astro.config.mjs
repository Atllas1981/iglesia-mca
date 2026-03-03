import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // CAMBIA ESTO: Pon tu usuario y el nombre del repositorio
  site: 'https://Atllas1981.github.io',
  base: 'iglesia-mca', 
  integrations: [react(), tailwind()],
});