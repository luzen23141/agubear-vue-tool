/* eslint-disable */
/* eslint-env node */
import { spawn, execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

import { checkDependencyIntegrity } from './check-deps.js';

const steps = [
  { name: 'Case Check', type: 'internal', fn: checkCaseSensitivity },
  {
    name: 'Dependency Integrity',
    type: 'internal',
    fn: () => {
      const { success, issues } = checkDependencyIntegrity();
      if (!success) {
        issues.forEach(({ pkg, files }) => {
          console.error(chalk.yellow(`  └─ "${pkg}" imported by: ${files.join(', ')}`));
        });
      }
      return success;
    }
  },
  { name: 'Lint (Strict)', command: 'pnpm', args: ['run', 'lint:strict'] },
  { name: 'Lint (Architecture)', command: 'pnpm', args: ['run', 'lint:arch'] },
  { name: 'Type Check', command: 'pnpm', args: ['run', 'type-check'] },
  { name: 'Test', command: 'pnpm', args: ['run', 'test:unit'] },
  { name: 'Security Audit', command: 'pnpm', args: ['run', 'scan:security'] },
  { name: 'Duplicate Check', command: 'pnpm', args: ['run', 'scan:dup'] },
  { name: 'Build Check', command: 'pnpm', args: ['run', 'build'] },
  { name: 'Localization Audit', command: 'node', args: ['scripts/audit-locales.js'] }
];

const results = [];

async function runStep(step) {
  process.stdout.write(chalk.blue(`▶ [${step.name}] `));
  const startTime = Date.now();

  if (step.type === 'internal') {
    const success = step.fn();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    results.push({ name: step.name, success, duration });
    console.log(
      success ? chalk.green(`✔ Passed (${duration}s)`) : chalk.red(`✘ Failed (${duration}s)`)
    );
    return success;
  }

  return new Promise((resolve) => {
    const child = spawn(step.command, step.args, { stdio: 'ignore', shell: false });

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const success = code === 0;

      if (success) {
        console.log(chalk.green(`✔ Passed (${duration}s)`));
      } else {
        console.log(chalk.red(`✘ Failed (${duration}s)`));
      }

      results.push({ name: step.name, success, duration });
      resolve(success);
    });
  });
}

function checkCaseSensitivity() {
  let issues = [];
  try {
    const gitFiles = execSync('git ls-files', { encoding: 'utf-8', cwd: projectRoot })
      .split('\n')
      .filter(Boolean);

    for (const file of gitFiles) {
      const fullPath = path.resolve(projectRoot, file);
      try {
        // macOS APFS native check for real case-sensitive path
        const realPath = fs.realpathSync.native(fullPath);
        const relativePath = path.relative(projectRoot, realPath);

        if (relativePath !== file) {
          issues.push(`${file} (on disk: ${relativePath})`);
        }
      } catch {
        // Skip missing files
      }
    }
  } catch (e) {
    console.warn(chalk.yellow('! Unable to access git index:', e.message));
    return false;
  }

  if (issues.length > 0) {
    issues.forEach((i) => console.error(chalk.yellow(`  └─ ${i}`)));
    return false;
  }
  return true;
}

async function main() {
  console.log(chalk.cyan.bold('\nStarting Project Audit\n'));

  let allPassed = true;

  for (const step of steps) {
    const success = await runStep(step);
    if (!success) {
      allPassed = false;
      console.log(chalk.red.bold('\n[ABORT] Audit failed. Correct errors and retry.'));
      break;
    }
  }

  if (allPassed) {
    console.log(chalk.green.bold('\nAudit completed successfully. All systems green.\n'));
  }

  process.exit(allPassed ? 0 : 1);
}

main();
