// scripts/generate-og-image.mjs
//
// Renders public/favicon.svg onto a 1200x630 PNG suitable for Open Graph
// previews. LinkedIn/Twitter/Discord ignore SVG `og:image`, so the site needs a
// raster image. Run with: node scripts/generate-og-image.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'public', 'favicon.svg');
const target = path.join(root, 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 360;

const logo = await sharp(source, { density: 300 })
  .trim()
  .resize(LOGO_SIZE, LOGO_SIZE, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

// The SVG paints its mark black (its dark-mode media query is not evaluated by
// librsvg), so place it on a light card with a subtle dark vignette.
await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: { r: 15, g: 18, b: 23, alpha: 1 },
  },
})
  .composite([
    {
      input: {
        create: {
          width: 560,
          height: 560,
          channels: 4,
          background: { r: 248, g: 250, b: 252, alpha: 1 },
        },
      },
      top: Math.round((HEIGHT - 560) / 2),
      left: Math.round((WIDTH - 560) / 2),
      blend: 'over',
    },
    {
      input: logo,
      top: Math.round((HEIGHT - LOGO_SIZE) / 2),
      left: Math.round((WIDTH - LOGO_SIZE) / 2),
      blend: 'over',
    },
  ])
  .png()
  .toFile(target);

console.log(`Wrote ${path.relative(root, target)} (${WIDTH}x${HEIGHT})`);
