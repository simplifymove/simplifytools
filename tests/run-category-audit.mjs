import { spawn } from 'node:child_process';
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
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
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
