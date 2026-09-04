import { defineConfig, passthroughImageService } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://iglesia-mca.pages.dev',
  output: 'server',
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
  vite: {
    optimizeDeps: {
      exclude: ['cloudflare:workers']
    },
    ssr: {
      external: ['cloudflare:workers']
    },
    build: {
      rollupOptions: {
        external: ['cloudflare:workers']
      }
    }
  }
});