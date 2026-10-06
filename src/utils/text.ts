// src/utils/text.ts

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
 * Splits comma-separated values into a clean trimmed string array.
 */
export function splitCommaList(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
