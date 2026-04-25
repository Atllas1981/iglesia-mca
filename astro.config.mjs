import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://iglesia-mca.pages.dev',
  // Astro 6 gestiona automáticamente el renderizado bajo demanda al detectar el adaptador.
  integrations: [react(), tailwind()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});