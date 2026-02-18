/* eslint-disable */
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://agubear.black';
const languages = ['zh-TW', 'zh-CN', 'yue', 'ja', 'ko', 'en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'tr', 'ru', 'uk', 'th', 'vi', 'id', 'ms', 'hi', 'ar'];
const tools = [
  '',
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

const lastmod = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

function generateAlternates(tool) {
  let links = '';
  languages.forEach(lang => {
    // For root tool (''), we want /lang
    // For other tools, we want /lang/tool
    // Ensure no double slashes if tool is empty
    const pathPart = tool ? `/${tool}` : '';
    const url = `${baseUrl}/${lang}${pathPart}`;
    links += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>\n`;
  });
  
  // x-default
  const defaultPath = tool ? `/${tool}` : '/';
  links += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${defaultPath}"/>\n`;
  return links;
}

// Generate URLs for all languages + tools
languages.forEach(lang => {
  tools.forEach(tool => {
    const pathPart = tool ? `/${tool}` : '';
    const url = `${baseUrl}/${lang}${pathPart}`;
    const priority = tool === '' ? '1.0' : '0.8';
    const changefreq = tool === '' ? 'daily' : 'weekly';
    
    xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${generateAlternates(tool)}  </url>\n`;
  });
});

// Also generate URLs for the root (x-default) paths?
// Usually sitemaps list canonical URLs.
// If valid URLs are /lang/tool, then we have listed them all.
// What about https://agubear.black/ (root)?
// It should be listed as well maybe?
// Let's add the root / separately if it's not covered.
// But wait, modern practice often treats the root as x-default for the homepage.
// I'll add the root set as well.

const rootTools = tools;
rootTools.forEach(tool => {
   const pathPart = tool ? `/${tool}` : '/';
   const url = `${baseUrl}${pathPart}`;
   const priority = tool === '' ? '1.0' : '0.8';
    
   xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
${generateAlternates(tool)}  </url>\n`;
});

xml += '</urlset>';

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
console.log(`✅ sitemap.xml generated with ${languages.length * tools.length + tools.length} URLs!`);
