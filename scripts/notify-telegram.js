/* eslint-disable no-console, security/detect-object-injection */
/* eslint-env node */
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const environmentPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(environmentPath)) {
  const environmentConfig = fs.readFileSync(environmentPath, 'utf8');
  for (const line of environmentConfig.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replaceAll(/^["']|["']$/g, ''); // Remove quotes
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  process.exit(1);
}

const arguments_ = process.argv.slice(2);
const status = arguments_[0] || 'INFO'; // SUCCESS, FAILURE, INFO
const message = arguments_[1] || 'No message provided';
const version = arguments_[2] || 'N/A';

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

const request = https.request(
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
      if (res.statusCode === 200) {
        console.log('✔ Telegram notification sent.');
      } else {
        console.error(`❌ Telegram API Error: ${res.statusCode}`);
        console.error(responseBody);
        process.exit(1);
      }
    });
  }
);

request.on('error', (error) => {
  console.error(`❌ Network Error: ${error.message}`);
  process.exit(1);
});

request.write(data);
request.end();
