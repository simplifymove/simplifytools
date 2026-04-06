import { aiEditingTools, converterTools, aiWriteTools, videoTools } from '@/app/data/tools';

function generateSiteMap() {
  const baseUrl = 'https://simplifyconvert.com';
  
  // Get all tool slugs from the data
  const allTools = [
    ...Object.values(aiEditingTools || {}),
    ...Object.values(converterTools || {}),
    ...Object.values(aiWriteTools || {}),
    ...Object.values(videoTools || {}),
  ];

  // Filter unique routes
  const toolRoutes = allTools
    .filter((tool: any) => tool?.route)
    .map((tool: any) => ({
      url: tool.route,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: tool.route.includes('all-tools/') && !tool.route.includes('all-tools/[') ? '0.8' : '0.6',
    }));

  // Static pages
  const staticPages = [
    {
      url: '',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      url: '/all-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      url: '/all-tools/ai-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/all-tools/image-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/all-tools/video-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/all-tools/pdf-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/all-tools/data-converter',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/all-tools/code-tools',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      url: '/about',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      url: '/privacy',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.5',
    },
    {
      url: '/terms',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.5',
    },
    {
      url: '/blog',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    },
    {
      url: '/contact',
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.6',
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${staticPages
       .map(({ url, lastmod, changefreq, priority }) => {
         return `
     <url>
       <loc>${baseUrl}${url}</loc>
       <lastmod>${lastmod}</lastmod>
       <changefreq>${changefreq}</changefreq>
       <priority>${priority}</priority>
     </url>`;
       })
       .join('')}
     ${toolRoutes
       .map(({ url, lastmod, changefreq, priority }) => {
         return `
     <url>
       <loc>${baseUrl}${url}</loc>
       <lastmod>${lastmod}</lastmod>
       <changefreq>${changefreq}</changefreq>
       <priority>${priority}</priority>
     </url>`;
       })
       .join('')}
   </urlset>
 `;
  return xml;
}

export async function GET() {
  const sitemap = generateSiteMap();
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
    },
  });
}
