/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const reportsDir = path.join(projectRoot, 'reports');

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function formatDuration(milliseconds) {
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

function collectVitestEntries(node, entries = []) {
  if (!node || typeof node !== 'object') return entries;

  if (Array.isArray(node.assertionResults)) {
    for (const assertion of node.assertionResults) {
      entries.push({
        framework: 'vitest',
        file: node.name,
        title: assertion.fullName || assertion.title,
        status: assertion.status,
        duration: assertion.duration ?? 0,
        failureMessages: assertion.failureMessages ?? []
      });
    }
  }

  if (Array.isArray(node.testResults)) {
    for (const child of node.testResults) collectVitestEntries(child, entries);
  }

  return entries;
}

function collectPlaywrightEntries(suite, titlePath = [], entries = []) {
  const nextTitlePath = suite.title ? [...titlePath, suite.title] : titlePath;

  if (Array.isArray(suite.specs)) {
    for (const spec of suite.specs) {
      const specTitlePath = [...nextTitlePath, spec.title].filter(Boolean);
      const tests = Array.isArray(spec.tests) ? spec.tests : [];

      for (const test of tests) {
        const results = Array.isArray(test.results) ? test.results : [];
        const failureMessages = results.flatMap((result) =>
          Array.isArray(result.errors)
            ? result.errors
                .map((error) => error?.message || error?.value || '')
                .filter(Boolean)
            : []
        );

        const duration = results.reduce((sum, result) => sum + (result.duration ?? 0), 0);
        const retryCount = results.length > 0 ? Math.max(results.length - 1, 0) : 0;
        const failedRuns = results.filter((result) => result.status !== 'passed').length;
        const status = failedRuns === 0 ? 'passed' : test.outcome || results.at(-1)?.status || 'failed';

        entries.push({
          framework: 'playwright',
          file: spec.file,
          title: specTitlePath.join(' > '),
          status,
          duration,
          retryCount,
          failedRuns,
          failureMessages
        });
      }
    }
  }

  if (Array.isArray(suite.suites)) {
    for (const childSuite of suite.suites) collectPlaywrightEntries(childSuite, nextTitlePath, entries);
  }

  return entries;
}

function summarizeTimings(entries, topN = 10) {
  const durations = entries
    .map((entry) => entry.duration ?? 0)
    .filter((duration) => Number.isFinite(duration))
    .sort((left, right) => left - right);

  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  const p95Index = durations.length === 0 ? 0 : Math.max(Math.ceil(durations.length * 0.95) - 1, 0);
  const p95 = durations[p95Index] ?? 0;
  const slowest = [...entries]
    .sort((left, right) => (right.duration ?? 0) - (left.duration ?? 0))
    .slice(0, topN)
    .map((entry) => ({
      framework: entry.framework,
      title: entry.title,
      file: entry.file,
      status: entry.status,
      durationMs: entry.duration ?? 0,
      duration: formatDuration(entry.duration ?? 0)
    }));

  return {
    totalTests: entries.length,
    totalDurationMs: totalDuration,
    totalDuration: formatDuration(totalDuration),
    p95DurationMs: p95,
    p95Duration: formatDuration(p95),
    slowest
  };
}

function summarizeFlakiness(entries) {
  const flakyTests = entries
    .filter((entry) => (entry.failedRuns ?? 0) > 0 || (entry.retryCount ?? 0) > 0)
    .map((entry) => ({
      framework: entry.framework,
      title: entry.title,
      file: entry.file,
      status: entry.status,
      reruns: (entry.retryCount ?? 0) + 1,
      failedRuns: entry.failedRuns ?? 0,
      failureTypes: entry.failureMessages ?? []
    }));

  return {
    flakyCount: flakyTests.length,
    flakyTests
  };
}

function main() {
  const mode = process.argv[2];
  const framework = process.argv[3];
  const inputPath = process.argv[4];

  if (!mode || !framework || !inputPath) {
    console.error(
      'Usage: node scripts/analyze-test-results.mjs <timing|flaky> <vitest|playwright> <report-file>'
    );
    process.exit(1);
  }

  if (!['timing', 'flaky'].includes(mode)) {
    console.error(`Unsupported mode: ${mode}`);
    process.exit(1);
  }

  if (!['vitest', 'playwright'].includes(framework)) {
    console.error(`Unsupported framework: ${framework}`);
    process.exit(1);
  }

  const absoluteInputPath = path.resolve(projectRoot, inputPath);
  const data = readJson(absoluteInputPath);
  const entries =
    framework === 'playwright'
      ? collectPlaywrightEntries(data)
      : Array.isArray(data.testResults)
        ? data.testResults.flatMap((result) => collectVitestEntries(result))
        : collectVitestEntries(data);

  const outputPath =
    mode === 'flaky'
      ? path.join(reportsDir, 'quality', `${framework}-flaky-summary.json`)
      : path.join(reportsDir, 'quality', `${framework}-timing-summary.json`);

  const summary = mode === 'flaky' ? summarizeFlakiness(entries) : summarizeTimings(entries);
  writeJson(outputPath, summary);
  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
}

main();
