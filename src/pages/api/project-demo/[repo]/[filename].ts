import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export const GET: APIRoute = async ({ params }) => {
  const repo = params.repo;
  const filename = params.filename;

  if (!repo || !filename) {
    return new Response('Not found', { status: 404 });
  }

  // Sanitize path components to prevent path traversal
  const safeRepo = path.basename(repo);
  const safeFilename = path.basename(filename);

  // Check sibling project directory first: /home/ryguy/Work/<repo>/demoPics/<filename>
  // Or relative to process.cwd(): path.resolve(process.cwd(), '..', safeRepo, 'demoPics', safeFilename)
  const candidatePaths = [
    path.resolve(process.cwd(), '..', safeRepo, 'demoPics', safeFilename),
    path.resolve(process.cwd(), 'demoPics', safeFilename), // if checking my-portfolio directly
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return new Response('Image not found', { status: 404 });
};
