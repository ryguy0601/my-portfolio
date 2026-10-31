// src/services/githubProjectsService.ts
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { slugify } from '../utils/text';

export type GitHubSyncMode = 'database' | 'hybrid' | 'github';

export interface GitHubPortfolioConfig {
  mode: GitHubSyncMode;
  username: string;
  hideForks: boolean;
  hideProfileReadme: boolean;
  excludedRepos: string[];
  featuredRepos?: string[];
  customLanguages?: Record<string, string[]>;
  customRepos?: string[];
  updated_at?: string;
}

export interface GitHubRepoSummary {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  languages?: string[];
  topics: string[];
  has_pages?: boolean;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
}

export const DEFAULT_GITHUB_CONFIG: GitHubPortfolioConfig = {
  mode: 'database',
  username: 'ryguy0601',
  hideForks: false,
  hideProfileReadme: true,
  excludedRepos: [],
  featuredRepos: [],
  customLanguages: {},
  customRepos: [],
};

// In-memory cache for GitHub API responses, repo languages, and repo demoPics
interface RepoCacheEntry {
  username: string;
  repos: GitHubRepoSummary[];
  fetchedAt: number;
}

let repoCache: RepoCacheEntry | null = null;
const demoPicsCache = new Map<string, { images: string[]; fetchedAt: number }>();
const repoLanguagesCache = new Map<string, { languages: string[]; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);

/**
 * Curated, high-impact descriptions and multi-bullet points for portfolio repositories.
 * Used when a repository lacks a custom database description or has generic fallback text.
 */
