/* eslint-disable no-console, max-statements */
/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDirectory = path.join(projectRoot, 'public');
const localVersionPath = path.join(publicDirectory, 'version.json');

const LIVE_URL = 'https://agubear.black/version.json';
const MAX_RETRIES = 20;

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(url, options = {}, timeout = 10_000) {
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
    return JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
  } catch (error) {
    console.error(chalk.red('[ERROR] Failed to read local version.json'), error.message);
    process.exit(1);
    throw error;
  }
}

async function verify() {
  const localVersion = getLocalVersion();
  console.log(chalk.cyan.bold('\nStarting Deployment Verification\n'));
  console.log(chalk.blue(`▶ [Verify] Target: ${LIVE_URL}`));
  console.log(chalk.gray(`  └─ Local Commit: ${localVersion.commitHash}`));

  for (let index = 1; index <= MAX_RETRIES; index++) {
    // eslint-disable-next-line no-await-in-loop
    const liveVersion = await fetchLiveVersion();

    if (liveVersion) {
      if (liveVersion.commitHash === localVersion.commitHash) {
        console.log(chalk.green(`✔ Passed (Attempt ${index}): Live version matches local build.`));
        return true;
      }
      process.stdout.write(
        chalk.yellow(
          `\r  [Wait] Version mismatch (Propagating...). Attempt ${index}/${MAX_RETRIES}`
        )
      );
    } else {
      process.stdout.write(
        chalk.yellow(`\r  [Wait] Fetch failed (Retrying...). Attempt ${index}/${MAX_RETRIES}`)
      );
    }

    if (index < MAX_RETRIES) {
      // Exponential Backoff: 5s, 7s, 11s, 17s... (capped at 30s)
      const delay = Math.min(5000 + Math.pow(1.5, index) * 1000, 30_000);
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
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

    console.log(chalk.gray(`  └─ Found ${urls.length} URLs in sitemap.`));

    const batchSize = 5;
    let successCount = 0;

    const processBatch = async (batch) => {
      const results = await Promise.allSettled(batch.map((url) => fetchWithTimeout(url)));
      return results.filter((res) => res.status === 'fulfilled' && res.value.ok).length;
    };

    for (let index = 0; index < urls.length; index += batchSize) {
      const batch = urls.slice(index, index + batchSize);
      // eslint-disable-next-line no-await-in-loop
      successCount += await processBatch(batch);

      process.stdout.write(
        chalk.gray(`\r  [Progress] ${Math.min(index + batchSize, urls.length)}/${urls.length}`)
      );
    }

    console.log(
      chalk.green(`\n✔ Passed: Cache warm-up complete (${successCount}/${urls.length} verified).`)
    );
  } catch (error) {
    console.warn(chalk.yellow(`\n! Sitemap warm-up skipped: ${error.message}`));
  }
}

function checkGitStatus() {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.warn(chalk.yellow('⚠️  Warning: You have uncommitted changes.'));
    }

    // Check if local is ahead of remote
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const ahead = execSync('git log @{u}..HEAD').toString();
    if (ahead) {
      console.error(chalk.red('\n🚨 Error: You have unpushed commits. Local is ahead of remote.'));
      console.error(chalk.red('   Run "git push" to deploy your changes before verifying.\n'));
      return false;
    }
    return true;
  } catch (error) {
    // If no upstream is configured, git log @{u}..HEAD might fail
    console.warn(
      chalk.yellow(
        `⚠️  Warning: Could not check git upstream status. Assuming okay. (${error.message})`
      )
    );
    return true;
  }
}

(async () => {
  if (!checkGitStatus()) {
    process.exit(1);
  }

  const verificationSuccess = await verify();
  if (!verificationSuccess) {
    process.exit(1);
  }
  await warmUpCache();
  console.log(chalk.green.bold('\nDeployment fully verified.\n'));
  process.exit(0);
})();
