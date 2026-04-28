import { defineConfig, passthroughImageService } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://iglesia-mca.pages.dev',
  output: 'server', // <--- AÑADE ESTA LÍNEA
  image: {
    service: passthroughImageService()
  },
  integrations: [react(), tailwind()],
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
    },
  }),
});