import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

const pages = [
  {
    file: 'app/all-tools/jpg-to-avif/page.tsx',
    slug: 'jpg-to-avif',
    from: 'jpg',
  },
  {
    file: 'app/all-tools/png-to-avif/page.tsx',
    slug: 'png-to-avif',
    from: 'png',
  },
  {
    file: 'app/all-tools/webp-to-avif/page.tsx',
    slug: 'webp-to-avif',
    from: 'webp',
  },
  {
    file: 'app/all-tools/heic-to-avif/page.tsx',
    slug: 'heic-to-avif',
    from: 'heic',
  },
  {
    file: 'app/all-tools/tiff-to-avif/page.tsx',
    slug: 'tiff-to-avif',
    from: 'tiff',
  },
];

test('all AVIF pages request genuine AVIF output', async () => {
  for (const item of pages) {
    const source = read(item.file);

    expect(source).toContain(`from_format: '${item.from}'`);
    expect(source).toContain(`to_format: 'avif'`);
    expect(source).toContain(`fetch('/api/convert'`);
    expect(source).toContain(`blob.type !== 'image/avif'`);
  }
});

test('HEIC and TIFF AVIF pages use the actual /api/convert contract', async () => {
  for (const file of [
    'app/all-tools/heic-to-avif/page.tsx',
    'app/all-tools/tiff-to-avif/page.tsx',
  ]) {
    const source = read(file);

    expect(source).toContain(`formData.append('image', file)`);
    expect(source).toContain(`'config'`);

    expect(source).not.toContain(`formData.append('tool'`);
    expect(source).not.toContain(`formData.append('file'`);
    expect(source).not.toContain(`formData.append('options'`);
  }
});

test('HEIC and TIFF AVIF expose real quality without ignored speed control', async () => {
  for (const file of [
    'app/all-tools/heic-to-avif/page.tsx',
    'app/all-tools/tiff-to-avif/page.tsx',
  ]) {
    const source = read(file);

    expect(source).toContain('setQuality');
    expect(source).toContain('Higher quality = larger file size');

    expect(source).not.toContain('setSpeed');
    expect(source).not.toContain('speed:');
    expect(source).not.toMatch(/Compression Speed/i);
    expect(source).not.toMatch(/Slowest \(Best Quality\)/i);
    expect(source).not.toMatch(/Fastest/i);
  }
});

test('AVIF backend supports all five audited raster inputs', async () => {
  const source = read('python/convert.py');

  for (const input of ['jpg', 'png', 'webp', 'heic', 'tiff']) {
    expect(source).toContain(
      `('${input}', 'avif'): convert_raster`,
    );
  }
});

test('AVIF raster engine implements quality but not speed', async () => {
  const source = read('python/engines/raster.py');

  expect(source).toContain(
    `quality = options.get('quality', 85)`,
  );
  expect(source).toContain(
    `elif to_format.lower() == 'avif':`,
  );
  expect(source).toContain(
    `save_kwargs = {'quality': quality}`,
  );

  expect(source).not.toMatch(/options\.get\(['"]speed/);
});

test('all five AVIF download policies require genuine AVIF', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  for (const item of pages) {
    const start = source.indexOf(`'${item.slug}': {`);

    expect(start).toBeGreaterThan(-1);

    const block = source.slice(start, start + 180);

    expect(block).toContain(`extensions: ['.avif']`);
    expect(block).toContain(`mimeTypes: ['image/avif']`);
  }
});

test('AVIF pages do not claim browser-only processing', async () => {
  for (const item of pages) {
    const source = read(item.file);

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/never leave your device/i);
    expect(source).not.toMatch(/all conversions happen locally/i);
    expect(source).not.toMatch(/complete privacy guaranteed/i);
  }
});
