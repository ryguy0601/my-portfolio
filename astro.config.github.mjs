import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://ryguy0601.github.io',
  base: process.env.GITHUB_PAGES_BASE || '/my-portfolio',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
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