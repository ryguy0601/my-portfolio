import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// GitHub Pages is a static host: this endpoint cannot run there, so it must not
// be prerendered (it needs no output) — and must not be server-rendered either
// (no adapter in that build). Returning no paths skips it entirely.
// The Vercel deployment keeps it on-demand.
export const prerender = false;

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

/** Rejects path segments that could traverse out of an allowed root. */
function isSafeSegment(segment: string): boolean {
  if (!segment) return false;
  if (segment === '.' || segment === '..') return false;
  if (segment.includes('/') || segment.includes('\\')) return false;
  if (segment.includes('\0')) return false;
  return true;
}

/** True only when `target` is the root itself or lives underneath it. */
function isWithinRoot(target: string, root: string): boolean {
  const normalizedRoot = path.resolve(root);
  const normalizedTarget = path.resolve(target);
  return (
    normalizedTarget === normalizedRoot ||
    normalizedTarget.startsWith(normalizedRoot + path.sep)
  );
}

export const GET: APIRoute = async ({ params }) => {
  const repo = params.repo;
  const filename = params.filename;

  if (!repo || !filename || !isSafeSegment(repo) || !isSafeSegment(filename)) {
    return new Response('Not found', { status: 404 });
  }

  // Extension allowlist: never serve non-image files even from an allowed root.
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_MAP[ext];
  if (!contentType) {
    return new Response('Not found', { status: 404 });
  }

  // Allowed roots: the sibling project directory's demoPics/ folder, and the
  // local demoPics/ folder inside this project.
  const allowedRoots = [
    path.resolve(process.cwd(), '..', repo, 'demoPics'),
    path.resolve(process.cwd(), 'demoPics'),
  ];

  for (const root of allowedRoots) {
    const candidate = path.resolve(root, filename);
    if (!isWithinRoot(candidate, root)) continue;

    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const fileBuffer = fs.readFileSync(candidate);
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch {
      // Missing file — keep looking at the next candidate.
    }
  }

  // Fallback for production / serverless environments where local files are not on disk:
  // Fetch directly from the repository's demoPics on GitHub (main or master branch)
  const branches = ['main', 'master'];
  for (const branch of branches) {
    try {
      const remoteUrl = `https://raw.githubusercontent.com/ryguy0601/${encodeURIComponent(repo)}/${branch}/demoPics/${encodeURIComponent(filename)}`;
      const remoteRes = await fetch(remoteUrl);
      if (remoteRes.ok) {
        const arrayBuffer = await remoteRes.arrayBuffer();
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      }
    } catch {
      // Continue to next branch
    }
  }

  return new Response('Image not found', { status: 404 });
};
