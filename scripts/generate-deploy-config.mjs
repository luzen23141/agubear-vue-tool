/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to load .env
const loadEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return process.env;
    const content = fs.readFileSync(envPath, 'utf-8');
    const dotEnv = content.split('\n').reduce((acc, line) => {
      const [key, val] = line.split('=');
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    }, {});
    return { ...process.env, ...dotEnv };
  } catch (e) {
    console.error('loadEnv error:', e);
    return process.env;
  }
};

const env = loadEnv();
const SITE_URL = env.VITE_SITE_URL || 'https://agubear.black';
const DOMAIN = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log(`🔧 Generating deployment config for: ${SITE_URL}`);

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory not found. Please run build first.');
  process.exit(1);
}

// 1. Prepare Content
const robotsContent = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const today = new Date().toISOString().split('T')[0];

// All supported locale codes
const LOCALES = [
  'zh-TW',
  'zh-CN',
  'yue',
  'ja',
  'ko',
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'it',
  'nl',
  'pl',
  'tr',
  'ru',
  'uk',
  'th',
  'vi',
  'id',
  'ms',
  'hi',
  'ar'
];

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

// Generate alternate links helper
const buildAlternates = (pathFn) =>
  LOCALES.map(
    (c) => `    <xhtml:link rel="alternate" hreflang="${c}" href="${SITE_URL}/${pathFn(c)}"/>`
  )
    .concat([`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`])
    .join('\n');

// Generate URLs for all tools across all locales
const urlEntries = LOCALES.flatMap((code) =>
  TOOLS.map(
    (tool) => `  <url>
    <loc>${SITE_URL}/${code}/${tool}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${buildAlternates((c) => `${c}/${tool}`)}
  </url>`
  )
).join('\n');

// Root homepage alternate links (point to each locale's default tool)
const rootAlternates = buildAlternates((c) => `${c}/timestamp`);

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
${rootAlternates}
  </url>
${urlEntries}
</urlset>
`;

// 2. Write Files
const filesToGenerate = [
  { name: 'robots.txt', content: robotsContent },
  { name: 'sitemap.xml', content: sitemapContent }
];

filesToGenerate.forEach(({ name, content }) => {
  // Write to dist/ (Deployment artifact)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.join(distDir, name), content);
  console.log(`✔ dist/${name} generated`);

  // Write to public/ (Source consistency)
  const publicFile = path.join(rootDir, 'public', name);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(path.dirname(publicFile))) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(publicFile, content);
    console.log(`✔ public/${name} updated (Source)`);
  }
});

// 3. Generate dist/CNAME
fs.writeFileSync(path.join(distDir, 'CNAME'), DOMAIN);
console.log(`✔ dist/CNAME generated (${DOMAIN})`);

// 4. Generate dist/404.html (SPA Fallback for GitHub Pages)
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, path.join(distDir, '404.html'));
  console.log('✔ dist/404.html generated (SPA Fallback)');
} else {
  console.warn('⚠️ Warning: dist/index.html not found, skipping 404.html generation');
}

// 5. Generate dist/_headers (Netlify/Cloudflare Cache Control)
const headersContent = `/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
fs.writeFileSync(path.join(distDir, '_headers'), headersContent);
console.log('✔ dist/_headers generated');

// 6. Update README.md (Source)
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf-8');
  const regex = /🌐 \*\*線上 Demo\*\*：\[.*?\]\(.*?\)/;
  const newLine = `🌐 **線上 Demo**：[${DOMAIN}](${SITE_URL})`;

  if (regex.test(readmeContent)) {
    readmeContent = readmeContent.replace(regex, newLine);
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✔ README.md updated');
  }
}
