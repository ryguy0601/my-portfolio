export interface ThemeField {
  key: string;
  label: string;
  group: string;
  type: 'color' | 'gradient' | 'range' | 'select' | 'text';
  min?: number;
  max?: number;
  unit?: string;
  description?: string;
}

// Keep the defaults in one place so the public site and admin editor always
// render the same complete set of CSS variables.
export const DEFAULT_THEME: Record<string, string> = {
  '--color-primary': '#10b981',
  '--color-primary-light': '#34d399',
  '--color-secondary': '#f59e0b',
  '--color-info': '#10b981',
  '--nav-bg': 'rgba(12, 13, 16, 0.92)',
  '--nav-color': '#f4f4f5',
  '--nav-hover-color': '#10b981',
  '--nav-active-color': '#10b981',
  '--nav-border-color': '#27272a',
  '--button-primary-hover-bg': '#059669',
  '--button-primary-hover-color': '#ffffff',
  '--button-secondary-hover-bg': '#27272a',
  '--button-secondary-hover-color': '#f4f4f5',
  '--button-hover-transform': 'translateY(0)',
  '--button-hover-transition': 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  '--button-hover-animation': 'none',
  '--color-danger': '#ef4444',
  '--color-warning': '#f59e0b',
  '--color-success': '#10b981',
  '--color-glow-blue': 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  '--body-bg': '#0c0d10',
  '--body-color': '#f4f4f5',
  '--card-bg': '#14161b',
  '--card-border-color': '#27272a',
  '--projects-bg': '#0c0d10',
  '--projects-empty-bg': '#14161b',
  '--projects-control-bg': '#14161b',
  '--projects-gradient-base': '#0c0d10',
  '--projects-card-border': '#27272a',
  '--tech-symbol-bg': '#18181b',
  '--home-background': '#0c0d10',
  '--canvas-style': 'grid',
  '--canvas-particle-primary': '#10b981',
  '--canvas-particle-secondary': '#71717a',
  '--canvas-grid-color': '#27272a',
  '--color-syntax-string': '#fbbf24',
  '--color-badge-amber': '#f59e0b',
  '--color-github-glow': '#f4f4f5',
  '--color-text-muted-light': '#a1a1aa',
  '--color-text-muted-mid': '#71717a',
  '--color-text-muted-dark': '#52525b',
  '--color-icon-muted': '#71717a',
  '--gradient-primary': '#10b981',
  '--gradient-accent': '#10b981',
  '--gradient-text': 'linear-gradient(180deg, #ffffff 0%, #d4d4d8 100%)',
  '--border-glass-card': '#27272a',
  '--border-glass-subtle': 'rgba(255, 255, 255, 0.06)',
  '--border-glass-minimal': 'rgba(255, 255, 255, 0.03)',
  '--border-glass-divider': '#27272a',
  '--color-grid-line': 'rgba(255, 255, 255, 0.03)',
  '--gradient-hero': 'linear-gradient(180deg, rgba(12, 13, 16, 0.5) 0%, rgba(12, 13, 16, 1) 100%)',
  '--radius-sm': '4px',
  '--radius-md': '6px',
  '--radius-lg': '8px',
  '--radius-xl': '10px',
  '--radius-pill': '6px',
  '--shadow-primary-button': 'none',
  '--shadow-primary-button-hover': 'none',
  '--shadow-secondary-hover': 'none',
  '--shadow-project-card': '0 10px 30px rgba(0, 0, 0, 0.45)',
  '--shadow-text': '0 1px 2px rgba(0, 0, 0, 0.8)',
  '--color-on-accent': '#09090b',
};

