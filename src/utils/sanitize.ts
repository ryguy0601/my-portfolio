// src/utils/sanitize.ts
import { marked } from 'marked';

/**
 * Escapes HTML characters in text.
 */
function escapeHtmlInternal(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Lightweight, zero-dependency HTML sanitizer suitable for serverless / edge environments.
 * Strips script tags, iframes, objects, forms, and harmful attributes/javascript: URLs.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return html
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove object, embed, iframe, form, input, button tags and contents
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Strip on* event attributes (onclick, onerror, onload, etc.)
    .replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Strip javascript: / data: / vbscript: URLs in href/src
    .replace(/\s+(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data):.*?\2/gi, ' $1="#"');
}

/**
 * Renders Markdown to sanitized HTML. Safe to pass to `set:html` / `innerHTML`.
 */
export function renderMarkdownSafe(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const html = marked.parse(markdown, { gfm: true, breaks: true }) as string;
  return sanitizeHtml(html);
}

export { escapeHtml } from './text';
