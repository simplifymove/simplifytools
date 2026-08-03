import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('JPG PNG and WebP to TIFF use genuine server conversion', async () => {
  for (const item of [
    {
      file: 'app/all-tools/jpg-to-tiff/page.tsx',
      from: 'jpg',
      slug: 'jpg-to-tiff',
    },
    {
      file: 'app/all-tools/png-to-tiff/page.tsx',
      from: 'png',
      slug: 'png-to-tiff',
    },
    {
      file: 'app/all-tools/webp-to-tiff/page.tsx',
      from: 'webp',
      slug: 'webp-to-tiff',
    },
  ]) {
    const source = read(item.file);

    expect(source).toContain(`from_format: '${item.from}'`);
    expect(source).toContain(`to_format: 'tiff'`);
    expect(source).toContain(`fetch('/api/convert'`);
    expect(source).toContain(`blob.type !== 'image/tiff'`);
    expect(source).toContain(item.slug);

    expect(source).not.toContain('quality: 100');
    expect(source).not.toMatch(/Tool Coming Soon/i);
  }
});

test('TIFF outputs use explicit lossless LZW compression', async () => {
  const source = read('python/engines/raster.py');

  expect(source).toContain(
    `elif to_format.lower() in ['tiff', 'tif']:`,
  );

  expect(source).toContain(
    `save_kwargs = {'compression': 'tiff_lzw'}`,
  );
});

test('TIFF output registry does not advertise fake quality controls', async () => {
  const source = read('app/lib/converters.ts');

  for (const id of [
    'jpg-to-tiff',
    'png-to-tiff',
    'webp-to-tiff',
  ]) {
    const start = source.indexOf(`id: '${id}'`);
    expect(start).toBeGreaterThan(-1);

    const block = source.slice(start, start + 300);

    expect(block).toContain(`defaultOptions: {}`);
    expect(block).toContain(`supportedOptions: []`);
  }
});

test('TIFF output download policies require genuine TIFF', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  for (const id of [
    'jpg-to-tiff',
    'png-to-tiff',
    'webp-to-tiff',
  ]) {
    const start = source.indexOf(`'${id}': {`);

    expect(start).toBeGreaterThan(-1);

    const block = source.slice(start, start + 180);

    expect(block).toContain(
      `extensions: ['.tiff', '.tif']`,
    );

    expect(block).toContain(
      `mimeTypes: ['image/tiff']`,
    );
  }
});

test('TIFF output pages avoid unsupported absolute quality claims', async () => {
  for (const file of [
    'app/all-tools/jpg-to-tiff/page.tsx',
    'app/all-tools/png-to-tiff/page.tsx',
    'app/all-tools/webp-to-tiff/page.tsx',
  ]) {
    const source = read(file);

    expect(source).not.toMatch(/maintains 100% quality/i);
    expect(source).not.toMatch(/retain all original details/i);
  }
});

test('WebP to TIFF is a real tool and not a placeholder', async () => {
  const source = read(
    'app/all-tools/webp-to-tiff/page.tsx',
  );

  expect(source).toContain(`from_format: 'webp'`);
  expect(source).toContain(`to_format: 'tiff'`);
  expect(source).toContain(`toolSlug: "webp-to-tiff"`);
  expect(source).toContain(`blob.type !== 'image/tiff'`);

  expect(source).not.toMatch(/Tool Coming Soon/i);
  expect(source).not.toMatch(/PNG Preview/i);
  expect(source).not.toMatch(/Upload a PNG/i);
});

test('TIFF to JPG uses server conversion and forwards real JPG quality', async () => {
  const source = read(
    'app/all-tools/tiff-to-jpg/page.tsx',
  );

  expect(source).toContain(`from_format: 'tiff'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`quality,`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);
});

test('TIFF to PNG uses server conversion without fake quality control', async () => {
  const source = read(
    'app/all-tools/tiff-to-png/page.tsx',
  );

  expect(source).toContain(`from_format: 'tiff'`);
  expect(source).toContain(`to_format: 'png'`);
  expect(source).toContain(`blob.type !== 'image/png'`);

  expect(source).not.toContain('Output Quality:');
  expect(source).not.toContain('setQuality');
});

test('TIFF input download policies require JPG and PNG output', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  expect(source).toContain(`'tiff-to-jpg': {`);
  expect(source).toContain(`'tiff-to-png': {`);
  expect(source).toContain(`mimeTypes: ['image/jpeg']`);
  expect(source).toContain(`mimeTypes: ['image/png']`);
});
