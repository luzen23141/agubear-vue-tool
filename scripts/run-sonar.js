/* eslint-env node */
/* eslint-disable no-console, sonarjs/no-os-command-from-path, security/detect-object-injection */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseDotEnvironment = (content) => {
  for (const line of content.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

// Load .env file
const environmentPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(environmentPath)) {
  const environmentContent = fs.readFileSync(environmentPath, 'utf8');
  parseDotEnvironment(environmentContent);
}

console.log('🚀 Starting SonarQube analysis...');

const child = spawn('sonar-scanner', process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ SonarQube analysis completed successfully');
    process.exit(0);
  } else {
    console.error(`❌ SonarQube analysis failed with code ${code}`);
    process.exit(code);
  }
});
