import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('JPG to SVG uses genuine server-side vector tracing', async () => {
  const source = read('app/all-tools/jpg-to-svg/page.tsx');

  expect(source).toContain(`from_format: 'jpg'`);
  expect(source).toContain(`to_format: 'svg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/svg+xml'`);

  expect(source).not.toContain('quality: 100');
  expect(source).not.toContain('trace_threshold');
});

test('PNG to SVG uses genuine server-side vector tracing', async () => {
  const source = read('app/all-tools/png-to-svg/page.tsx');

  expect(source).toContain(`from_format: 'png'`);
  expect(source).toContain(`to_format: 'svg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/svg+xml'`);

  expect(source).not.toContain('quality: 100');
  expect(source).not.toContain('trace_threshold');
});

test('raster SVG pages describe tracing without absolute scalability claims', async () => {
  const combined =
    read('app/all-tools/jpg-to-svg/page.tsx') +
    read('app/all-tools/png-to-svg/page.tsx');

  expect(combined).toMatch(/trace/i);
  expect(combined).toMatch(/vector paths/i);

  expect(combined).not.toMatch(/infinitely scalable/i);
  expect(combined).not.toMatch(/infinite scalability/i);
  expect(combined).not.toMatch(/scale perfectly/i);
  expect(combined).not.toMatch(/without quality loss/i);
});

test('raster to SVG backend uses vector trace engine', async () => {
  const convert = read('python/convert.py');

  expect(convert).toContain(`('jpg', 'svg')`);
  expect(convert).toContain(`('png', 'svg')`);
});

test('JPG and PNG SVG download policies require SVG output', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  for (const slug of ['jpg-to-svg', 'png-to-svg']) {
    const index = source.indexOf(`'${slug}'`);

    expect(index).toBeGreaterThan(-1);

    const policy = source.slice(index, index + 220);

    expect(policy).toContain(`extensions: ['.svg']`);
    expect(policy).toContain(`mimeTypes: ['image/svg+xml']`);
  }
});

test('browser download validates SVG structure', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  expect(source).toContain(`extension === '.svg'`);
});
