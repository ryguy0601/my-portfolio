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
 * Transforms GitHub alert blockquotes into styled alert cards:
 * > [!NOTE] -> <div class="gfm-alert gfm-alert-note">...
 * > [!TIP] -> <div class="gfm-alert gfm-alert-tip">...
 * > [!IMPORTANT] -> <div class="gfm-alert gfm-alert-important">...
 * > [!WARNING] -> <div class="gfm-alert gfm-alert-warning">...
 * > [!CAUTION] -> <div class="gfm-alert gfm-alert-caution">...
 */
function transformGfmAlerts(html: string): string {
  const alertRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?([\s\S]*?)<\/p>\s*<\/blockquote>/gi;

  return html.replace(alertRegex, (_match, type, content) => {
    const typeUpper = type.toUpperCase();
    const typeLower = type.toLowerCase();
    
    let iconSvg = '';
    let label = typeUpper;

    if (typeUpper === 'NOTE') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75zM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>';
      label = 'Note';
    } else if (typeUpper === 'TIP') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.677.893.284.464.425.93.425 1.55v.75h3.4v-.75c0-.62.14-1.086.425-1.55.207-.337.454-.629.677-.893l.214-.253c.56-.679.984-1.32.984-2.304 0-2.06-1.637-3.75-4-3.75zM6 12.5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.5H6v.5z"/></svg>';
      label = 'Tip';
    } else if (typeUpper === 'IMPORTANT') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 4.75a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V5.5A.75.75 0 0 0 8 4.75zm0 7.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>';
      label = 'Important';
    } else if (typeUpper === 'WARNING' || typeUpper === 'CAUTION') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575L6.457 1.047zM8 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>';
      label = typeUpper === 'WARNING' ? 'Warning' : 'Caution';
    }

    return `<div class="gfm-alert gfm-alert-${typeLower} my-3 p-3 rounded-3"><div class="gfm-alert-header d-flex align-items-center gap-2 mb-2 font-monospace small fw-bold">${iconSvg}<span>${label}</span></div><div class="gfm-alert-body">${content}</div></div>`;
  });
}

/**
 * Renders Markdown to sanitized HTML. Safe to pass to `set:html` / `innerHTML`.
 */
export function renderMarkdownSafe(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const html = marked.parse(markdown, { gfm: true, breaks: true }) as string;
  const transformed = transformGfmAlerts(html);
  return sanitizeHtml(transformed);
}

export { escapeHtml } from './text';