export const REPO_PRESET_DESCRIPTIONS: Record<string, { summary: string; bullets: string[] }> = {
  'visualcompare': {
    summary: 'Multithreaded visual regression and DOM-aware alignment testing engine designed to catch UI discrepancies, layout shifts, and rendering bugs across production and staging environments.',
    bullets: [
      'Engineered a multithreaded visual regression and DOM-aware alignment testing engine using **Python**, **Playwright**, and **Pillow** to catch UI discrepancies and layout shifts across production and staging.',
      'Implemented **Longest Common Subsequence (LCS)** dynamic programming algorithms to align corresponding DOM elements side-by-side prior to pixel matching, eliminating false positives from responsive layout reflows.',
      'Built interactive CLI commands and a **Modern Slate Dashboard** generating pixel-difference heatmaps, bounding-box annotations, and automated regression reports.'
    ]
  },
  'visualcompare-chrome-extension': {
    summary: 'Chrome extension for real-time dual-site visual regression and interaction testing with synchronized scrolling, split-swipe curtain, and mirrored user actions.',
    bullets: [
      'Architected a **Chrome Extension (Manifest V3)** for live side-by-side visual comparison and regression audits between production and staging environments.',
      'Engineered real-time cross-frame interaction mirroring, synchronizing mouse navigation, keyboard clicks, and scroll deltas across dual responsive web viewports.',
      'Implemented an interactive split-swipe divider curtain, flicker toggle, and element-level DOM inspector with high-performance CSS hardware acceleration.'
    ]
  },
  'seniorproject': {
    summary: 'Full-stack cryptocurrency analytics and portfolio tracking platform featuring microservices, real-time market data ingestion, and Groq AI sentiment analysis.',
    bullets: [
      'Architected a full-stack financial analytics platform utilizing **React**, **TypeScript**, and **Tailwind CSS** for interactive market visualization and live user dashboards.',
      'Engineered high-performance microservices combining a **Java Spring Boot** REST API and a **Python FastAPI** service to aggregate market metrics and RSS financial news.',
      'Integrated **Groq AI (Llama 3)** pipelines to perform real-time sentiment analysis on breaking news headlines, scoring market confidence metrics across 50+ cryptocurrencies.'
    ]
  },
  'my-portfolio': {
    summary: 'Dynamic full-stack developer portfolio and administrative CMS featuring Astro SSR, Bootstrap 5, Supabase (PostgreSQL), dynamic GitHub synchronization, and an AI-powered resume builder.',
    bullets: [
      'Architected a responsive, server-rendered portfolio platform and administrative CMS with **Astro SSR**, **TypeScript**, **Bootstrap 5**, and **SCSS**.',
      'Engineered an intelligent **GitHub API synchronization engine** supporting hybrid database caching, automated topic and language extraction, and remote demo asset resolution.',
      'Designed an integrated **AI-Powered Resume & Cover Letter Builder** leveraging **Gemini API** for automated ATS keyword alignment, one-page constraints, and PDF/DOCX generation.',
      'Implemented robust security with **Supabase (PostgreSQL)**, cookie session authentication, and **TOTP Two-Factor Authentication (MFA)**.'
    ]
  },
  'betterprinttopdf': {
    summary: 'Automated full-page screenshot capture and document assembly pipeline in Python using Selenium WebDriver, Pillow, and pypdf to stitch scroll-jacked web pages into vectorized PDF reports.',
    bullets: [
      'Developed an automated document generation pipeline in **Python** using **Selenium WebDriver**, **Pillow**, and **pypdf** to capture, stitch, and compile scroll-jacked web apps into high-resolution PDFs.',
      'Implemented smart pre-capture hooks to dismiss cookie banners, auto-trigger dynamic sticky navigation offsets, and prevent viewport seam artifacts.',
      'Built support for custom paper dimensions (Letter, A4, Tabloid) with automated DPI-aware coordinate normalization and vectorized metadata injection.'
    ]
  },
  'aiplays2048': {
    summary: 'Concurrent browser-based evolutionary neural agent arena simulating populations of autonomous heuristic agents evolving genetic strategies to solve 2048.',
    bullets: [
      'Built a concurrent browser arena using **JavaScript (ES6+)**, **HTML5 Canvas**, and **WebSockets** simulating evolutionary neural agents learning to solve 2048.',
      'Implemented genetic algorithm operators including fitness-proportionate roulette selection, multi-point crossover breeding, and weight mutation.',
      'Developed real-time telemetry visualizers to graph generational fitness curves, heuristic weights, corner-locking tendencies, and game longevity.'
    ]
  },
  'omarchy-wallpaper-engine': {
    summary: 'Interactive Times Square cyberpunk desktop wallpaper engine and telemetry widget for Omarchy Linux and Hyprland built with Quickshell, Qt Quick, and Wayland LayerShell.',
    bullets: [
      'Created an interactive desktop wallpaper engine and telemetry control center for **Hyprland** and **Omarchy Linux** using **Quickshell**, **Qt Quick (QML)**, and **Wayland LayerShell**.',
      'Integrated animated cyberpunk shaders, live neon signage, interactive weather forecasts, and real-time CPU/GPU system resource telemetry.',
      'Optimized render loop and Wayland surface handling to sustain fluid 60 FPS animations while consuming negligible idle system overhead.'
    ]
  },
  'pintfinder': {
    summary: 'JavaFX desktop application helping users discover, locate, rate, and review Guinness pints at local pubs with interactive Leaflet mapping and Firebase real-time persistence.',
    bullets: [
      'Co-developed a desktop application in **Java** and **JavaFX** connecting pub enthusiasts with top-rated venues serving quality Guinness pints.',
      'Integrated interactive **Leaflet.js** map views via embedded WebViews with custom pin markers, venue details, and geolocation radius filters.',
      'Implemented cloud data synchronization, user authentication, and community pint reviews using **Google Firebase Realtime Database**.'
    ]
  },
  'qr_image': {
    summary: 'High-contrast QR code generator web application built with Astro that produces valid, camera-scannable QR codes blended with custom artwork and logos.',
    bullets: [
      'Engineered a modern QR code generator with **Astro**, **TypeScript**, and **HTML5 Canvas** producing high-contrast, camera-scannable QR matrix codes.',
      'Implemented Reed-Solomon error correction level controls (L, M, Q, H) allowing seamless embedding of custom logos, artwork, and branded watermarks.',
      'Provided instantaneous browser preview, client-side SVG/PNG asset rendering, and zero-dependency vector exports.'
    ]
  },
  'snake-ai-pytorch': {
    summary: 'Deep Q-Learning reinforcement learning model in Python using PyTorch and Pygame to autonomously train an agent to master the classic Snake game.',
    bullets: [
      'Trained an autonomous Deep Q-Learning (DQN) agent in **Python** using **PyTorch** and **Pygame** to master classic Snake navigation.',
      'Designed neural network architecture featuring state evaluation tensors (danger detection, food direction, body alignment) and Bellman optimality loss functions.',
      'Visualized real-time training metrics, reward convergence curves, and policy adaptation over hundreds of evolutionary episodes.'
    ]
  },
  'a_pathfinding_visualizer': {
    summary: 'Interactive algorithmic pathfinding visualizer demonstrating A*, Dijkstra, Breadth-First Search, and Depth-First Search on dynamic 2D obstacle grids.',
    bullets: [
      'Engineered an interactive 2D graph traversal visualizer implementing **A* Search**, **Dijkstra\'s Algorithm**, **BFS**, and **DFS** with customizable Manhattan and Euclidean heuristics.',
      'Developed procedural maze generators and interactive wall placement tools with real-time open-set and closed-set state animations.'
    ]
  },
  'corpo': {
    summary: 'Collaborative enterprise web platform featuring modern UI design, robust REST API endpoints, and database workflows.',
    bullets: [
      'Collaborated on a modern enterprise web platform, implementing responsive UI layouts and component architectures.',
      'Engineered RESTful API integrations and database schema workflows to support scalable user operations.'
    ]
  }
};

