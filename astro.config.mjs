import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

import sentry from '@sentry/astro';

export default defineConfig({
  site: 'https://your-domain.com',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    sentry({
      dsn: 'https://683044f4edd65407160fd61683caa1b7@o4510464560988160.ingest.de.sentry.io/4510464568787024',
      // Disable server-side Sentry (not compatible with Cloudflare Workers)
      enabled: {
        client: true,
        server: false,
      },
      sourceMapsUploadOptions: {
        project: 'javascript-astro',
        org: 'painless-removals',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      },
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['nanostores', '@libsql/client', 'resend'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    build: {
      sourcemap: false,
    },
  },
});