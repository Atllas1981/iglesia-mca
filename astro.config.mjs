import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // <-- Revisa que esta línea esté

export default defineConfig({
  site: 'https://iglesia-mca.pages.dev',
  integrations: [react(), tailwind()], // <-- Y esta también
});