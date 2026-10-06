import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthenticated } from './utils/auth';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isProtectedAdminRoute =
    (pathname === '/admin' || pathname.startsWith('/admin/')) &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/logout';

  if (isProtectedAdminRoute && !isAdminAuthenticated(context.cookies)) {
    return context.redirect('/admin/login');
  }

  return next();
});