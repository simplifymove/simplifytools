import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('GIF to JPG uses browser Canvas JPEG conversion with real quality', async () => {
  const source = read('app/all-tools/gif-to-jpg/page.tsx');

  expect(source).toContain(
    `convertImageFormat(file, 'image/jpeg', {`,
  );
  expect(source).toContain(`quality: quality`);
  expect(source).toContain(`toolSlug: 'gif-to-jpg'`);
  expect(source).toContain(`accept=".gif"`);

  expect(source).toMatch(/first frame/i);
});

test('GIF to PNG uses browser Canvas PNG conversion without fake quality', async () => {
  const source = read('app/all-tools/gif-to-png/page.tsx');

  expect(source).toContain(
    `convertImageFormat(file, 'image/png')`,
  );

  expect(source).not.toContain(
    `convertImageFormat(file, 'image/png', {`,
  );

  expect(source).toContain(`toolSlug: 'gif-to-png'`);
  expect(source).toContain(`accept=".gif"`);

  expect(source).not.toContain('setQuality');
});

test('shared browser converter renders one decoded frame to Canvas', async () => {
  const source = read('app/lib/imageTools.ts');

  expect(source).toContain(`const reader = new FileReader()`);
  expect(source).toContain(
    `const canvas = document.createElement('canvas')`,
  );
  expect(source).toContain(`ctx?.drawImage(img, 0, 0)`);
  expect(source).toContain(`canvas.toBlob(`);
});

test('GIF static-output pages accurately describe animated input handling', async () => {
  const jpg = read('app/all-tools/gif-to-jpg/page.tsx');
  const png = read('app/all-tools/gif-to-png/page.tsx');

  expect(jpg).toMatch(/first frame/i);
  expect(png).toMatch(/first frame/i);

  expect(jpg).not.toMatch(/preserves? all frames/i);
  expect(png).not.toMatch(/preserves? all frames/i);

  expect(png).toContain(
    'PNG is a static image format and does not support animation.',
  );
});

test('GIF to PNG avoids absolute transparency guarantee', async () => {
  const source = read('app/all-tools/gif-to-png/page.tsx');

  expect(source).not.toContain(
    'PNG preserves GIF transparency perfectly',
  );

  expect(source).toContain(
    'When the browser decodes transparency from the selected GIF frame',
  );
});

test('GIF static-output download policies require correct MIME types', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  const cases = [
    ['gif-to-jpg', 'image/jpeg'],
    ['gif-to-png', 'image/png'],
  ];

  for (const [slug, mime] of cases) {
    const index = source.indexOf(`'${slug}': {`);

    expect(index).toBeGreaterThan(-1);

    const block = source.slice(index, index + 180);

    expect(block).toContain(mime);
  }
});

test('GIF JPG and PNG conversion itself stays browser-side', async () => {
  for (const file of [
    'app/all-tools/gif-to-jpg/page.tsx',
    'app/all-tools/gif-to-png/page.tsx',
  ]) {
    const source = read(file);

    expect(source).toContain('convertImageFormat(');
    expect(source).not.toContain(`fetch('/api/convert'`);
  }
});
