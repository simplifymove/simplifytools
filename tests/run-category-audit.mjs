import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const category = process.argv[2];

if (!category) {
  console.error('Missing audit category. Usage: node tests/run-category-audit.mjs <category>');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const command = process.execPath;
const specFile = category === 'pdf-tools' && process.env.PDF_AUDIT_DEEP === 'true'
  ? 'tests/pdf-tools.spec.ts'
  : 'tests/tool-category.spec.ts';
const args = [require.resolve('@playwright/test/cli'), 'test', specFile];
if (process.env.AUDIT_GREP) {
  args.push('--grep', process.env.AUDIT_GREP);
}

if (specFile === 'tests/tool-category.spec.ts') {
  const requestedWorkers = process.env.AUDIT_WORKERS || '1';
  const workers = requestedWorkers === 'auto' ? undefined : Number.parseInt(requestedWorkers, 10);
  if (requestedWorkers === 'auto') {
    args.push('--workers=50%');
  } else if ([1, 2, 4].includes(workers)) {
    args.push(`--workers=${workers}`);
  } else {
    args.push('--workers=1');
  }
}
const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    AUDIT_CATEGORY: category,
  },
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  windowsHide: true,
});

let settledFromSummary = false;
let summaryExitCode = 1;
let lineBuffer = '';
let observedFailure = false;
let observedResultCount = 0;
let expectedResultCount = 0;
let postSummaryWatchdog;

function stopOwnedProcessTree() {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else if (!child.killed) {
    child.kill('SIGTERM');
  }
}

function inspectOutput(chunk) {
  lineBuffer += chunk;
  const lines = lineBuffer.split(/\r?\n/);
  lineBuffer = lines.pop() || '';
  for (const line of lines) {
    const runningMatch = /Running\s+(\d+)\s+tests?/.exec(line);
    if (runningMatch) expectedResultCount = Number(runningMatch[1]);
    const resultMarker = line.indexOf('AUDIT_TOOL_RESULT:');
    if (resultMarker >= 0) {
      try {
        const result = JSON.parse(line.slice(resultMarker + 'AUDIT_TOOL_RESULT:'.length));
        observedResultCount += 1;
        observedFailure ||= result.status === 'failed';
      } catch {
        // The Playwright exit code remains authoritative for malformed markers.
      }
    }
    const categorySummaryIndex = line.indexOf('CATEGORY_AUDIT_SUMMARY ');
    const finalPlaywrightSummary = /^\s*\d+\s+(?:failed|passed|skipped)(?:\s|,|\()/.test(line);
    const completeCategorySummary = categorySummaryIndex >= 0 && expectedResultCount > 0 && observedResultCount >= expectedResultCount;
    if ((!completeCategorySummary && !finalPlaywrightSummary) || settledFromSummary) continue;
    try {
      settledFromSummary = true;
      if (completeCategorySummary) {
        const summary = JSON.parse(line.slice(categorySummaryIndex + 'CATEGORY_AUDIT_SUMMARY '.length));
        summaryExitCode = observedFailure || Number(summary.failedCount || 0) > 0 ? 1 : 0;
      } else {
        summaryExitCode = observedFailure || /\bfailed\b/.test(line) ? 1 : 0;
      }
      postSummaryWatchdog = setTimeout(() => {
        console.error(`Category audit for ${category} did not exit within 15 seconds after its final summary; terminating owned process tree`);
        stopOwnedProcessTree();
        setTimeout(() => process.exit(summaryExitCode), 250);
      }, 15_000);
    } catch {
      // The normal exit handler remains authoritative.
    }
  }
}

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  inspectOutput(text);
});
child.stderr.on('data', (chunk) => process.stderr.write(chunk));

child.on('exit', (code, signal) => {
  if (postSummaryWatchdog) clearTimeout(postSummaryWatchdog);
  if (settledFromSummary) {
    process.exit(summaryExitCode);
  }
  if (signal) {
    console.error(`Category audit for ${category} stopped by signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(`Failed to start category audit for ${category}: ${error.message}`);
  process.exit(1);
});
