/* eslint-disable no-console, max-statements */
/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const localVersionPath = path.join(publicDir, 'version.json');

const LIVE_URL = 'https://agubear.black/version.json';
const MAX_RETRIES = 20;

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchLiveVersion() {
  try {
    const res = await fetchWithTimeout(`${LIVE_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
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
    console.error(chalk.red('[ERROR] Failed to read local version.json'), e.message);
    process.exit(1);
    throw e;
  }
}

async function verify() {
  const localVersion = getLocalVersion();
  console.log(chalk.cyan.bold('\nStarting Deployment Verification\n'));
  console.log(chalk.blue(`▶ [Verify] Target: ${LIVE_URL}`));
  console.log(chalk.gray(`  └─ Local Commit: ${localVersion.commitHash}`));

  for (let i = 1; i <= MAX_RETRIES; i++) {
    // eslint-disable-next-line no-await-in-loop
    const liveVersion = await fetchLiveVersion();

    if (liveVersion) {
      if (liveVersion.commitHash === localVersion.commitHash) {
        console.log(chalk.green(`✔ Passed (Attempt ${i}): Live version matches local build.`));
        return true;
      }
      process.stdout.write(
        chalk.yellow(`\r  [Wait] Version mismatch (Propagating...). Attempt ${i}/${MAX_RETRIES}`)
      );
    } else {
      process.stdout.write(
        chalk.yellow(`\r  [Wait] Fetch failed (Retrying...). Attempt ${i}/${MAX_RETRIES}`)
      );
    }

    if (i < MAX_RETRIES) {
      // Exponential Backoff: 5s, 7s, 11s, 17s... (capped at 30s)
      const delay = Math.min(5000 + Math.pow(1.5, i) * 1000, 30000);
      // eslint-disable-next-line no-await-in-loop
      await sleep(delay);
    }
  }

  console.error(chalk.red('\n\n[ABORT] Deployment verification failed after multiple attempts.'));
  return false;
}

async function warmUpCache() {
  console.log(chalk.blue('\n▶ [Warm-up] Starting CDN Cache Warm-up...'));
  const sitemapUrl = 'https://agubear.black/sitemap.xml';

  try {
    const response = await fetchWithTimeout(sitemapUrl);
    if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.status}`);

    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

    console.log(chalk.gray(`  └─ Found ${urls.length} URLs in sitemap.`));

    const batchSize = 5;
    let successCount = 0;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(batch.map((url) => fetchWithTimeout(url)));

      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value.ok) successCount++;
      });

      process.stdout.write(
        chalk.gray(`\r  [Progress] ${Math.min(i + batchSize, urls.length)}/${urls.length}`)
      );
    }

    console.log(
      chalk.green(`\n✔ Passed: Cache warm-up complete (${successCount}/${urls.length} verified).`)
    );
  } catch (error) {
    console.warn(chalk.yellow(`\n! Sitemap warm-up skipped: ${error.message}`));
  }
}

(async () => {
  const verificationSuccess = await verify();
  if (!verificationSuccess) {
    process.exit(1);
  }
  await warmUpCache();
  console.log(chalk.green.bold('\nDeployment fully verified.\n'));
  process.exit(0);
})();
