import type { APIRoute } from 'astro';
import { supabase } from '../utils/supabase';
import { GitHubProjectsService } from '../services/githubProjectsService';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.toString() || 'https://www.ryancuccurullo.com').replace(/\/+$/, '');
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: `${origin}/`, priority: '1.0', changefreq: 'weekly' },
    { url: `${origin}/projects`, priority: '0.9', changefreq: 'weekly' },
    { url: `${origin}/experience`, priority: '0.8', changefreq: 'monthly' },
    { url: `${origin}/resume`, priority: '0.8', changefreq: 'monthly' },
  ];

  let projectUrls: Array<{ url: string; priority: string; changefreq: string }> = [];

  try {
    const { projects } = await GitHubProjectsService.getPortfolioProjects(supabase);
    if (Array.isArray(projects)) {
      projectUrls = projects.map((p) => ({
        url: `${origin}/projects/${p.slug || p.id}`,
        priority: p.featured ? '0.85' : '0.7',
        changefreq: 'monthly',
      }));
    }
  } catch (err) {
    console.error('[sitemap.xml] Error building dynamic project URLs:', err);
  }

  const allUrls = [...staticPages, ...projectUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
