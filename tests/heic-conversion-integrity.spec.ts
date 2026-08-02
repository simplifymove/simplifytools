import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('HEIC to JPG uses server conversion and JPEG MIME', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/heic-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'heic'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);
  expect(source).not.toContain('convertImageFormat');
});

test('HEIC to PNG uses server conversion and PNG MIME', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/heic-to-png/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'heic'`);
  expect(source).toContain(`to_format: 'png'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/png'`);
  expect(source).not.toContain('convertImageFormat');
});

test('HEIC pages do not claim browser-only processing', async () => {
  for (const file of [
    'app/all-tools/heic-to-jpg/page.tsx',
    'app/all-tools/heic-to-png/page.tsx',
  ]) {
    const source = fs.readFileSync(
      path.join(process.cwd(), file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/no uploads to servers/i);
    expect(source).not.toMatch(/all conversion happens locally/i);
    expect(source).not.toMatch(/conversion happens instantly in your browser/i);
  }
});

test('raster JPG alpha handling uses bg_color safely', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'python/engines/raster.py'),
    'utf8',
  );

  expect(source).toContain(
    `options.get('bg_color', '#FFFFFF')`,
  );
  expect(source).toContain(
    `falling back to #FFFFFF`,
  );
  expect(source).not.toContain(
    `x.lstrip('#')`,
  );
});
