import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('JPG to PNG does not claim conversion creates transparency', async () => {
  const source = read('app/all-tools/jpg-to-png/page.tsx');

  expect(source).toContain(
    'converting an opaque JPG does not create transparency',
  );
  expect(source).toContain(
    'detail already lost in the original JPG cannot be restored',
  );

  expect(source).not.toMatch(/add transparency to images/i);
  expect(source).not.toMatch(/transparent PNG for web design/i);
});

test('PNG to JPG describes transparency flattening without fake background control', async () => {
  const source = read('app/all-tools/png-to-jpg/page.tsx');

  expect(source).toContain(
    'transparency is not preserved',
  );

  expect(source).not.toMatch(/upload a background color/i);
  expect(source).not.toMatch(/fills transparent areas with white by default/i);
});

test('browser conversion copy distinguishes local conversion from download preparation', async () => {
  for (const file of [
    'app/all-tools/jpg-to-png/page.tsx',
    'app/all-tools/png-to-jpg/page.tsx',
    'app/all-tools/webp-to-jpg/page.tsx',
  ]) {
    const source = read(file);

    expect(source).toContain(
      'converted result may be sent to SimplifyConvert when you choose the download flow',
    );

    expect(source).not.toMatch(/automatically deleted after download/i);
    expect(source).not.toMatch(/privacy guaranteed/i);
  }
});

test('WebP to PNG does not imply lost source quality is restored', async () => {
  const source = read('app/all-tools/webp-to-png/page.tsx');

  expect(source).toContain('lossless PNG encoding');
  expect(source).not.toMatch(/lossless quality/i);
});

test('Edit to PNG does not claim perfect quality', async () => {
  const source = read('app/all-tools/edit-to-png/page.tsx');

  expect(source).toContain('Lossless PNG output encoding');
  expect(source).not.toMatch(/Perfect quality/i);
});

test('browser raster registry exposes only controls present on these pages', async () => {
  const source = read('app/lib/converters.ts');

  const expected: Array<[string, string]> = [
    ['jpg-to-png', `supportedOptions: []`],
    ['jpg-to-webp', `supportedOptions: ['quality']`],
    ['png-to-jpg', `supportedOptions: ['quality']`],
    ['png-to-webp', `supportedOptions: ['quality']`],
    ['webp-to-jpg', `supportedOptions: ['quality']`],
    ['webp-to-png', `supportedOptions: []`],
  ];

  for (const [slug, expectedOptions] of expected) {
    const start = source.indexOf(`id: '${slug}'`);
    expect(start).toBeGreaterThan(-1);

    const next = source.indexOf('\n  {', start + 10);
    const block = source.slice(
      start,
      next === -1 ? source.length : next,
    );

    expect(block).toContain(expectedOptions);
  }
});
