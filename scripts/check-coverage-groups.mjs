/* eslint-env node */
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const coverageFile = path.join(projectRoot, 'coverage', 'coverage-final.json');
const outputFile = path.join(projectRoot, 'reports', 'quality', 'coverage-groups.json');

const THRESHOLDS = {
  unit: 30,
  integration: 50,
  component: 50,
  e2e: 15
};

function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function getGroup(filePath) {
  const relativePath = toPosix(path.relative(srcRoot, filePath));

  if (relativePath.startsWith('components/')) return 'component';
  if (relativePath.startsWith('composables/')) return 'integration';
  return 'unit';
}

function percentage(covered, total) {
  if (total === 0) return 100;
  return Number(((covered / total) * 100).toFixed(2));
}

function summarizeCountMap(counter) {
  const values = Object.values(counter ?? {});
  return {
    covered: values.filter((value) => value > 0).length,
    total: values.length
  };
}

function summarizeBranchMap(counter) {
  const values = Object.values(counter ?? {});
  return {
    covered: values.reduce(
      (sum, branchCounts) => sum + branchCounts.filter((value) => value > 0).length,
      0
    ),
    total: values.reduce((sum, branchCounts) => sum + branchCounts.length, 0)
  };
}

function summarizeFile(file) {
  const lineCounter = file?.l ?? file?.s ?? {};
  const statementCounter = file?.s ?? {};
  const functionCounter = file?.f ?? {};
  const branchCounter = file?.b ?? {};

  return {
    lines: summarizeCountMap(lineCounter),
    statements: summarizeCountMap(statementCounter),
    functions: summarizeCountMap(functionCounter),
    branches: summarizeBranchMap(branchCounter)
  };
}

function resolveE2eGate(e2eGroup) {
  const requireE2ECoverage = process.env.COVERAGE_REQUIRE_E2E === 'true';

  if (typeof e2eGroup.coveragePercent === 'number') {
    return e2eGroup.coveragePercent >= THRESHOLDS.e2e;
  }

  return !requireE2ECoverage;
}

function summarizeGroup(files) {
  const summary = {
    lines: { covered: 0, total: 0 },
    statements: { covered: 0, total: 0 },
    functions: { covered: 0, total: 0 },
    branches: { covered: 0, total: 0 }
  };

  for (const file of files) {
    const metrics = summarizeFile(file);
    for (const metric of Object.keys(summary)) {
      summary[metric].covered += metrics[metric].covered;
      summary[metric].total += metrics[metric].total;
    }
  }

  return Object.fromEntries(
    Object.entries(summary).map(([metric, value]) => [
      metric,
      percentage(value.covered, value.total)
    ])
  );
}

function main() {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const groupedFiles = {
    unit: [],
    integration: [],
    component: []
  };

  for (const [filePath, metrics] of Object.entries(coverage)) {
    if (!filePath.startsWith(srcRoot)) continue;
    const group = getGroup(filePath);
    groupedFiles[group].push(metrics);
  }

  const groups = {
    unit: summarizeGroup(groupedFiles.unit),
    integration: summarizeGroup(groupedFiles.integration),
    component: summarizeGroup(groupedFiles.component),
    e2e: {
      status: 'pending-browser-coverage',
      threshold: THRESHOLDS.e2e,
      coveredFlows: ['timestamp', 'home', 'accessibility'],
      coveragePercent: null
    }
  };

  const gates = {
    unit: groups.unit.lines >= THRESHOLDS.unit,
    integration: groups.integration.lines >= THRESHOLDS.integration,
    component: groups.component.lines >= THRESHOLDS.component,
    e2e: resolveE2eGate(groups.e2e)
  };

  const result = {
    thresholds: THRESHOLDS,
    policy: {
      e2e: {
        requireCoverage: process.env.COVERAGE_REQUIRE_E2E === 'true'
      }
    },
    groups,
    gates,
    passed: Object.values(gates).every(Boolean)
  };

  ensureDir(path.dirname(outputFile));
  fs.writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Wrote ${path.relative(projectRoot, outputFile)}`);

  if (!result.passed) {
    process.exit(1);
  }
}

main();
