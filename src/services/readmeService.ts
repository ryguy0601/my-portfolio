// src/services/readmeService.ts

export interface ReadmeResolution {
  rawUrl: string;
  rawBase: string;
  owner?: string;
  repo?: string;
  branch?: string;
  path?: string;
  originalUrl: string;
}

export interface ReadmeFetchOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  allowFallbackBranches?: boolean;
}

export interface ReadmeFetchResult {
  success: boolean;
  markdown: string | null;
  rawUrl: string;
  charCount: number;
  error?: string;
  sourceRepo?: string;
}

/** Default cap on a single README fetch so a slow host cannot hang a request. */
const DEFAULT_README_TIMEOUT_MS = 8000;

/** In-memory cache for fetched READMEs (10-minute TTL) to avoid redundant GitHub API requests. */
interface ReadmeCacheEntry {
  result: ReadmeFetchResult;
  fetchedAt: number;
}
const README_CACHE = new Map<string, ReadmeCacheEntry>();
const README_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Service for detecting, resolving, fetching, and sanitizing GitHub and remote README documents.
 */
export class ReadmeService {
  /**
   * Detects whether a string is a single URL pointing to a GitHub repository, blob, or raw README markdown file.
   */
  static isReadmeUrl(text: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    if (trimmed.includes('\n') || trimmed.includes(' ')) return false;
    return /^https?:\/\/(?:github\.com\/[^/\s]+\/[^/\s]+(?:\/.*)?|raw\.githubusercontent\.com\/[^\s]+|gist\.githubusercontent\.com\/[^\s]+|.*\.md)$/i.test(trimmed);
  }

