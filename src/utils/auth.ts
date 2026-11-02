// src/utils/auth.ts
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_MFA_INIT_COOKIE = 'admin_mfa_init';

/** Session lifetime: 8 hours. */
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface CookieJar {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: any): void;
  delete(name: string, options?: any): void;
}

function readEnv(key: string): string {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  const fromImport = (import.meta as any).env?.[key];
  return String(fromProcess || fromImport || '').trim();
}

/**
 * Resolves the HMAC key used to sign session cookies.
 *
 * Prefers an explicit `ADMIN_SESSION_SECRET`. Falls back to a key derived from
 * the admin password + MFA secret so existing deployments keep working without
 * a new environment variable (a warning is logged so it gets fixed).
 */
function getSigningKey(): string {
  const explicit = readEnv('ADMIN_SESSION_SECRET');
  if (explicit.length >= 16) return explicit;

  const password = readEnv('ADMIN_PASSWORD');
  const mfa = readEnv('ADMIN_MFA_SECRET');
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not set; cannot sign admin sessions.');
  }

  console.warn(
    '[auth] ADMIN_SESSION_SECRET is not set — deriving the session signing key from ' +
      'ADMIN_PASSWORD/ADMIN_MFA_SECRET. Set ADMIN_SESSION_SECRET to a long random value ' +
      'so rotating your password does not invalidate sessions unexpectedly.'
  );
  return `portfolio-session:${password}:${mfa}`;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

function sign(payload: string): string {
  return base64url(createHmac('sha256', getSigningKey()).update(payload).digest());
}

/**
 * Creates a signed, expiring session token of the form `<payload>.<signature>`.
 * The payload contains only an issue time, expiry time and a random nonce, so
 * the token cannot be guessed or forged without the server-side signing key.
 */
export function createAdminSessionToken(now: number = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const payload = base64url(
    JSON.stringify({
      iat: issuedAt,
      exp: issuedAt + SESSION_TTL_SECONDS,
      nonce: randomBytes(12).toString('hex')
    })
  );
  return `${payload}.${sign(payload)}`;
}

/**
 * Verifies signature and expiry of a session token.
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  if (!payload || !providedSignature) return false;

  let expectedSignature: string;
  try {
    expectedSignature = sign(payload);
  } catch {
    return false;
  }

  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(provided, expected)) return false;

  let parsed: { iat?: number; exp?: number };
  try {
    parsed = JSON.parse(fromBase64url(payload).toString('utf8'));
  } catch {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (typeof parsed.exp !== 'number' || parsed.exp <= nowSeconds) return false;
  if (typeof parsed.iat !== 'number' || parsed.iat > nowSeconds + 300) return false;

  return true;
}

/**
 * Checks if the current request has a valid, unexpired, correctly signed admin session cookie.
 */
export function isAdminAuthenticated(cookies: CookieJar): boolean {
  return verifyAdminSessionToken(cookies.get(ADMIN_COOKIE_NAME)?.value);
}

/**
 * Sets the signed admin session cookie upon successful authentication.
 */
export function setAdminSession(cookies: CookieJar): void {
  cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
}

/**
 * Deletes the admin session cookie on logout.
 */
export function clearAdminSession(cookies: CookieJar): void {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
}

/**
 * Stores the in-progress MFA enrolment secret server-side (in an httpOnly cookie)
 * so the setup QR code stays stable across re-renders and is never taken from the form.
 */
export function setPendingMfaSecret(cookies: CookieJar, secret: string): void {
  cookies.set(ADMIN_MFA_INIT_COOKIE, secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60
  });
}

export function getPendingMfaSecret(cookies: CookieJar): string {
  return cookies.get(ADMIN_MFA_INIT_COOKIE)?.value || '';
}

export function clearPendingMfaSecret(cookies: CookieJar): void {
  cookies.delete(ADMIN_MFA_INIT_COOKIE, { path: '/' });
}

/**
 * Very small in-memory login throttle. Serverless instances each keep their own
 * counter, so this is defence-in-depth rather than a hard guarantee.
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function getLoginThrottle(identifier: string): { blocked: boolean; retryAfterSeconds: number } {
  const entry = loginAttempts.get(identifier);
  if (!entry) return { blocked: false, retryAfterSeconds: 0 };
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(identifier);
    return { blocked: false, retryAfterSeconds: 0 };
  }
  if (entry.count < LOGIN_MAX_ATTEMPTS) return { blocked: false, retryAfterSeconds: 0 };
  return {
    blocked: true,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000))
  };
}

export function recordLoginFailure(identifier: string): void {
  const entry = loginAttempts.get(identifier);
  const now = Date.now();
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(identifier: string): void {
  loginAttempts.delete(identifier);
}
