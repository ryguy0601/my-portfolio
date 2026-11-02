import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthenticated } from './utils/auth';

/**
 * Routes that must stay reachable without an admin session.
 * Everything under /api is authenticated by default — new API routes are
 * protected automatically instead of silently shipping as public endpoints.
 */
const PUBLIC_PATHS = new Set<string>([
  '/admin/login',
  '/admin/logout'
]);

export const onRequest = defineMiddleware((context, next) => {
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

  if (PUBLIC_PATHS.has(pathname)) {
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

  return next();
});
