import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

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
];

test('AVIF pages request real AVIF output', async () => {
  for (const item of pages) {
    const source = fs.readFileSync(
      path.join(process.cwd(), item.file),
      'utf8',
    );

    expect(source).toContain(`from_format: '${item.from}'`);
    expect(source).toContain(`to_format: 'avif'`);
    expect(source).toContain(`blob.type !== 'image/avif'`);
    expect(source).toContain(`originalName: 'converted.avif'`);
    expect(source).toContain(`outputName: 'converted.avif'`);

    expect(source).not.toContain(
      `convertImageFormat(file, 'image/webp')`,
    );
    expect(source).not.toContain(`converted.webp`);
  }
});

test('AVIF download-result policies require real AVIF', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  for (const slug of [
    'jpg-to-avif',
    'png-to-avif',
    'webp-to-avif',
  ]) {
    expect(source).toContain(`'${slug}': {`);
  }

  expect(
    source.match(/mimeTypes: \['image\/avif'\]/g)?.length,
  ).toBeGreaterThanOrEqual(3);
});

test('AVIF pages do not claim browser-only processing', async () => {
  for (const item of pages) {
    const source = fs.readFileSync(
      path.join(process.cwd(), item.file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/never leave your device/i);
    expect(source).not.toMatch(/all conversions happen locally/i);
    expect(source).not.toMatch(/complete privacy guaranteed/i);
  }
});
