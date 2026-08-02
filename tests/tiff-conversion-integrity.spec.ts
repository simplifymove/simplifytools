import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('TIFF to JPG uses server conversion and forwards quality', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/tiff-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'tiff'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`quality,`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);
  expect(source).not.toContain('convertImageFormat');
});

test('TIFF to PNG uses server conversion without fake quality control', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/tiff-to-png/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'tiff'`);
  expect(source).toContain(`to_format: 'png'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/png'`);

  expect(source).not.toContain('convertImageFormat');
  expect(source).not.toContain('Output Quality:');
  expect(source).not.toContain('setQuality');
});

test('TIFF pages do not claim browser-only processing', async () => {
  for (const file of [
    'app/all-tools/tiff-to-jpg/page.tsx',
    'app/all-tools/tiff-to-png/page.tsx',
  ]) {
    const source = fs.readFileSync(
      path.join(process.cwd(), file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/all conversions happen locally/i);
    expect(source).not.toMatch(/instant conversion in your browser/i);
  }
});

test('TIFF browser download policies require JPG and PNG output', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  expect(source).toContain(`'tiff-to-jpg': {`);
  expect(source).toContain(`'tiff-to-png': {`);
  expect(source).toContain(`mimeTypes: ['image/jpeg']`);
  expect(source).toContain(`mimeTypes: ['image/png']`);
});
