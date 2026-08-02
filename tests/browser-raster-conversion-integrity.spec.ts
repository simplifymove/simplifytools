import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('shared image converter is genuinely browser-side Canvas conversion', async () => {
  const source = read('app/lib/imageTools.ts');

  expect(source).toContain('new FileReader()');
  expect(source).toContain('new Image()');
  expect(source).toContain(`document.createElement('canvas')`);
  expect(source).toContain('canvas.toBlob(');
  expect(source).not.toContain(`fetch('/api/convert'`);
});

test('JPG and PNG to WebP quality sliders are wired to Canvas encoding', async () => {
  for (const file of [
    'app/all-tools/jpg-to-webp/page.tsx',
    'app/all-tools/png-to-webp/page.tsx',
  ]) {
    const source = read(file);

    expect(source).toContain(`convertImageFormat(file, 'image/webp', {`);
    expect(source).toContain('quality,');
    expect(source).toContain('setQuality');
  }
});

test('GIF to PNG does not expose a fake PNG quality control', async () => {
  const source = read('app/all-tools/gif-to-png/page.tsx');

  expect(source).toContain(
    `const result = await convertImageFormat(file, 'image/png');`,
  );

  expect(source).not.toContain('setQuality');
  expect(source).not.toMatch(/Output Quality/i);
  expect(source).not.toMatch(/quality level/i);
  expect(source).not.toContain('quality: quality');
});

test('GIF to PNG copy accurately describes static first-frame conversion', async () => {
  const source = read('app/all-tools/gif-to-png/page.tsx');

  expect(source).toContain('first rendered frame');
  expect(source).toContain('static PNG');

  expect(source).not.toMatch(/all GIF types/i);
  expect(source).not.toMatch(/all convert successfully/i);
  expect(source).not.toMatch(/quality remains excellent/i);
  expect(source).not.toMatch(/without quality loss/i);
});

test('PNG output converter registry does not advertise meaningless quality options', async () => {
  const source = read('app/lib/converters.ts');

  for (const [slug, nextSlug] of [
    ['jpg-to-png', 'jpg-to-webp'],
    ['webp-to-png', 'heic-to-jpg'],
  ]) {
    const start = source.indexOf(`id: '${slug}'`);
    const end = source.indexOf(`id: '${nextSlug}'`, start);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const block = source.slice(start, end);

    expect(block).not.toContain('supportedOptions: [\'quality');
    expect(block).not.toContain('defaultOptions: { quality:');
  }
});

test('browser raster download policies require correct output MIME types', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  const expected: Array<[string, string]> = [
    ['jpg-to-png', 'image/png'],
    ['png-to-jpg', 'image/jpeg'],
    ['jpg-to-webp', 'image/webp'],
    ['png-to-webp', 'image/webp'],
    ['webp-to-jpg', 'image/jpeg'],
    ['webp-to-png', 'image/png'],
    ['gif-to-jpg', 'image/jpeg'],
    ['gif-to-png', 'image/png'],
    ['edit-to-png', 'image/png'],
  ];

  for (const [slug, mime] of expected) {
    const start = source.indexOf(`'${slug}'`);
    expect(start).toBeGreaterThan(-1);

    const block = source.slice(start, start + 220);
    expect(block).toContain(`mimeTypes: ['${mime}']`);
  }
});
