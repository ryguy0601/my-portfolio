import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;
  const isProtectedAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/') &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/logout';

  if (isProtectedAdminRoute) {
    const session = context.cookies.get('admin_session');
    if (session?.value !== 'authenticated_true') {
      return context.redirect('/admin/login');
    }
  }

  return next();
});