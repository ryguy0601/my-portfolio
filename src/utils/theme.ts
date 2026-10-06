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
  '--color-primary': '#e83e9f',
  '--color-primary-light': '#ff79c6',
  '--color-secondary': '#9b5de5',
  '--color-info': 'var(--color-primary)',
  '--nav-bg': 'rgba(26, 13, 36, 0.85)',
  '--nav-color': '#fff5fc',
  '--nav-hover-color': '#9b5de5',
  '--nav-active-color': '#e83e9f',
  '--nav-border-color': 'rgba(75, 36, 95, 0.8)',
  '--button-primary-hover-bg': '#f05ab0',
  '--button-primary-hover-color': '#ffffff',
  '--button-secondary-hover-bg': '#b778f0',
  '--button-secondary-hover-color': '#160b20',
  '--button-hover-transform': 'translateY(-2px)',
  '--button-hover-transition': 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease',
  '--button-hover-animation': 'lift',
  '--color-danger': '#ff5252',
  '--color-warning': '#ffc107',
  '--color-success': '#34d399',
  '--color-glow-blue': 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
  '--body-bg': '#0d0712',
  '--body-color': '#fff5fc',
  '--card-bg': '#1a0d24',
  '--card-border-color': '#4b245f',
  '--projects-bg': '#0a101b',
  '--projects-empty-bg': '#111a2a',
  '--projects-control-bg': '#111a2a',
  '--projects-gradient-base': '#0a101b',
  '--projects-card-border': 'var(--border-glass-card)',
  '--tech-symbol-bg': 'var(--card-bg)',
  '--home-background': 'linear-gradient(135deg, rgba(13, 7, 18, 0.88) 0%, rgba(26, 13, 36, 0.88) 52%, rgba(18, 9, 29, 0.88) 100%)',
  '--canvas-style': 'particles',
  '--canvas-particle-primary': '#e83e9f',
  '--canvas-particle-secondary': '#9b5de5',
  '--canvas-grid-color': '#e83e9f',
  '--color-syntax-string': '#ff9fda',
  '--color-badge-amber': '#f5a6d5',
  '--color-github-glow': 'var(--color-primary)',
  '--color-text-muted-light': '#dec4dc',
  '--color-text-muted-mid': '#a889a8',
  '--color-text-muted-dark': '#6c536f',
  '--color-icon-muted': '#a889a8',
  '--gradient-primary': 'linear-gradient(135deg, #e83e9f 0%, #ff79c6 100%)',
  '--gradient-accent': 'linear-gradient(135deg, #e83e9f 0%, #9b5de5 100%)',
  '--gradient-text': 'linear-gradient(135deg, #ff79c6 10%, #b778f0 90%)',
  '--border-glass-card': 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
  '--border-glass-subtle': 'rgba(255, 255, 255, 0.08)',
  '--border-glass-minimal': 'rgba(255, 255, 255, 0.04)',
  '--border-glass-divider': 'rgba(232, 62, 159, 0.2)',
  '--color-grid-line': 'rgba(255, 255, 255, 0.025)',
  '--gradient-hero': 'linear-gradient(180deg, rgba(13, 7, 18, 0.5) 0%, rgba(13, 7, 18, 1) 100%)',
  '--radius-sm': '6px',
  '--radius-md': '0.5rem',
  '--radius-lg': '1rem',
  '--radius-xl': '1.25rem',
  '--radius-pill': '9999px',
  '--shadow-primary-button': '0 4px 15px rgba(232, 62, 159, 0.3)',
  '--shadow-primary-button-hover': '0 6px 20px rgba(232, 62, 159, 0.5)',
  '--shadow-secondary-hover': '0 8px 25px rgba(155, 93, 229, 0.2)',
  '--shadow-project-card': '0 25px 80px rgba(0, 0, 0, 0.35), inset 0 1px rgba(255, 255, 255, 0.04)',
  '--shadow-text': '0 2px 4px rgba(0, 0, 0, 0.8)',
  '--color-on-accent': '#ffffff',
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
  { key: '--nav-border-color', label: 'Navigation border', group: 'Navigation', type: 'text' },
  { key: '--button-primary-hover-bg', label: 'Primary hover background', group: 'Button hover', type: 'color' },
  { key: '--button-primary-hover-color', label: 'Primary hover text', group: 'Button hover', type: 'color' },
  { key: '--button-secondary-hover-bg', label: 'Secondary hover background', group: 'Button hover', type: 'color' },
  { key: '--button-secondary-hover-color', label: 'Secondary hover text', group: 'Button hover', type: 'color' },
  { key: '--button-hover-transform', label: 'Custom hover movement', group: 'Button hover', type: 'text' },
  { key: '--button-hover-animation', label: 'Hover animation preset', group: 'Button hover', type: 'select' },
  { key: '--body-bg', label: 'Page background', group: 'Surfaces', type: 'color' },
  { key: '--home-background', label: 'Home screen background', group: 'Surfaces', type: 'select' },
  { key: '--canvas-style', label: 'Home canvas style', group: 'Surfaces', type: 'select' },
  { key: '--canvas-particle-primary', label: 'Canvas primary color', group: 'Canvas', type: 'color' },
  { key: '--canvas-particle-secondary', label: 'Canvas secondary color', group: 'Canvas', type: 'color' },
  { key: '--canvas-grid-color', label: 'Canvas grid color', group: 'Canvas', type: 'color' },
  { key: '--body-color', label: 'Main text', group: 'Surfaces', type: 'color' },
  { key: '--card-bg', label: 'Card background', group: 'Surfaces', type: 'color' },
  { key: '--card-border-color', label: 'Card border', group: 'Surfaces', type: 'color' },
  { key: '--projects-card-border', label: 'Projects card border', group: 'Projects', type: 'text' },
  { key: '--tech-symbol-bg', label: 'Technology symbol background', group: 'Projects', type: 'text' },
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
  { key: '--border-glass-card', label: 'Glass card border', group: 'Effects', type: 'text' },
  { key: '--border-glass-subtle', label: 'Subtle border', group: 'Effects', type: 'text' },
  { key: '--border-glass-minimal', label: 'Minimal border', group: 'Effects', type: 'text' },
  { key: '--border-glass-divider', label: 'Divider border', group: 'Effects', type: 'text' },
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
  '--color-secondary': '--color-secondary-rgb',
  '--canvas-particle-primary': '--canvas-particle-primary-rgb',
  '--canvas-particle-secondary': '--canvas-particle-secondary-rgb',
  '--canvas-grid-color': '--canvas-grid-color-rgb',
  '--color-danger': '--color-danger-rgb',
  '--color-warning': '--color-warning-rgb',
  '--color-success': '--color-success-rgb',
  '--body-bg': '--body-bg-rgb',
  '--card-bg': '--card-bg-rgb',
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

/**
 * Loads the active persisted theme from Supabase with fallback to DEFAULT_THEME.
 */
export async function getPersistedTheme(supabaseClient: any): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabaseClient
      .from('site_theme')
      .select('variables')
      .eq('id', 'default')
      .maybeSingle();
    if (error) throw error;
    return sanitizeTheme(data?.variables);
  } catch (error) {
    console.error('Unable to load persisted theme:', error);
    return { ...DEFAULT_THEME };
  }
}