export const THEME_FIELDS: ThemeField[] = [
  { key: '--color-primary', label: 'Primary color', group: 'Brand', type: 'color' },
  { key: '--color-primary-light', label: 'Primary light', group: 'Brand', type: 'color' },
  { key: '--color-secondary', label: 'Secondary color', group: 'Brand', type: 'color' },
  { key: '--color-info', label: 'Info color', group: 'Brand', type: 'color' },
  { key: '--nav-bg', label: 'Navigation background', group: 'Navigation', type: 'text' },
  { key: '--nav-color', label: 'Navigation text', group: 'Navigation', type: 'color' },
  { key: '--nav-hover-color', label: 'Navigation hover color', group: 'Navigation', type: 'color' },
  { key: '--nav-active-color', label: 'Navigation active color', group: 'Navigation', type: 'color' },
  { key: '--nav-border-color', label: 'Navigation border', group: 'Navigation', type: 'color' },
  { key: '--button-primary-hover-bg', label: 'Primary hover background', group: 'Button hover', type: 'color' },
  { key: '--button-primary-hover-color', label: 'Primary hover text', group: 'Button hover', type: 'color' },
  { key: '--button-secondary-hover-bg', label: 'Secondary hover background', group: 'Button hover', type: 'color' },
  { key: '--button-secondary-hover-color', label: 'Secondary hover text', group: 'Button hover', type: 'color' },
  { key: '--button-hover-transform', label: 'Custom hover movement', group: 'Button hover', type: 'text' },
  { key: '--button-hover-animation', label: 'Hover animation preset', group: 'Button hover', type: 'select' },
  { key: '--body-bg', label: 'Page background', group: 'Surfaces', type: 'color' },
  { key: '--home-background', label: 'Home screen background', group: 'Surfaces', type: 'select' },
  { key: '--canvas-style', label: 'Canvas animation mode', group: 'Canvas', type: 'select' },
  { key: '--canvas-particle-primary', label: 'Canvas primary color', group: 'Canvas', type: 'color' },
  { key: '--canvas-particle-secondary', label: 'Canvas secondary color', group: 'Canvas', type: 'color' },
  { key: '--canvas-grid-color', label: 'Canvas grid & structure color', group: 'Canvas', type: 'color' },
  { key: '--body-color', label: 'Main text', group: 'Surfaces', type: 'color' },
  { key: '--card-bg', label: 'Card background', group: 'Surfaces', type: 'color' },
  { key: '--card-border-color', label: 'Card border', group: 'Surfaces', type: 'color' },
  { key: '--projects-bg', label: 'Projects page background', group: 'Projects', type: 'color' },
  { key: '--projects-empty-bg', label: 'Projects empty state background', group: 'Projects', type: 'color' },
  { key: '--projects-control-bg', label: 'Projects filter control background', group: 'Projects', type: 'color' },
  { key: '--projects-card-border', label: 'Projects card border', group: 'Projects', type: 'color' },
  { key: '--tech-symbol-bg', label: 'Technology symbol background', group: 'Projects', type: 'color' },
  { key: '--color-text-muted-light', label: 'Light muted text', group: 'Text', type: 'color' },
  { key: '--color-text-muted-mid', label: 'Muted text', group: 'Text', type: 'color' },
  { key: '--color-text-muted-dark', label: 'Dark muted text', group: 'Text', type: 'color' },
  { key: '--color-icon-muted', label: 'Muted icons', group: 'Text', type: 'color' },
  { key: '--color-syntax-string', label: 'Code strings', group: 'Status', type: 'color' },
  { key: '--color-success', label: 'Success', group: 'Status', type: 'color' },
  { key: '--color-warning', label: 'Warning', group: 'Status', type: 'color' },
  { key: '--color-danger', label: 'Danger', group: 'Status', type: 'color' },
  { key: '--color-glow-blue', label: 'Ambient glow', group: 'Effects', type: 'text' },
  { key: '--color-github-glow', label: 'GitHub accent', group: 'Brand', type: 'color' },
  { key: '--color-on-accent', label: 'Accent text', group: 'Brand', type: 'color' },
  { key: '--color-badge-amber', label: 'Badge accent', group: 'Status', type: 'color' },
  { key: '--gradient-primary', label: 'Primary gradient', group: 'Gradients', type: 'gradient' },
  { key: '--gradient-accent', label: 'Accent gradient', group: 'Gradients', type: 'gradient' },
  { key: '--gradient-text', label: 'Text gradient', group: 'Gradients', type: 'gradient' },
  { key: '--border-glass-card', label: 'Glass card border', group: 'Effects', type: 'color' },
  { key: '--border-glass-subtle', label: 'Subtle border', group: 'Effects', type: 'text' },
  { key: '--border-glass-minimal', label: 'Minimal border', group: 'Effects', type: 'text' },
  { key: '--border-glass-divider', label: 'Divider border', group: 'Effects', type: 'color' },
  { key: '--color-grid-line', label: 'Grid line', group: 'Effects', type: 'text' },
  { key: '--gradient-hero', label: 'Hero gradient', group: 'Gradients', type: 'text' },
  { key: '--radius-sm', label: 'Small radius', group: 'Layout', type: 'range', min: 0, max: 32, unit: 'px' },
  { key: '--radius-md', label: 'Medium radius', group: 'Layout', type: 'range', min: 0, max: 48, unit: 'px' },
  { key: '--radius-lg', label: 'Large radius', group: 'Layout', type: 'range', min: 0, max: 64, unit: 'px' },
  { key: '--radius-xl', label: 'Extra-large radius', group: 'Layout', type: 'range', min: 0, max: 96, unit: 'px' },
  { key: '--shadow-primary-button', label: 'Primary button shadow', group: 'Effects', type: 'text' },
  { key: '--shadow-primary-button-hover', label: 'Primary hover shadow', group: 'Effects', type: 'text' },
  { key: '--shadow-secondary-hover', label: 'Secondary hover shadow', group: 'Effects', type: 'text' },
  { key: '--shadow-project-card', label: 'Project card shadow', group: 'Effects', type: 'text' },
  { key: '--shadow-text', label: 'Text shadow', group: 'Effects', type: 'text' },
];

