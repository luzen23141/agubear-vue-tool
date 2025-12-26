/* eslint-disable no-console, max-statements */
/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const localVersionPath = path.join(publicDir, 'version.json');

const LIVE_URL = 'https://agubear.black/version.json';
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchLiveVersion() {
  try {
    // Add cache-busting param
    const res = await fetch(`${LIVE_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Attempt failed: ${e.message}`);
    return null;
  }
}

function getLocalVersion() {
  try {
    if (!fs.existsSync(localVersionPath)) {
      throw new Error(`Local version file not found at ${localVersionPath}`);
    }
    return JSON.parse(fs.readFileSync(localVersionPath, 'utf-8'));
  } catch (e) {
    console.error('Failed to read local version.json', e);
    process.exit(1);
    throw e; // Unreachable but satisfies linter
  }
}

async function verify() {
  const localVersion = getLocalVersion();
  console.log('📦 Local Version:', localVersion);

  console.log(`🔍 Checking live version at ${LIVE_URL}...`);

  for (let i = 1; i <= MAX_RETRIES; i++) {
    const liveVersion = await fetchLiveVersion(); // eslint-disable-line no-await-in-loop

    if (liveVersion) {
      console.log(`   [Attempt ${i}/${MAX_RETRIES}] Live:`, liveVersion);

      if (liveVersion.commitHash === localVersion.commitHash) {
        console.log('✅ Deployment Verified! Live version matches local build.');
        return true;
      }
      console.log('   ⚠️  Version mismatch. Waiting for propagation...');
    } else {
      console.log('   ⚠️  Fetch failed. Waiting...');
    }

    if (i < MAX_RETRIES) await sleep(RETRY_DELAY_MS); // eslint-disable-line no-await-in-loop
  }

  console.error('❌ Deployment verification failed after multiple attempts.');
  console.error('   Expected Commit:', localVersion.commitHash);
  return false; // Indicate failure
}

/**
 * Step 2: Warm up CDN Cache by crawling Sitemap
 */
async function warmUpCache() {
  console.log('\n🌍 Starting CDN Cache Warm-up...');
  const sitemapUrl = 'https://agubear.black/sitemap.xml';

  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.status}`);

    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

    console.log(`📑 Found ${urls.length} URLs in sitemap.`);

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    let successCount = 0;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        batch.map(async (url) => {
          try {
            const res = await fetch(url); // GET details to ensure full cache warm-up
            if (res.ok) successCount++;
          } catch (e) {
            console.warn(`⚠️ Failed to warm up: ${url} - ${e.message}`);
          }
        })
      );
      process.stdout.write(`\r🚀 Progress: ${Math.min(i + batchSize, urls.length)}/${urls.length}`);
    }

    console.log(`\n✨ Cache warm-up complete! (${successCount}/${urls.length} verified)`);
  } catch (error) {
    console.warn(`⚠️ Sitemap warm-up skipped: ${error.message}`);
  }
}

// Main execution
(async () => {
  const verificationSuccess = await verify();
  if (!verificationSuccess) {
    process.exit(1);
  }
  await warmUpCache();
  process.exit(0);
})();
