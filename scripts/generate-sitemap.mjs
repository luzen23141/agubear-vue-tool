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

const getPriority = (route) => {
  if (route === '') return '1.0';
  if (route.split('/').length === 1) return '0.8';
  return '0.6';
};

const getAlternatesString = (route) => {
  const pathParts = route.split('/').filter(Boolean);
  const toolName = pathParts.length > 1 ? pathParts[1] : '';
  const currentLocale = pathParts.length > 0 ? pathParts[0] : '';
  const isRootOrLocale = route === '' || (currentLocale && LOCALES.includes(currentLocale));
  
  if (toolName) {
    const links = LOCALES.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}/${toolName}" />`
    );
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/${toolName}" />`);
    return links.join('\n');
  }

  if (isRootOrLocale) {
    const links = LOCALES.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}" />`
    );
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en" />`);
    return links.join('\n');
  }

  return '';
};

const generateUrlEntry = (route) => {
  const priority = getPriority(route);
  const alternates = getAlternatesString(route);

  return `  <url>
    <loc>${SITE_URL}/${route}</loc>
${alternates}${alternates ? '\n' : ''}    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

async function generateSitemap() {
  console.log('Generating sitemap...');

  const routes = LOCALES.flatMap((locale) =>
    TOOLS.map((tool) => `${locale}/${tool}`)
  );

  // Add root and language homepages if they exist
  const allRoutes = ['', ...LOCALES, ...routes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allRoutes.map(r => generateUrlEntry(r)).join('\n')}
</urlset>`;

  const sitemapPath = path.join(process.cwd(), DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated at: ${sitemapPath}`);
}

generateSitemap().catch(console.error);
