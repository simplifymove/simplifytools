import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('EPS to JPG uses server vector rendering', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/eps-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'eps'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`dpi: 300`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);
  expect(source).not.toContain('convertImageFormat');
});

test('EPS to PNG uses server vector rendering', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/eps-to-png/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'eps'`);
  expect(source).toContain(`to_format: 'png'`);
  expect(source).toContain(`dpi: 300`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/png'`);
  expect(source).not.toContain('convertImageFormat');
});

test('EPS pages do not claim browser-only processing or unlimited files', async () => {
  for (const file of [
    'app/all-tools/eps-to-jpg/page.tsx',
    'app/all-tools/eps-to-png/page.tsx',
  ]) {
    const source = fs.readFileSync(
      path.join(process.cwd(), file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/instant conversion in your browser/i);
    expect(source).not.toMatch(/no file size limits/i);
    expect(source).not.toMatch(/privacy is completely protected/i);
  }
});

test('EPS download policies require JPG and PNG output', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  expect(source).toContain(`'eps-to-jpg': {`);
  expect(source).toContain(`mimeTypes: ['image/jpeg']`);

  expect(source).toContain(`'eps-to-png': {`);
  expect(source).toContain(`mimeTypes: ['image/png']`);
});