const THEME_KEYS = new Set(Object.keys(DEFAULT_THEME));
const COLOR_KEYS = new Set(THEME_FIELDS.filter((field) => field.type === 'color').map((field) => field.key));

// These variables are consumed by rgba(var(--token-rgb), ...) declarations.
const RGB_KEYS: Record<string, string> = {
  '--color-primary': '--color-primary-rgb',
  '--color-primary-light': '--color-primary-light-rgb',
  '--color-secondary': '--color-secondary-rgb',
  '--color-info': '--color-info-rgb',
  '--canvas-particle-primary': '--canvas-particle-primary-rgb',
  '--canvas-particle-secondary': '--canvas-particle-secondary-rgb',
  '--canvas-grid-color': '--canvas-grid-color-rgb',
  '--color-danger': '--color-danger-rgb',
  '--color-warning': '--color-warning-rgb',
  '--color-success': '--color-success-rgb',
  '--body-bg': '--body-bg-rgb',
  '--body-color': '--body-color-rgb',
  '--card-bg': '--card-bg-rgb',
  '--card-border-color': '--card-border-rgb',
  '--color-badge-amber': '--color-badge-amber-rgb',
  '--color-github-glow': '--color-github-glow-rgb',
};

function hexToRgb(value: string): string | null {
  const normalized = value.trim().replace('#', '');
  if (![3, 6, 8].includes(normalized.length) || !/^[0-9a-f]+$/i.test(normalized)) return null;
  const hex = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`;
}

export function sanitizeTheme(input: Record<string, unknown> | null | undefined): Record<string, string> {
  const sanitized = { ...DEFAULT_THEME };
  if (!input) return sanitized;

  // Only copy known keys and plain CSS values. This prevents arbitrary
  // properties or markup from being written into the generated style tag.
  for (const key of THEME_KEYS) {
    const value = input[key];
    if (typeof value !== 'string') continue;

    const normalized = value.trim();
    const isSafeColor = !COLOR_KEYS.has(key) || /^#[0-9a-f]{3,8}$/i.test(normalized);
    const isSafeCssValue = normalized.length > 0
      && normalized.length <= 300
      && !/[;<>{}]/.test(normalized)
      && !/(?:url|expression|@import)\s*\(/i.test(normalized);
    if (isSafeCssValue && isSafeColor) {
      sanitized[key] = normalized;
    }
  }

  // Derive RGB companions from the sanitized hex colors so rgba() styling
  // remains consistent when an administrator changes a theme color.
  for (const [colorKey, rgbKey] of Object.entries(RGB_KEYS)) {
    const rgb = hexToRgb(sanitized[colorKey]);
    if (rgb) sanitized[rgbKey] = rgb;
  }

  return sanitized;
}

export function themeStyle(theme: Record<string, string>): string {
  // Sanitize again because this helper is also safe to call with external data.
  return `:root{${Object.entries(sanitizeTheme(theme)).map(([key, value]) => `${key}:${value}!important`).join(';')}}`;
}

import { ThemeService, themeService } from '../services/themeService';

/**
 * Loads the active persisted theme from Supabase with in-memory caching and fallback to DEFAULT_THEME.
 */
export async function getPersistedTheme(
  supabaseClient: any,
  options?: { forceRefresh?: boolean; ttlMs?: number }
): Promise<Record<string, string>> {
  return ThemeService.getTheme(supabaseClient, options);
}

export { ThemeService, themeService };

