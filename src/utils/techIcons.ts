// src/utils/techIcons.ts

export interface TechInfo {
  name: string;
  hasIcon: boolean;
  iconUrl: string;
  source?: 'simple-icons' | 'bootstrap-icons' | 'devicon';
}

/**
 * Maps technology names to icons:
 * - Prefix with "bi:" for Bootstrap Icons
 * - Prefix with "devicon:" for Devicon (uses monochrome -plain variants)
 * - Standard slugs default to Simple Icons
 */
export const techIconMap: Record<string, string> = {
  // ==========================================
  // .NET, C# & Microsoft Ecosystem
  // ==========================================
  'c#': 'csharp',
  'csharp': 'csharp',
  'dotnet': 'dotnet',
  '.net': 'dotnet',
  '.net core': 'dotnet',
  'dotnet core': 'dotnet',
  'asp.net': 'dotnet',
  'asp.net core': 'dotnet',
  'blazor': 'blazor',
  'azure': 'microsoftazure',
  'microsoft azure': 'microsoftazure',
  'azure devops': 'azuredevops',
  'azure dev ops': 'azuredevops',
  'asure devops': 'azuredevops',
  'asure dev ops': 'azuredevops',
  'ado': 'azuredevops',
  'azure pipelines': 'azurepipelines',
  'powershell': 'powershell',
  'visual studio': 'visualstudio',
  'vs': 'visualstudio',
  'visual studio code': 'visualstudiocode',
  'vscode': 'visualstudiocode',
  'windows': 'windows',
  'active directory': 'windows',

  // ==========================================
  // Enterprise & IT Service Management (ITSM)
  // ==========================================
  'servicenow': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 4.095c-3.957 0-7.234 2.871-7.859 6.647h3.313a4.707 4.707 0 0 1 4.546-3.414c2.617 0 4.738 2.122 4.738 4.739s-2.121 4.738-4.738 4.738a4.707 4.707 0 0 1-4.546-3.413H4.141C4.766 17.15 8.043 20.02 12 20.02c4.418 0 8-3.582 8-8.001 0-4.418-3.582-7.924-8-7.924M5.84 10.96a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94"/></svg>',
  'service now': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 4.095c-3.957 0-7.234 2.871-7.859 6.647h3.313a4.707 4.707 0 0 1 4.546-3.414c2.617 0 4.738 2.122 4.738 4.739s-2.121 4.738-4.738 4.738a4.707 4.707 0 0 1-4.546-3.413H4.141C4.766 17.15 8.043 20.02 12 20.02c4.418 0 8-3.582 8-8.001 0-4.418-3.582-7.924-8-7.924M5.84 10.96a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94"/></svg>',
  'snow': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 4.095c-3.957 0-7.234 2.871-7.859 6.647h3.313a4.707 4.707 0 0 1 4.546-3.414c2.617 0 4.738 2.122 4.738 4.739s-2.121 4.738-4.738 4.738a4.707 4.707 0 0 1-4.546-3.413H4.141C4.766 17.15 8.043 20.02 12 20.02c4.418 0 8-3.582 8-8.001 0-4.418-3.582-7.924-8-7.924M5.84 10.96a1.97 1.97 0 1 0 0 3.94 1.97 1.97 0 0 0 0-3.94"/></svg>',

  // ==========================================
  // Core Programming Languages
  // ==========================================
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'python': 'python',
  'py': 'python',
  'beautiful soup': 'python',
  'beautifulsoup': 'python',
  'beautifulsoup4': 'python',
  'bs4': 'python',
  'java': 'devicon:java/java-plain',
  'c': 'c',
  'c++': 'cplusplus',
  'cpp': 'cplusplus',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'php': 'php',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'dart': 'dart',
  'scala': 'scala',
  'r': 'r',
  'lua': 'lua',
  'perl': 'perl',
  'shell': 'gnubash',
  'bash': 'gnubash',
  'zsh': 'gnubash',

  // ==========================================
  // Web Markup, Styling & Preprocessors
  // ==========================================
  'html': 'html5',
  'html5': 'html5',
  'css': 'css3',
  'css3': 'css3',
  'sass': 'sass',
  'scss': 'sass',
  'less': 'less',
  'postcss': 'postcss',
  'bootstrap': 'bootstrap',
  'tailwind': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'daisyui': 'daisyui',
  'chakra ui': 'chakraui',
  'chakra': 'chakraui',
  'material ui': 'mui',
  'mui': 'mui',
  'shadcn': 'shadcnui',
  'shadcn/ui': 'shadcnui',
  'bulma': 'bulma',

  // ==========================================
  // Frontend Frameworks & Libraries
  // ==========================================
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'vue': 'vuedotjs',
  'vue.js': 'vuedotjs',
  'vuejs': 'vuedotjs',
  'angular': 'angular',
  'angularjs': 'angular',
  'svelte': 'svelte',
  'sveltekit': 'svelte',
  'astro': 'astro',
  'next.js': 'nextdotjs',
  'nextjs': 'nextdotjs',
  'next': 'nextdotjs',
  'nuxt': 'nuxtdotjs',
  'nuxt.js': 'nuxtdotjs',
  'nuxtjs': 'nuxtdotjs',
  'remix': 'remix',
  'gatsby': 'gatsby',
  'solid': 'solid',
  'solidjs': 'solid',
  'jquery': 'jquery',
  'redux': 'redux',
  'zustand': 'react',
  'htmx': 'htmx',
  'alpine': 'alpinedotjs',
  'alpine.js': 'alpinedotjs',

  // ==========================================
  // Backend Frameworks & Runtimes
  // ==========================================
  'node': 'nodedotjs',
  'node.js': 'nodedotjs',
  'nodejs': 'nodedotjs',
  'express': 'express',
  'express.js': 'express',
  'expressjs': 'express',
  'fastify': 'fastify',
  'nest': 'nestjs',
  'nestjs': 'nestjs',
  'deno': 'deno',
  'bun': 'bun',
  'django': 'django',
  'flask': 'flask',
  'fastapi': 'fastapi',
  'spring': 'spring',
  'spring boot': 'springboot',
  'laravel': 'laravel',
  'symfony': 'symfony',
  'codeigniter': 'codeigniter',
  'ruby on rails': 'rubyonrails',
  'rails': 'rubyonrails',
  'gin': 'gin',
  'fiber': 'go',
  'actix': 'rust',
  'axum': 'rust',

  // ==========================================
  // Databases, ORMs & Caching
  // ==========================================
  'sql': 'mysql',
  'mysql': 'mysql',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'sqlite': 'sqlite',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'redis': 'redis',
  'mariadb': 'mariadb',
  'oracle': 'oracle',
  'microsoft sql server': 'microsoftsqlserver',
  'mssql': 'microsoftsqlserver',
  'sql server': 'microsoftsqlserver',
  'supabase': 'supabase',
  'firebase': 'firebase',
  'prisma': 'prisma',
  'drizzle': 'drizzle',
  'entity framework': 'dotnet',
  'ef core': 'dotnet',
  'typeorm': 'typeorm',
  'cassandra': 'apachecassandra',
  'couchdb': 'apachecouchdb',
  'neo4j': 'neo4j',
  'elasticsearch': 'elasticsearch',
  'meilisearch': 'meilisearch',
  'pocketbase': 'pocketbase',
  'appwrite': 'appwrite',

  // ==========================================
  // DevOps, Hosting, Cloud & Containers
  // ==========================================
  'git': 'git',
  'github': 'github',
  'gitlab': 'gitlab',
  'bitbucket': 'bitbucket',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'linux': 'linux',
  'ubuntu': 'ubuntu',
  'debian': 'debian',
  'arch': 'archlinux',
  'centos': 'centos',
  'redhat': 'redhat',
  'aws': 'amazonaws',
  'amazon web services': 'amazonaws',
  'gcp': 'googlecloud',
  'google cloud': 'googlecloud',
  'cloudflare': 'cloudflare',
  'cloudflare pages': 'cloudflarepages',
  'cloudflare workers': 'cloudflareworkers',
  'vercel': 'vercel',
  'netlify': 'netlify',
  'heroku': 'heroku',
  'digitalocean': 'digitalocean',
  'linode': 'linode',
  'render': 'render',
  'fly.io': 'flydotio',
  'nginx': 'nginx',
  'apache': 'apache',
  'caddy': 'caddy',
  'terraform': 'terraform',
  'ansible': 'ansible',
  'jenkins': 'jenkins',
  'github actions': 'githubactions',

  // ==========================================
  // Package Managers & Build Tools
  // ==========================================
  'npm': 'npm',
  'yarn': 'yarn',
  'pnpm': 'pnpm',
  'vite': 'vite',
  'webpack': 'webpack',
  'esbuild': 'esbuild',
  'babel': 'babel',
  'rollup': 'rollupdotjs',
  'turborepo': 'turborepo',
  'nuget': 'nuget',
  'composer': 'composer',
  'pip': 'pypi',
  'pypi': 'pypi',
  'cargo': 'rust',
  'gradle': 'gradle',
  'maven': 'apachemaven',

  // ==========================================
  // Testing & Quality Assurance
  // ==========================================
  'jest': 'jest',
  'vitest': 'vitest',
  'cypress': 'cypress',
  'playwright': 'playwright',
  'selenium': 'selenium',
  'mocha': 'mocha',
  'postman': 'postman',
  'insomnia': 'insomnia',
  'eslint': 'eslint',
  'prettier': 'prettier',
  'storybook': 'storybook',

  // ==========================================
  // AI, LLMs & Machine Learning
  // ==========================================
  'gemini': 'googlegemini',
  'google gemini': 'googlegemini',
  'gemini ai': 'googlegemini',
  'gemini api': 'googlegemini',
  'openai': 'openai',
  'chatgpt': 'openai',
  'gpt': 'openai',
  'anthropic': 'anthropic',
  'claude': 'anthropic',
  'ollama': 'ollama',
  'huggingface': 'huggingface',
  'hugging face': 'huggingface',
  'pytorch': 'pytorch',
  'tensorflow': 'tensorflow',
  'keras': 'keras',
  'opencv': 'opencv',
  'pandas': 'pandas',
  'numpy': 'numpy',
  'scipy': 'scipy',
  'jupyter': 'jupyter',
  'langchain': 'langchain',

  // ==========================================
  // Design, Collaboration & CMS
  // ==========================================
  'figma': 'figma',
  'canva': 'canva',
  'adobe photoshop': 'adobephotoshop',
  'photoshop': 'adobephotoshop',
  'adobe illustrator': 'adobeillustrator',
  'illustrator': 'adobeillustrator',
  'adobe xd': 'adobexd',
  'wordpress': 'wordpress',
  'strapi': 'strapi',
  'sanity': 'sanity',
  'jira': 'jira',
  'confluence': 'confluence',
  'trello': 'trello',
  'notion': 'notion',
  'slack': 'slack',
  'discord': 'discord',

  // ==========================================
  // Bootstrap Icons (Abstract/System Concepts)
  // ==========================================
  'terminal': 'bi:terminal',
  'cli': 'bi:terminal',
  'console': 'bi:terminal',
  'database': 'bi:database',
  'db': 'bi:database',
  'server': 'bi:hdd-network',
  'servers': 'bi:hdd-stack',
  'api': 'bi:code-slash',
  'rest api': 'bi:code-slash',
  'graphql': 'graphql',
  'grpc': 'bi:arrow-left-right',
  'cloud': 'bi:cloud',
  'security': 'bi:shield-lock',
  'cybersecurity': 'bi:shield-check',
  'auth': 'bi:key',
  'authentication': 'bi:fingerprint',
  'network': 'bi:diagram-3',
  'networking': 'bi:router',
  'monitoring': 'bi:activity',
  'analytics': 'bi:graph-up-arrow',
  'testing': 'bi:check2-circle',
  'hardware': 'bi:cpu',
  'microservices': 'bi:boxes',
  'responsive': 'bi:phone-landscape',
  'mobile': 'bi:phone',
  'web': 'bi:globe',
  'search': 'bi:search',
  'storage': 'bi:archive',
  'performance': 'bi:speedometer2',
  'documentation': 'bi:journal-code'
};

