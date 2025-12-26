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

// All supported locale codes — keep in sync with src/i18n.js
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

// Build xhtml:link alternates shared by every <url> entry
const xhtmlLinks = LOCALES.map(
  (code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${SITE_URL}/?lang=${code}"/>`
)
  .concat([`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`])
  .join('\n');

// Each locale gets its own <url> entry (Google multi-language sitemap best practice)
const urlEntries = LOCALES.map(
  (code) => `  <url>
    <loc>${SITE_URL}/?lang=${code}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${xhtmlLinks}
  </url>`
).join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
${xhtmlLinks}
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

// 4. Update README.md (Source)
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