  /**
   * Converts any GitHub repository, blob, or raw URL into a directly fetchable raw README URL
   * along with its base directory for resolving relative images.
   */
  static resolveReadmeUrl(inputUrl: string): ReadmeResolution {
    const trimmed = inputUrl.trim();
    if (!trimmed) return { rawUrl: '', rawBase: '', originalUrl: inputUrl };

    // Case 1: Already a raw URL
    if (trimmed.includes('raw.githubusercontent.com') || trimmed.includes('gist.githubusercontent.com')) {
      const lastSlash = trimmed.lastIndexOf('/');
      const rawBase = lastSlash !== -1 ? trimmed.substring(0, lastSlash + 1) : '';
      return { rawUrl: trimmed, rawBase, originalUrl: inputUrl };
    }

    // Case 2: GitHub blob URL e.g. https://github.com/owner/repo/blob/branch/path/to/README.md
    const blobMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if (blobMatch) {
      const [, owner, repo, branch, path] = blobMatch;
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const lastSlash = rawUrl.lastIndexOf('/');
      const rawBase = lastSlash !== -1 ? rawUrl.substring(0, lastSlash + 1) : '';
      return { rawUrl, rawBase, owner, repo, branch, path, originalUrl: inputUrl };
    }

    // Case 3: GitHub repository URL e.g. https://github.com/owner/repo
    const repoMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/)?$/i);
    if (repoMatch) {
      const [, owner, repo] = repoMatch;
      const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`;
      const rawUrl = `${rawBase}README.md`;
      return { rawUrl, rawBase, owner, repo, branch: 'HEAD', path: 'README.md', originalUrl: inputUrl };
    }

    // Case 4: Any other direct URL
    const lastSlash = trimmed.lastIndexOf('/');
    const rawBase = lastSlash !== -1 ? trimmed.substring(0, lastSlash + 1) : '';
    return { rawUrl: trimmed, rawBase, originalUrl: inputUrl };
  }

  /**
   * Rewrites relative images and links in fetched markdown to absolute raw GitHub URLs.
   */
  static rewriteRelativeMarkdownPaths(markdown: string, rawBase: string): string {
    if (!rawBase || !markdown) return markdown;

    // Rewrite Markdown images: ![alt](path/to/img.png)
    let result = markdown.replace(
      /!\[(.*?)\]\(((?!https?:\/\/|\/|#|data:)(.*?))\)/g,
      (_match, alt, path) => `![${alt}](${rawBase}${path.replace(/^\.\//, '')})`
    );

    // Rewrite HTML <img> tags: <img src="path/to/img.png">
    result = result.replace(
      /<img([^>]+)src=["']((?!https?:\/\/|\/|#|data:)[^"']+)["']/gi,
      (_match, rest, src) => `<img${rest}src="${rawBase}${src.replace(/^\.\//, '')}"`
    );

    return result;
  }

  /**
   * Combines a caller-supplied abort signal with a timeout. `timeoutMs` was
   * previously accepted but never applied, so an unresponsive host would hang
   * the request indefinitely.
   */
  private static buildSignal(options: ReadmeFetchOptions): AbortSignal | undefined {
    const timeout = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_README_TIMEOUT_MS);
    if (!options.signal) return timeout;
    if (typeof AbortSignal.any === 'function') {
      return AbortSignal.any([options.signal, timeout]);
    }
    return options.signal;
  }

  /**
   * Fetches the markdown from a GitHub or raw README URL, rewriting relative image paths
   * with automatic branch fallback (HEAD -> main -> master).
   */
  static async fetchReadme(inputUrl: string, options: ReadmeFetchOptions = {}): Promise<ReadmeFetchResult> {
    const cacheKey = inputUrl.trim().toLowerCase();
    const now = Date.now();
    const cached = README_CACHE.get(cacheKey);
    if (cached && (now - cached.fetchedAt < README_CACHE_TTL_MS)) {
      return cached.result;
    }

    const resolution = this.resolveReadmeUrl(inputUrl);
    if (!resolution.rawUrl) {
      return {
        success: false,
        markdown: null,
        rawUrl: '',
        charCount: 0,
        error: 'Please enter a valid GitHub repository or README URL.'
      };
    }

    const sourceRepo = resolution.owner && resolution.repo ? `${resolution.owner}/${resolution.repo}` : undefined;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Portfolio-Engine-Readme-Service'
    };

    try {
      let res = await fetch(resolution.rawUrl, {
        headers: fetchHeaders,
        signal: ReadmeService.buildSignal(options)
      });

      // Branch fallback: If HEAD returns 404, fallback to main or master
      if (!res.ok && resolution.rawUrl.endsWith('/HEAD/README.md') && options.allowFallbackBranches !== false) {
        const mainUrl = resolution.rawUrl.replace('/HEAD/README.md', '/main/README.md');
        const mainRes = await fetch(mainUrl, { headers: fetchHeaders, signal: ReadmeService.buildSignal(options) });
        if (mainRes.ok) {
          const mainText = await mainRes.text();
          const cleanText = this.rewriteRelativeMarkdownPaths(mainText, resolution.rawBase.replace('/HEAD/', '/main/'));
          const result: ReadmeFetchResult = {
            success: true,
            markdown: cleanText,
            rawUrl: mainUrl,
            charCount: cleanText.length,
            sourceRepo
          };
          README_CACHE.set(cacheKey, { result, fetchedAt: now });
          return result;
        }

        const masterUrl = resolution.rawUrl.replace('/HEAD/README.md', '/master/README.md');
        const masterRes = await fetch(masterUrl, { headers: fetchHeaders, signal: ReadmeService.buildSignal(options) });
        if (masterRes.ok) {
          const masterText = await masterRes.text();
          const cleanText = this.rewriteRelativeMarkdownPaths(masterText, resolution.rawBase.replace('/HEAD/', '/master/'));
          const result: ReadmeFetchResult = {
            success: true,
            markdown: cleanText,
            rawUrl: masterUrl,
            charCount: cleanText.length,
            sourceRepo
          };
          README_CACHE.set(cacheKey, { result, fetchedAt: now });
          return result;
        }
      }

      if (!res.ok) {
        return {
          success: false,
          markdown: null,
          rawUrl: resolution.rawUrl,
          charCount: 0,
          sourceRepo,
          error: `GitHub returned HTTP ${res.status} (${res.statusText}). Verify the repository name or branch.`
        };
      }

      const text = await res.text();
      const cleanMarkdown = this.rewriteRelativeMarkdownPaths(text, resolution.rawBase);

      const result: ReadmeFetchResult = {
        success: true,
        markdown: cleanMarkdown,
        rawUrl: resolution.rawUrl,
        charCount: cleanMarkdown.length,
        sourceRepo
      };
      README_CACHE.set(cacheKey, { result, fetchedAt: now });
      return result;
    } catch (err: any) {
      const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
      return {
        success: false,
        markdown: null,
        rawUrl: resolution.rawUrl,
        charCount: 0,
        sourceRepo,
        error: isTimeout ? 'README request timed out.' : (err.message || 'Network error fetching README.')
      };
    }
  }

  /**
   * Convenience method to fetch and return only the markdown string, or null on error.
   */
  static async fetchReadmeMarkdown(inputUrl: string, options: ReadmeFetchOptions = {}): Promise<string | null> {
    const result = await this.fetchReadme(inputUrl, options);
    return result.success ? result.markdown : null;
  }
}

// Named singleton and utility exports for ergonomic consumption
export const readmeService = new ReadmeService();
export const isReadmeUrl = ReadmeService.isReadmeUrl.bind(ReadmeService);
export const resolveReadmeUrl = ReadmeService.resolveReadmeUrl.bind(ReadmeService);
export const rewriteRelativeMarkdownPaths = ReadmeService.rewriteRelativeMarkdownPaths.bind(ReadmeService);
export const fetchReadmeMarkdown = ReadmeService.fetchReadmeMarkdown.bind(ReadmeService);
export const fetchReadme = ReadmeService.fetchReadme.bind(ReadmeService);
