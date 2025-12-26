/* eslint-disable no-console */
/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

function getCommitHash() {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    console.warn('Failed to get git commit hash', e);
    return 'unknown';
  }
}

function getPackageVersion() {
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch (e) {
    console.warn('Failed to read package.json', e);
    return '0.0.0';
  }
}

const versionInfo = {
  version: getPackageVersion(),
  commitHash: getCommitHash(),
  buildTime: new Date().toISOString(),
  timestamp: Date.now()
};

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'version.json');
fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

console.log('✅ Generated version.json:', versionInfo);
