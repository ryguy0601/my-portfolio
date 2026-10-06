// src/utils/auth.ts

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_COOKIE_VALUE = 'authenticated_true';

export interface CookieJar {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: any): void;
  delete(name: string, options?: any): void;
}

/**
 * Checks if the current request has a valid admin session cookie.
 */
export function isAdminAuthenticated(cookies: CookieJar): boolean {
  const session = cookies.get(ADMIN_COOKIE_NAME);
  return session?.value === ADMIN_COOKIE_VALUE;
}

/**
 * Sets the admin session cookie upon successful authentication.
 */
export function setAdminSession(cookies: CookieJar): void {
  cookies.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  });
}

/**
 * Deletes the admin session cookie on logout.
 */
export function clearAdminSession(cookies: CookieJar): void {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
}