/**
 * Returns GitHub API headers, automatically attaching Authorization if a token is available
 * in the environment or locally via the GitHub CLI (`gh auth token`).
 */
export function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'RyanCuccurullo-Portfolio',
  };

  let token =
    (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.GITHUB_TOKEN);

  if (!token) {
    try {
      token = execSync('gh auth token', {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 2000,
      }).trim();
    } catch {
      // Fallback silently if gh CLI is unavailable
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function isImageFilename(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function formatRepoTitle(repoName: string): string {
  return repoName
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Checks local individual project directories (e.g. `../<repoName>/demoPics` or `./demoPics` for my-portfolio)
 * or `public/project-screenshots/<repoName>` as fallback.
 * Images are served via the dynamic route `/api/project-demo/<repoName>/<filename>`.
 */
function findLocalDemoPics(repoName: string): string[] {
  try {
    const cwd = process.cwd();
    const candidates: Array<{ dir: string; urlPrefix: string }> = [
      // Check sibling repo folder: /home/ryguy/Work/<repoName>/demoPics
      { dir: path.resolve(cwd, '..', repoName, 'demoPics'), urlPrefix: `/api/project-demo/${repoName}` },
      // Check this project's own demoPics ONLY if repoName is 'my-portfolio'
      ...(repoName.toLowerCase() === 'my-portfolio'
        ? [{ dir: path.resolve(cwd, 'demoPics'), urlPrefix: `/api/project-demo/${repoName}` }]
        : []),
      // Legacy screenshots fallback
      { dir: path.join(cwd, 'public', 'project-screenshots', repoName), urlPrefix: `/project-screenshots/${repoName}` },
    ];

    for (const { dir, urlPrefix } of candidates) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        const files = fs
          .readdirSync(dir)
          .filter((f) => !f.startsWith('.') && isImageFilename(f))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (files.length > 0) {
          return files.map((f) => `${urlPrefix}/${encodeURIComponent(f)}`);
        }
      }
    }
  } catch {
    // Ignore fs errors in serverless environments if directories do not exist
  }
  return [];
}

/**
 * Checks the GitHub repository's root `/demoPics` folder for images via GitHub Contents API,
 * returning direct `raw.githubusercontent.com/<full_name>/<branch>/demoPics/<file>` URLs.
 */
async function fetchRemoteRepoDemoPics(
  fullName: string,
  defaultBranch: string
): Promise<string[]> {
  const cacheKey = `${fullName}@${defaultBranch}`;
  const now = Date.now();
  const cached = demoPicsCache.get(cacheKey);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.images;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/contents/demoPics?ref=${encodeURIComponent(defaultBranch)}`,
      {
        headers: getGitHubHeaders(),
      }
    );

    if (!res.ok) {
      demoPicsCache.set(cacheKey, { images: [], fetchedAt: now });
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      demoPicsCache.set(cacheKey, { images: [], fetchedAt: now });
      return [];
    }

    const images = items
      .filter((item: any) => item && item.type === 'file' && typeof item.name === 'string' && isImageFilename(item.name))
      .sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(
        (item: any) =>
          item.download_url ||
          `https://raw.githubusercontent.com/${fullName}/refs/heads/${defaultBranch}/demoPics/${encodeURIComponent(item.name)}`
      );

    demoPicsCache.set(cacheKey, { images, fetchedAt: now });
    return images;
  } catch {
    return [];
  }
}

