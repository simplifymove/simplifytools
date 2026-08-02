import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('VSDX to JPG uses server-side document conversion', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/vsdx-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`from_format: 'vsdx'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);

  expect(source).not.toContain('convertImageFormat');
});

test('VSDX to JPG does not expose a fake quality control', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/vsdx-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).not.toMatch(/Output Quality/i);
  expect(source).not.toContain('setQuality');
  expect(source).not.toMatch(/Higher quality/i);
});

test('VSDX to JPG copy describes server processing accurately', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/vsdx-to-jpg/page.tsx'),
    'utf8',
  );

  expect(source).toContain('Server-assisted Visio conversion');
  expect(source).not.toMatch(/instant conversion in your browser/i);
  expect(source).not.toMatch(/never uploaded/i);
  expect(source).not.toMatch(/no file size limits/i);
});

test('VSDX to JPG download policy requires JPEG output', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  expect(source).toContain(`'vsdx-to-jpg': {`);
  expect(source).toContain(`extensions: ['.jpg', '.jpeg']`);
  expect(source).toContain(`mimeTypes: ['image/jpeg']`);
});
