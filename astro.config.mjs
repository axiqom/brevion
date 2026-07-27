import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// GitHub Pages project site lives at /brevion; local + sticky preview stay at /.
const isPages =
  process.env.GITHUB_PAGES === '1' || process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://axiqom.github.io',
  base: isPages ? '/brevion' : '/',
  integrations: [tailwind(), react()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 4321),
    allowedHosts: true,
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  devToolbar: { enabled: false },
});
