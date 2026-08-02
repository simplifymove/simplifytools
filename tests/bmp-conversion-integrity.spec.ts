import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('BMP to JPG uses server conversion with genuine JPEG quality', async () => {
  const page = read('app/all-tools/bmp-to-jpg/page.tsx');

  expect(page).toContain(`from_format: 'bmp'`);
  expect(page).toContain(`to_format: 'jpg'`);
  expect(page).toContain(`options: { quality: 85 }`);
  expect(page).toContain(`fetch('/api/convert'`);
  expect(page).toContain(`blob.type !== 'image/jpeg'`);

  expect(page).not.toContain('convertImageFormat');
  expect(page).not.toMatch(/lossless quality/i);
});

test('BMP to PNG uses server conversion without fake quality option', async () => {
  const page = read('app/all-tools/bmp-to-png/page.tsx');
  const converters = read('app/lib/converters.ts');

  expect(page).toContain(`from_format: 'bmp'`);
  expect(page).toContain(`to_format: 'png'`);
  expect(page).toContain(`options: {}`);
  expect(page).toContain(`fetch('/api/convert'`);
  expect(page).toContain(`blob.type !== 'image/png'`);

  expect(page).not.toContain('convertImageFormat');

  const index = converters.indexOf(`id: 'bmp-to-png'`);
  expect(index).toBeGreaterThan(-1);

  const nextEntry = converters.indexOf(
    `id: 'heic-to-png'`,
    index,
  );
  expect(nextEntry).toBeGreaterThan(index);

  const block = converters.slice(index, nextEntry);

  expect(block).toContain(`defaultOptions: {}`);
  expect(block).toContain(`supportedOptions: []`);
  expect(block).not.toContain(`quality:`);
});

test('BMP PNG copy accurately describes server processing', async () => {
  const page = read('app/all-tools/bmp-to-png/page.tsx');

  expect(page).toContain(
    'uploaded for server-assisted conversion and processed only as needed',
  );

  expect(page).not.toMatch(/never uploaded/i);
  expect(page).not.toMatch(/all conversions happen in your browser/i);
  expect(page).not.toMatch(/completely private/i);
  expect(page).not.toMatch(/privacy guaranteed/i);
  expect(page).not.toMatch(/without quality loss/i);
});

test('BMP backend supports genuine JPG and PNG outputs', async () => {
  const convert = read('python/convert.py');

  expect(convert).toContain(`('bmp', 'jpg'): convert_raster`);
  expect(convert).toContain(`('bmp', 'png'): convert_raster`);
});

test('BMP browser download policies require correct image types', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  for (const [slug, mime] of [
    ['bmp-to-jpg', 'image/jpeg'],
    ['bmp-to-png', 'image/png'],
  ]) {
    const index = source.indexOf(`'${slug}'`);
    expect(index).toBeGreaterThan(-1);

    const block = source.slice(index, index + 220);
    expect(block).toContain(`mimeTypes: ['${mime}']`);
  }

  expect(source).toContain(`extension === '.jpg'`);
  expect(source).toContain(`extension === '.png'`);
});
