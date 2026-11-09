import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthenticated } from './utils/auth';

/**
 * Routes that must stay reachable without an admin session.
 * Everything under /api is authenticated by default (e.g. /api/optimize-resume,
 * /api/resume-config) — EXCEPT public project demo media assets (/api/project-demo/*).
 */
const PUBLIC_PATHS = new Set<string>([
  '/admin/login',
  '/admin/logout'
]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Project demo screenshots and gifs are public assets
  if (pathname.startsWith('/api/project-demo/')) return true;
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // The GitHub Pages build is fully static — there is no server to protect, and
  // reading cookies there would touch `Astro.request.headers`, which is
  // unavailable on prerendered pages (and emit a build warning on every route).
  if (process.env.GITHUB_PAGES_BASE) {
    return next();
  }

  const pathname = new URL(context.request.url).pathname;
  const authenticated = isAdminAuthenticated(context.cookies);

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isApiRoute = pathname === '/api' || pathname.startsWith('/api/');

  if (isPublicRoute(pathname)) {
    // Already signed in? Skip the login form.
    if (pathname === '/admin/login' && authenticated && context.request.method === 'GET') {
      return context.redirect('/admin');
    }
    return next();
  }

  if ((isAdminRoute || isApiRoute) && !authenticated) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return context.redirect('/admin/login');
  }

  const response = await next();

  // Edge and Browser Caching Optimization:
  // Public HTML routes (non-admin, non-API) can be cached by the Vercel Edge Network
  // for 10 minutes with stale-while-revalidate for instantaneous edge responses.
  if (!isAdminRoute && !isApiRoute && context.request.method === 'GET') {
    if (response.status === 200 && !response.headers.has('Cache-Control')) {
      response.headers.set(
        'Cache-Control',
        'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'
      );
    }
  }

  return response;
});
