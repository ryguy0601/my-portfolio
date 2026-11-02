// src/utils/text.ts

/**
 * Escapes the five HTML-significant characters. Kept dependency-free so it can
 * be imported from client-side bundles without pulling in a DOM implementation.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts a string title into a clean URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Splits multiline string text into an array of clean bullet points.
 */
export function splitLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Formats Markdown bold syntax (**text** or __text__) into HTML <strong> tags.
 * Input is HTML-escaped first so this is safe to use with `set:html`.
 */
export function formatMarkdownBold(text: string | null | undefined): string {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/gs, '<strong class="fw-bold">$1</strong>')
    .replace(/__(.*?)__/gs, '<strong class="fw-bold">$1</strong>')
    .replace(/\r?\n/g, '<br />');
}

/**
 * Splits comma-separated values into a clean trimmed string array.
 */
export function splitCommaList(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
