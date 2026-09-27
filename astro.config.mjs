import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
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