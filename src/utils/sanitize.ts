// src/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

/** Tags we are willing to render from untrusted Markdown/README content. */
const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'code', 'col', 'colgroup',
  'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li',
  'mark', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul'
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'colspan', 'rowspan',
  'align', 'start', 'width', 'height', 'target', 'rel', 'loading'
];

/**
 * Sanitizes an HTML string, stripping scripts, event handlers, javascript: URLs
 * and any other markup that could execute in the browser.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
  });
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
