import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // Used for canonical URLs and og:* meta tags. Override with SITE_URL when the
  // deployment lives somewhere else.
  site: process.env.SITE_URL || 'https://www.ryancuccurullo.com',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  security: {
    checkOrigin: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Silence Bootstrap's internal Sass deprecation warnings
          silenceDeprecations: [
            'color-functions', 
            'global-builtin', 
            'if-function', 
            'import', 
            'mixed-decls'
          ]
        }
      }
    }
  }
});