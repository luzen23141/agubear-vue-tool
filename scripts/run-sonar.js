/* eslint-env node */
/* eslint-disable no-console, sonarjs/no-os-command-from-path, security/detect-object-injection */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
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
  });
}

console.log('🚀 Starting SonarQube analysis...');

const child = spawn('sonar-scanner', process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ SonarQube analysis failed with code ${code}`);
    process.exit(code);
  } else {
    console.log('✅ SonarQube analysis completed successfully');
    process.exit(0);
  }
});
