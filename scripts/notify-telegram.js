/* eslint-disable no-console, security/detect-object-injection */
/* eslint-env node */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  process.exit(1);
}

const args = process.argv.slice(2);
const status = args[0] || 'INFO'; // SUCCESS, FAILURE, INFO
const message = args[1] || 'No message provided';
const version = args[2] || 'N/A';

const icons = {
  SUCCESS: '✅',
  FAILURE: '❌',
  INFO: 'ℹ️',
  WARNING: '⚠️'
};

const icon = icons[status] || icons.INFO;

const payload = {
  chat_id: CHAT_ID,
  parse_mode: 'HTML',
  text: `
📦 <b>Deployment Report</b>

<b>Status</b>: ${status} ${icon}
<b>Version</b>: ${version}
<b>Env</b>: Production
<b>Artifacts</b>: <a href="https://github.com/luzen23141/agubear-vue-tool/actions">View Visual Logs</a> (if available)

${message}
`
};

const data = JSON.stringify(payload);

const req = https.request(
  {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  },
  (res) => {
    let responseBody = '';
    res.on('data', (d) => {
      responseBody += d;
    });
    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.error(`❌ Telegram API Error: ${res.statusCode}`);
        console.error(responseBody);
        process.exit(1);
      } else {
        console.log('✔ Telegram notification sent.');
      }
    });
  }
);

req.on('error', (e) => {
  console.error(`❌ Network Error: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end();
