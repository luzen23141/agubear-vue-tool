import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://agubear.black';
const DIST_DIR = 'dist';
const LOCALES = ['zh-TW', 'en', 'ja'];
const TOOLS = [
  'timestamp',
  'hash',
  'base64',
  'url',
  'unicode',
  'pinyin',
  'qrcode',
  'json',
  'jwt',
  'uuid',
  'color',
  'diff'
];

async function generateSitemap() {
  console.log('Generating sitemap...');

  const routes = LOCALES.flatMap((locale) =>
    TOOLS.map((tool) => `${locale}/${tool}`)
  );

  // Add root and language homepages if they exist
  const allRoutes = ['', ...LOCALES, ...routes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map((route) => {
    let priority = '0.6';
    if (route === '') {
      priority = '1.0';
    } else if (route.split('/').length === 1) {
      priority = '0.8';
    }
    return `  <url>
    <loc>${SITE_URL}/${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  const sitemapPath = path.join(process.cwd(), DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated at: ${sitemapPath}`);
}

generateSitemap().catch(console.error);
