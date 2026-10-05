import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
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