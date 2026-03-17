/* eslint-disable no-console, max-statements, no-await-in-loop */
/* eslint-env node */
import { spawn, execSync } from 'node:child_process';
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkDependencyIntegrity } from './check-deps.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const isDeepAudit = process.env.CHECK_ALL_DEEP === 'true';
const deepOnlySteps = ['Unit Timing Report', 'E2E Timing Report', 'E2E Flaky Report', 'Mutation'];

const steps = [
  { name: 'Case Check', type: 'internal', fn: checkCaseSensitivity },
  {
    name: 'Dependency Integrity',
    type: 'internal',
    fn: () => {
      const { success, issues } = checkDependencyIntegrity();
      if (!success) {
        for (const { pkg, files } of issues) {
          console.error(chalk.yellow(`  └─ "${pkg}" imported by: ${files.join(', ')}`));
        }
      }
      return success;
    }
  },
  { name: 'Lint (Strict)', command: 'pnpm', args: ['run', 'lint:strict'] },
  { name: 'Lint (Architecture)', command: 'pnpm', args: ['run', 'lint:arch'] },
  { name: 'Type Check', command: 'pnpm', args: ['run', 'type-check'] },
  { name: 'Test', command: 'pnpm', args: ['run', 'test:unit'] },
  ...(isDeepAudit
    ? [{ name: 'Unit Timing Report', command: 'pnpm', args: ['run', 'test:unit:timing'] }]
    : []),
  ...(isDeepAudit
    ? [{ name: 'E2E Timing Report', command: 'pnpm', args: ['run', 'test:e2e:timing'] }]
    : []),
  ...(isDeepAudit
    ? [{ name: 'E2E Flaky Report', command: 'pnpm', args: ['run', 'test:e2e:flaky'] }]
    : []),
  { name: 'Coverage Groups', command: 'pnpm', args: ['run', 'coverage:groups'] },
  ...(isDeepAudit ? [{ name: 'Mutation', command: 'pnpm', args: ['run', 'mutation'] }] : []),
  { name: 'Security Audit', command: 'pnpm', args: ['run', 'scan:security'] },
  { name: 'Duplicate Check', command: 'pnpm', args: ['run', 'scan:dup'] },
  { name: 'Build Check', command: 'pnpm', args: ['run', 'build'] },
  { name: 'Localization Audit', command: 'node', args: ['scripts/audit-locales.js'] }
];

async function runStep(step) {
  process.stdout.write(chalk.blue(`▶ [${step.name}] `));
  const startTime = Date.now();

  if (step.type === 'internal') {
    const success = step.fn();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
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

      resolve(success);
    });
  });
}

function checkCaseSensitivity() {
  const issues = [];
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const gitFiles = execSync('git ls-files', { encoding: 'utf8', cwd: projectRoot })
      .split('\n')
      .filter(Boolean);

    for (const file of gitFiles) {
      const fullPath = path.resolve(projectRoot, file);
      try {
        // macOS APFS native check for real case-sensitive path
        const realPath = fs.realpathSync.native(fullPath);
        const relativePath = path.relative(projectRoot, realPath);

        // eslint-disable-next-line max-depth
        if (relativePath !== file) {
          issues.push(`${file} (on disk: ${relativePath})`);
        }
      } catch {
        // Skip missing files
      }
    }
  } catch (error) {
    console.warn(chalk.yellow('! Unable to access git index:', error.message));
    return false;
  }

  if (issues.length > 0) {
    for (const index of issues) console.error(chalk.yellow(`  └─ ${index}`));
    return false;
  }
  return true;
}

async function main() {
  console.log(chalk.cyan.bold('\nStarting Project Audit\n'));

  if (!isDeepAudit) {
    console.log(
      chalk.gray(
        `Deep-only steps skipped: ${deepOnlySteps.join(', ')} (set CHECK_ALL_DEEP=true to enable)\n`
      )
    );
  }

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
