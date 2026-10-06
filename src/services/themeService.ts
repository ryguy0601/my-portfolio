// src/services/themeService.ts
import { DEFAULT_THEME, sanitizeTheme, themeStyle } from '../utils/theme';
export { DEFAULT_THEME, sanitizeTheme, themeStyle } from '../utils/theme';

export interface ThemeCacheOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
}

export interface ThemeCacheStats {
  isCached: boolean;
  ageMs: number;
  ttlMs: number;
  hits: number;
  misses: number;
  lastUpdated: string | null;
}

/**
 * Service for loading, caching, persisting, and resetting portfolio visual themes.
 * Eliminates redundant Supabase database queries by serving persisted themes from memory cache.
 */
export class ThemeService {
  private static cachedTheme: Record<string, string> | null = null;
  private static cachedTimestamp: number = 0;
  // Default TTL: 15 minutes (900,000 ms)
  private static defaultTtlMs: number = 15 * 60 * 1000;
  private static cacheHits: number = 0;
  private static cacheMisses: number = 0;

  /**
   * Retrieves the active theme. If a valid cached theme exists and is within TTL,
   * it returns the cached theme immediately without querying Supabase.
   */
  static async getTheme(
    supabaseClient: any,
    options: ThemeCacheOptions = {}
  ): Promise<Record<string, string>> {
    const ttl = options.ttlMs ?? this.defaultTtlMs;
    const now = Date.now();

    // Cache Hit: Serve immediately from memory
    if (
      !options.forceRefresh &&
      this.cachedTheme &&
      now - this.cachedTimestamp < ttl
    ) {
      this.cacheHits++;
      return { ...this.cachedTheme };
    }

    // Cache Miss or Force Refresh: Fetch from Supabase
    this.cacheMisses++;
    try {
      const { data, error } = await supabaseClient
        .from('site_theme')
        .select('variables')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;

      const theme = sanitizeTheme(data?.variables);
      this.cachedTheme = theme;
      this.cachedTimestamp = now;
      return { ...theme };
    } catch (error) {
      console.error('Unable to load persisted theme from Supabase, serving cached or default:', error);
      if (this.cachedTheme) {
        return { ...this.cachedTheme };
      }
      return { ...DEFAULT_THEME };
    }
  }

  /**
   * Persists a theme to Supabase and immediately updates the in-memory cache.
   */
  static async saveTheme(
    supabaseClient: any,
    submittedVariables: Record<string, unknown>
  ): Promise<{ success: boolean; theme: Record<string, string>; error?: any }> {
    try {
      const safeTheme = sanitizeTheme(submittedVariables);
      const { error } = await supabaseClient
        .from('site_theme')
        .upsert({
          id: 'default',
          variables: safeTheme,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Prime the in-memory cache immediately so all subsequent page requests receive updated tokens
      this.setCachedTheme(safeTheme);
      return { success: true, theme: safeTheme };
    } catch (error) {
      console.error('Failed to save theme to database:', error);
      return {
        success: false,
        theme: this.cachedTheme || { ...DEFAULT_THEME },
        error,
      };
    }
  }

  /**
   * Resets the theme to DEFAULT_THEME in the database and updates the cache.
   */
  static async resetTheme(
    supabaseClient: any
  ): Promise<{ success: boolean; theme: Record<string, string>; error?: any }> {
    try {
      const { error } = await supabaseClient
        .from('site_theme')
        .upsert({
          id: 'default',
          variables: DEFAULT_THEME,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      this.setCachedTheme(DEFAULT_THEME);
      return { success: true, theme: { ...DEFAULT_THEME } };
    } catch (error) {
      console.error('Failed to reset theme in database:', error);
      return {
        success: false,
        theme: { ...DEFAULT_THEME },
        error,
      };
    }
  }

  /**
   * Sets or primes the in-memory cache directly.
   */
  static setCachedTheme(theme: Record<string, string>): void {
    this.cachedTheme = sanitizeTheme(theme);
    this.cachedTimestamp = Date.now();
  }

  /**
   * Invalidates the in-memory cache to force the next request to query the database.
   */
  static invalidateCache(): void {
    this.cachedTheme = null;
    this.cachedTimestamp = 0;
  }

  /**
   * Returns whether a fresh in-memory cache is currently active.
   */
  static isCacheValid(ttlMs?: number): boolean {
    const ttl = ttlMs ?? this.defaultTtlMs;
    return Boolean(this.cachedTheme && Date.now() - this.cachedTimestamp < ttl);
  }

  /**
   * Synchronously returns the currently cached theme, or DEFAULT_THEME if not yet loaded.
   */
  static getCachedTheme(): Record<string, string> {
    return this.cachedTheme ? { ...this.cachedTheme } : { ...DEFAULT_THEME };
  }

  /**
   * Generates a CSS style tag rule string from a theme object.
   */
  static generateThemeStyle(theme: Record<string, string>): string {
    return themeStyle(theme);
  }

  /**
   * Returns cache diagnostics for debugging or administrative monitoring.
   */
  static getCacheStats(): ThemeCacheStats {
    const now = Date.now();
    return {
      isCached: Boolean(this.cachedTheme),
      ageMs: this.cachedTimestamp ? now - this.cachedTimestamp : 0,
      ttlMs: this.defaultTtlMs,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      lastUpdated: this.cachedTimestamp ? new Date(this.cachedTimestamp).toISOString() : null,
    };
  }
}

export const themeService = new ThemeService();