export class GitHubProjectsService {
  /**
   * Loads the GitHub integration configuration stored in site_theme (id = 'github_config').
   */
  static async getConfig(supabaseClient: any): Promise<GitHubPortfolioConfig> {
    try {
      const { data, error } = await supabaseClient
        .from('site_theme')
        .select('variables')
        .eq('id', 'github_config')
        .maybeSingle();

      if (error) throw error;
      if (data && data.variables) {
        return {
          ...DEFAULT_GITHUB_CONFIG,
          ...data.variables,
          excludedRepos: Array.isArray(data.variables.excludedRepos)
            ? data.variables.excludedRepos
            : [],
          featuredRepos: Array.isArray(data.variables.featuredRepos)
            ? data.variables.featuredRepos
            : [],
          customLanguages:
            data.variables.customLanguages && typeof data.variables.customLanguages === 'object'
              ? data.variables.customLanguages
              : {},
          customRepos: Array.isArray(data.variables.customRepos)
            ? data.variables.customRepos
            : [],
        };
      }
    } catch (err) {
      console.error('Error loading github_config from Supabase:', err);
    }
    return { ...DEFAULT_GITHUB_CONFIG };
  }

  /**
   * Saves the GitHub integration configuration to site_theme (id = 'github_config').
   */
  static async saveConfig(
    supabaseClient: any,
    config: Partial<GitHubPortfolioConfig>
  ): Promise<{ success: boolean; config: GitHubPortfolioConfig; error?: any }> {
    try {
      const current = await this.getConfig(supabaseClient);
      const merged: GitHubPortfolioConfig = {
        ...current,
        ...config,
        username: (config.username ?? current.username ?? 'ryguy0601').trim() || 'ryguy0601',
        excludedRepos: Array.isArray(config.excludedRepos)
          ? config.excludedRepos
          : current.excludedRepos,
        featuredRepos: Array.isArray(config.featuredRepos)
          ? config.featuredRepos
          : current.featuredRepos || [],
        customLanguages:
          config.customLanguages !== undefined
            ? config.customLanguages
            : current.customLanguages || {},
        customRepos: Array.isArray(config.customRepos)
          ? config.customRepos
          : current.customRepos || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient.from('site_theme').upsert({
        id: 'github_config',
        variables: merged,
        updated_at: merged.updated_at,
      });

      if (error) throw error;
      return { success: true, config: merged };
    } catch (error) {
      console.error('Failed to save github_config:', error);
      return {
        success: false,
        config: { ...DEFAULT_GITHUB_CONFIG, ...config } as GitHubPortfolioConfig,
        error,
      };
    }
  }

  /**
   * Fetches strictly public repositories (`type=public` & `!repo.private`) for the configured GitHub username.
   */
  static async fetchPublicRepos(
    username: string,
    options?: { forceRefresh?: boolean }
  ): Promise<GitHubRepoSummary[]> {
    const cleanUser = (username || 'ryguy0601').trim();
    const now = Date.now();

    if (
      !options?.forceRefresh &&
      repoCache &&
      repoCache.username.toLowerCase() === cleanUser.toLowerCase() &&
      now - repoCache.fetchedAt < CACHE_TTL_MS
    ) {
      return repoCache.repos;
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?type=public&sort=updated&per_page=100`,
        {
          headers: getGitHubHeaders(),
        }
      );

      if (!response.ok) {
        console.error(`GitHub API returned status ${response.status}`);
        return repoCache?.repos || [];
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      // Strictly enforce public-only repositories (!repo.private && visibility !== 'private')
      const publicRepos: GitHubRepoSummary[] = data
        .filter((r: any) => r && r.private === false && r.visibility !== 'private')
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          private: false,
          fork: Boolean(r.fork),
          archived: Boolean(r.archived),
          html_url: r.html_url,
          description: r.description || null,
          homepage: r.homepage || null,
          language: r.language || null,
          has_pages: Boolean(r.has_pages),
          topics: Array.isArray(r.topics) ? r.topics : [],
          stargazers_count: Number(r.stargazers_count || 0),
          forks_count: Number(r.forks_count || 0),
          default_branch: r.default_branch || 'main',
          updated_at: r.updated_at || '',
          pushed_at: r.pushed_at || '',
        }));

      repoCache = {
        username: cleanUser,
        repos: publicRepos,
        fetchedAt: now,
      };

      return publicRepos;
    } catch (err) {
      console.error('Failed to fetch public GitHub repositories:', err);
      return repoCache?.repos || [];
    }
  }

  /**
   * Fetches metadata for an individual GitHub repository (e.g. from an external URL like 'https://github.com/JderenthalCS/Corpo'
   * or a full name like 'JderenthalCS/Corpo').
   */
  static async fetchSingleRepo(repoUrlOrFullName: string): Promise<GitHubRepoSummary | null> {
    const raw = (repoUrlOrFullName || '').trim();
    if (!raw) return null;

    let fullName = '';
    const match = raw.match(/github\.com\/([^\/]+)\/([^\/#?]+)/i);
    if (match) {
      fullName = `${match[1]}/${match[2].replace(/\.git$/i, '')}`;
    } else if (raw.includes('/')) {
      fullName = raw.replace(/\.git$/i, '');
    } else {
      fullName = `ryguy0601/${raw}`;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${fullName}`, {
        headers: getGitHubHeaders(),
      });

      if (!response.ok) {
        console.error(`GitHub API returned status ${response.status} for ${fullName}`);
        // Fallback gracefully if rate-limited: parse repository name from URL
        const parts = fullName.split('/');
        const owner = parts[0];
        const repoName = parts[1] || fullName;
        return {
          id: Math.abs(slugify(fullName).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
          name: repoName,
          full_name: fullName,
          private: false,
          fork: false,
          archived: false,
          html_url: `https://github.com/${fullName}`,
          description: null,
          homepage: null,
          language: null,
          has_pages: false,
          topics: [],
          stargazers_count: 0,
          forks_count: 0,
          default_branch: 'main',
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
        };
      }

      const r = await response.json();
      if (!r || r.private) return null;

      return {
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private: false,
        fork: Boolean(r.fork),
        archived: Boolean(r.archived),
        html_url: r.html_url,
        description: r.description || null,
        homepage: r.homepage || null,
        language: r.language || null,
        has_pages: Boolean(r.has_pages),
        topics: Array.isArray(r.topics) ? r.topics : [],
        stargazers_count: Number(r.stargazers_count || 0),
        forks_count: Number(r.forks_count || 0),
        default_branch: r.default_branch || 'main',
        updated_at: r.updated_at || '',
        pushed_at: r.pushed_at || '',
      };
    } catch (err) {
      console.error(`Failed to fetch repo ${fullName}:`, err);
      const parts = fullName.split('/');
      const repoName = parts[1] || fullName;
      return {
        id: Math.abs(slugify(fullName).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
        name: repoName,
        full_name: fullName,
        private: false,
        fork: false,
        archived: false,
        html_url: `https://github.com/${fullName}`,
        description: null,
        homepage: null,
        language: null,
        has_pages: false,
        topics: [],
        stargazers_count: 0,
        forks_count: 0,
        default_branch: 'main',
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Fetches all detected languages for a repository via GitHub's `/repos/:owner/:repo/languages` endpoint.
   * Returns an array of language names (e.g. ['TypeScript', 'Java', 'CSS', 'Python']).
   */
  static async fetchRepoLanguages(fullName: string): Promise<string[]> {
    const cleanRepo = fullName.trim();
    const now = Date.now();
    const cached = repoLanguagesCache.get(cleanRepo.toLowerCase());
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.languages;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${cleanRepo}/languages`, {
        headers: getGitHubHeaders(),
      });

      if (!response.ok) {
        repoLanguagesCache.set(cleanRepo.toLowerCase(), { languages: [], fetchedAt: now });
        return [];
      }

      const data = await response.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Sort languages by byte count descending
        const langs = Object.keys(data).filter((k) => typeof data[k] === 'number');
        repoLanguagesCache.set(cleanRepo.toLowerCase(), { languages: langs, fetchedAt: now });
        return langs;
      }
    } catch (err) {
      console.error(`Failed to fetch languages for repo ${cleanRepo}:`, err);
    }
    return [];
  }

  /**
   * Resolves images for a GitHub repository using the standard `demoPics` folder convention:
   * 1. Local `/demoPics/<repoName>/...` (or `/project-screenshots/<repoName>/...`)
   * 2. Remote GitHub repository's `/demoPics/...` directory (`raw.githubusercontent.com/<full_name>/<branch>/demoPics/pic1.png`)
   * 3. Default raw URL pointing to `/demoPics/pic1.png` inside the repo (or OpenGraph social preview fallback)
   */
  static async resolveRepoDemoImages(repo: GitHubRepoSummary): Promise<string[]> {
    const localImages = findLocalDemoPics(repo.name);
    if (localImages.length > 0) {
      return localImages;
    }

    const remoteDemoPics = await fetchRemoteRepoDemoPics(repo.full_name, repo.default_branch);
    if (remoteDemoPics.length > 0) {
      return remoteDemoPics;
    }

    // No local or remote demoPics available: return empty array so UI can display the playful "no image" graphic
    return [];
  }

  /**
   * Converts a public GitHub repository into a Portfolio Project object.
   * Uses the standard `demoPics` folder for screenshots and links the repo's README.md.
   * Incorporates all detected GitHub languages and any manually configured custom languages.
   */
  static async repoToProject(
    repo: GitHubRepoSummary,
    indexOffset = 10000,
    isFeatured = false,
    customLanguagesForRepo: string[] = []
  ): Promise<any> {
    const stackItems: string[] = [];

    // 1. First, check if languages were passed or fetch all languages from GitHub
    let detectedLangs = repo.languages;
    if (!detectedLangs || detectedLangs.length === 0) {
      detectedLangs = await this.fetchRepoLanguages(repo.full_name);
    }

    // Add all detected languages
    for (const lang of detectedLangs) {
      if (lang && !stackItems.some((s) => s.toLowerCase() === lang.toLowerCase())) {
        stackItems.push(lang);
      }
    }

    // Add primary repo.language if not yet present
    if (repo.language && !stackItems.some((s) => s.toLowerCase() === repo.language!.toLowerCase())) {
      stackItems.unshift(repo.language);
    }

    // 2. Add any manually configured custom languages/technologies
    if (Array.isArray(customLanguagesForRepo)) {
      for (const cl of customLanguagesForRepo) {
        if (cl && !stackItems.some((s) => s.toLowerCase() === cl.toLowerCase())) {
          stackItems.push(cl);
        }
      }
    }

    // 3. Add GitHub repository topics
    if (Array.isArray(repo.topics)) {
      for (const topic of repo.topics) {
        if (topic && !stackItems.some((s) => s.toLowerCase() === topic.toLowerCase())) {
          stackItems.push(topic);
        }
      }
    }

    if (stackItems.length === 0) {
      stackItems.push('GitHub');
    }

    const demoImages = await this.resolveRepoDemoImages(repo);
    const slug = slugify(repo.name) || repo.name.toLowerCase();

    // Resolve live demo URL:
    // 1. Explicit repo.homepage (if configured in GitHub settings)
    // 2. Automated GitHub Pages URL if repo has GitHub Pages enabled (e.g. https://<owner>.github.io/<repo>/)
    let liveUrl = repo.homepage?.trim() || null;
    if (!liveUrl && repo.has_pages) {
      const owner = repo.full_name.split('/')[0] || 'ryguy0601';
      liveUrl = `https://${owner}.github.io/${repo.name}/`;
    }

    const presetKey = repo.name.toLowerCase();
    const preset = REPO_PRESET_DESCRIPTIONS[presetKey];
    const defaultFallbackSummary = `Public ${repo.language ? `${repo.language} ` : ''}repository on GitHub (${repo.full_name}).`;

    // Use custom GitHub description if present and informative, or fallback to our curated preset description
    let finalSummary = repo.description?.trim();
    if (!finalSummary || finalSummary.toLowerCase().startsWith('public') && finalSummary.includes('repository on github')) {
      finalSummary = preset?.summary || defaultFallbackSummary;
    }

    const bullets = preset?.bullets || [finalSummary];

    return {
      id: slug,
      numeric_id: indexOffset + repo.id,
      title: formatRepoTitle(repo.name),
      repo_name: repo.name,
      slug,
      summary: finalSummary,
      bullets,
      content: `${repo.html_url}/blob/${repo.default_branch}/README.md`,
      tech_stack: stackItems.join(', '),
      live_url: liveUrl,
      github_url: repo.html_url,
      featured: isFeatured,
      is_github_live: true,
      is_fork: repo.fork,
      stars: repo.stargazers_count,
      updated_at: repo.updated_at,
      demo_pics_folder: `https://github.com/${repo.full_name}/tree/${repo.default_branch}/demoPics`,
      image_url: demoImages[0] || null,
      image_filenames: demoImages,
    };
  }

  /**
   * Returns the unified list of projects for the public portfolio according to the active mode:
   * - 'database': Only curated Supabase database projects
   * - 'hybrid': Curated Supabase projects + any remaining visible public GitHub repos not yet in the database
   * - 'github': All visible public GitHub repos (enriched with custom screenshots/summaries if a matching DB entry exists)
   */
  static async getPortfolioProjects(
    supabaseClient: any,
    dbProjects?: any[]
  ): Promise<{
    projects: any[];
    config: GitHubPortfolioConfig;
  }> {
    const config = await this.getConfig(supabaseClient);

    let curated = dbProjects;
    if (!curated) {
      const { data } = await supabaseClient
        .from('projects')
        .select('*')
        .order('id', { ascending: false });
      curated = data || [];
    }

    if (config.mode === 'database') {
      return { projects: curated, config };
    }

    const rawRepos = await this.fetchPublicRepos(config.username);

    // Fetch and merge any manually linked custom/collaborated GitHub repos (e.g. 'https://github.com/JderenthalCS/Corpo')
    const customRepoEntries = Array.isArray(config.customRepos) ? config.customRepos : [];
    if (customRepoEntries.length > 0) {
      const existingNames = new Set(rawRepos.map((r) => r.name.toLowerCase()));
      const customSummaries = await Promise.all(
        customRepoEntries.map((entry) => this.fetchSingleRepo(entry))
      );
      for (const cs of customSummaries) {
        if (cs && !existingNames.has(cs.name.toLowerCase())) {
          rawRepos.push(cs);
          existingNames.add(cs.name.toLowerCase());
        }
      }
    }

    const excludedSet = new Set((config.excludedRepos || []).map((r) => r.toLowerCase()));
    const featuredSet = new Set((config.featuredRepos || []).map((r) => r.toLowerCase()));
    const customLangsMap = config.customLanguages || {};

    const filteredRepos = rawRepos.filter((r) => {
      if (r.private) return false;
      if (config.hideForks && r.fork) return false;
      if (
        config.hideProfileReadme &&
        r.name.toLowerCase() === config.username.toLowerCase()
      ) {
        return false;
      }
      if (excludedSet.has(r.name.toLowerCase())) return false;
      return true;
    });

    // Map existing DB projects by normalized GitHub URL and repo name
    const dbByRepoUrl = new Map<string, any>();
    const dbByRepoName = new Map<string, any>();

    for (const p of curated) {
      if (p.github_url) {
        const cleanUrl = p.github_url.trim().toLowerCase().replace(/\/+$/, '').replace(/\.git$/, '');
        dbByRepoUrl.set(cleanUrl, p);
        const parts = cleanUrl.split('/');
        const repoName = parts[parts.length - 1];
        if (repoName) dbByRepoName.set(repoName, p);
      }
    }

    if (config.mode === 'hybrid') {
      const unlinkedRepos = filteredRepos.filter((r) => {
        const cleanUrl = r.html_url.trim().toLowerCase().replace(/\/+$/, '');
        return !dbByRepoUrl.has(cleanUrl) && !dbByRepoName.has(r.name.toLowerCase());
      });

      const unlinkedGithubProjects = await Promise.all(
        unlinkedRepos.map((r, idx) =>
          this.repoToProject(
            r,
            10000 + idx,
            featuredSet.has(r.name.toLowerCase()),
            customLangsMap[r.name] || customLangsMap[r.name.toLowerCase()] || []
          )
        )
      );

      // Also respect visibility toggles on curated DB projects that link to a GitHub repo if excluded
      const visibleCurated = curated.filter((p) => {
        if (!p.github_url) return true;
        const parts = p.github_url.trim().replace(/\/+$/, '').split('/');
        const rName = (parts[parts.length - 1] || '').toLowerCase();
        return !excludedSet.has(rName);
      });

      return {
        projects: [...visibleCurated, ...unlinkedGithubProjects],
        config,
      };
    }

    // Mode === 'github': Pull all visible public GitHub repos, enriching with DB screenshots/summaries if linked
    const githubModeProjects = await Promise.all(
      filteredRepos.map(async (r, idx) => {
        const cleanUrl = r.html_url.trim().toLowerCase().replace(/\/+$/, '');
        const linkedDb = dbByRepoUrl.get(cleanUrl) || dbByRepoName.get(r.name.toLowerCase());
        const customLangs = customLangsMap[r.name] || customLangsMap[r.name.toLowerCase()] || [];
        const baseGhProject = await this.repoToProject(
          r,
          10000 + idx,
          featuredSet.has(r.name.toLowerCase()),
          customLangs
        );

        if (linkedDb) {
          const hasDbImages =
            (Array.isArray(linkedDb.image_filenames) && linkedDb.image_filenames.length > 0) ||
            Boolean(linkedDb.image_url);
          const hasDbSummary =
            linkedDb.summary &&
            !linkedDb.summary.toLowerCase().startsWith('public ') &&
            !linkedDb.summary.includes('repository on github');

          return {
            ...baseGhProject,
            ...linkedDb,
            summary: hasDbSummary ? linkedDb.summary : baseGhProject.summary,
            bullets: baseGhProject.bullets || (linkedDb.summary ? [linkedDb.summary] : []),
            featured: featuredSet.has(r.name.toLowerCase()) || Boolean(linkedDb.featured),
            image_url: hasDbImages ? linkedDb.image_url : baseGhProject.image_url,
            image_filenames: hasDbImages ? linkedDb.image_filenames : baseGhProject.image_filenames,
            github_url: linkedDb.github_url || r.html_url,
            live_url: linkedDb.live_url || baseGhProject.live_url,
            is_github_synced: true,
          };
        }
        return baseGhProject;
      })
    );

    return {
      projects: githubModeProjects,
      config,
    };
  }

  static clearCache(): void {
    repoCache = null;
    demoPicsCache.clear();
    repoLanguagesCache.clear();
  }
}