/**
 * Resolves a technology string into an icon URL or fallback representation.
 */
export function getTechInfo(techName: string): TechInfo {
  const clean = techName.trim().toLowerCase();
  const entry = techIconMap[clean];

  if (!entry) {
    return {
      name: techName.trim(),
      hasIcon: false,
      iconUrl: '',
    };
  }

  // 1. Embedded Data URI
  if (entry.startsWith('data:')) {
    return {
      name: techName.trim(),
      hasIcon: true,
      source: 'data-uri',
      iconUrl: entry,
    };
  }

  // 2. Bootstrap Icons (`bi:<icon-name>`)
  if (entry.startsWith('bi:')) {
    const iconName = entry.replace('bi:', '');
    return {
      name: techName.trim(),
      hasIcon: true,
      source: 'bootstrap-icons',
      iconUrl: `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${iconName}.svg`,
    };
  }

  // 3. Devicon (`devicon:<path>`)
  if (entry.startsWith('devicon:')) {
    const iconPath = entry.replace('devicon:', '');
    return {
      name: techName.trim(),
      hasIcon: true,
      source: 'devicon',
      iconUrl: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconPath}.svg`,
    };
  }

  // 4. Simple Icons (default)
  const slug = entry.replace('si:', '');
  return {
    name: techName.trim(),
    hasIcon: true,
    source: 'simple-icons',
    iconUrl: `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`,
  };
}

/**
 * Parses comma-separated tech stack strings into an array of TechInfo items.
 */
export function parseTechStack(techStack: string | null | undefined): TechInfo[] {
  if (!techStack) return [];
  return techStack
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean)
    .map(getTechInfo);
}

/**
 * Quick helper returning hasIcon and url for any tech name.
 */
export function resolveIconUrl(name: string): { hasIcon: boolean; url: string } {
  const info = getTechInfo(name);
  return { hasIcon: info.hasIcon, url: info.iconUrl };
}

