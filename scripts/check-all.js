/* eslint-env node */
import { spawn, execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const steps = [
  { name: 'Lint (Strict)', command: 'npm', args: ['run', 'lint:strict'] },
  { name: 'Lint (Architecture)', command: 'npm', args: ['run', 'lint:arch'] },
  { name: 'Type Check', command: 'npm', args: ['run', 'type-check'] },
  { name: 'Test', command: 'npm', args: ['run', 'test'] },
  { name: 'Security Audit', command: 'npm', args: ['run', 'scan:security'] },
  { name: 'Duplicate Check', command: 'npm', args: ['run', 'scan:dup'] },
  { name: 'Build Check', command: 'npm', args: ['run', 'build'] }
];

const results = [];

async function runStep(step) {
  console.log(chalk.blue.bold(`\n▶ Starting: ${step.name}...`));
  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn(step.command, step.args, { stdio: 'inherit', shell: false });

    child.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const success = code === 0;

      if (success) {
        console.log(chalk.green(`✔ ${step.name} completed in ${duration}s`));
      } else {
        console.log(chalk.red(`✘ ${step.name} failed in ${duration}s`));
      }

      results.push({ ...step, success, duration });
      resolve(success);
    });
  });
}

function checkCaseSensitivity() {
  console.log(chalk.blue.bold(`\n▶ Starting: Case Sensitivity Check...`));
  const startTime = Date.now();
  let issues = [];

  try {
    const gitFiles = execSync('git ls-files', { encoding: 'utf-8', cwd: projectRoot })
      .split('\n')
      .filter(Boolean);

    for (const file of gitFiles) {
      const parts = file.split('/');
      let currentPath = projectRoot;

      for (const part of parts) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const actualNames = fs.readdirSync(currentPath);
        const match = actualNames.find((n) => n.toLowerCase() === part.toLowerCase());

        if (match && match !== part) {
          issues.push(`${file}: Path segment '${part}' matches '${match}' on disk (Case Mismatch)`);
        } else if (!match) {
          // Should not happen for git files unless ignored/deleted
        }

        currentPath = path.join(currentPath, part);
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          if (!fs.statSync(currentPath).isDirectory()) break;
        } catch {
          break;
        }
      }
    }
  } catch (e) {
    console.warn(chalk.yellow('⚠️  Could not run git ls-files or access fs:', e.message));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  if (issues.length > 0) {
    console.log(chalk.red(`✘ Case Sensitivity Check failed in ${duration}s`));
    issues.forEach((i) => console.error(chalk.yellow(`  - ${i}`)));
    results.push({ name: 'Case Check', success: false, duration });
    return false;
  }

  console.log(chalk.green(`✔ Case Sensitivity Check completed in ${duration}s`));
  results.push({ name: 'Case Check', success: true, duration });
  return true;
}

async function main() {
  console.log(chalk.cyan.bold('🚀 Starting full project check...'));

  let allPassed = true;

  for (const step of steps) {
    const success = await runStep(step);
    if (!success) {
      allPassed = false;
      console.log(chalk.red.bold('\n🛑 Check failed. Stopping execution.'));
      break;
    }
  }

  if (allPassed) {
    const caseSuccess = checkCaseSensitivity();
    if (!caseSuccess) allPassed = false;
  }

  console.log(chalk.white.bold('\n📊 Check Summary:'));
  console.table(
    results.map((r) => ({
      Step: r.name,
      Status: r.success ? 'PASS' : 'FAIL',
      Duration: `${r.duration}s`
    }))
  );

  if (allPassed) {
    console.log(chalk.green.bold('\n✨ All checks passed successfully!'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n💥 Some checks failed.'));
    process.exit(1);
  }
}

main();
