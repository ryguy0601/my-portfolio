// src/utils/url.ts

/**
 * Normalizes the Astro BASE_URL guaranteeing a trailing slash.
 */
export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Returns the admin dashboard URL based on environment or baseUrl.
 */
export function getAdminUrl(): string {
  return import.meta.env.PUBLIC_ADMIN_URL || `${getBaseUrl()}admin`;
}

/**
 * Returns the public portfolio URL.
 */
export function getPortfolioUrl(): string {
  return import.meta.env.PUBLIC_PORTFOLIO_URL || getBaseUrl();
}
