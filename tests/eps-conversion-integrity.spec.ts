import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('EPS to JPG uses server vector rendering', async () => {
  const source = read('app/all-tools/eps-to-jpg/page.tsx');

  expect(source).toContain(`from_format: 'eps'`);
  expect(source).toContain(`to_format: 'jpg'`);
  expect(source).toContain(`dpi: 300`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/jpeg'`);
  expect(source).not.toContain('convertImageFormat');
});

test('EPS to PNG uses server vector rendering', async () => {
  const source = read('app/all-tools/eps-to-png/page.tsx');

  expect(source).toContain(`from_format: 'eps'`);
  expect(source).toContain(`to_format: 'png'`);
  expect(source).toContain(`dpi: 300`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/png'`);
  expect(source).not.toContain('convertImageFormat');
});

test('EPS to SVG uses genuine server-side vector conversion', async () => {
  const source = read('app/all-tools/eps-to-svg/page.tsx');

  expect(source).toContain(`from_format: 'eps'`);
  expect(source).toContain(`to_format: 'svg'`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'image/svg+xml'`);

  expect(source).not.toContain('quality: 100');
  expect(source).not.toMatch(/100% quality/i);
  expect(source).not.toMatch(/full quality preservation/i);
  expect(source).not.toMatch(/infinitely scalable/i);
  expect(source).not.toMatch(/no quality compromise/i);
  expect(source).not.toMatch(/any vector design tool/i);
});

test('EPS backend registers JPG PNG and genuine SVG routes', async () => {
  const source = read('python/convert.py');

  expect(source).toContain(`('eps', 'jpg'): vector_render`);
  expect(source).toContain(`('eps', 'png'): vector_render`);
  expect(source).toContain(`('eps', 'svg'): vector_render`);
});

test('EPS SVG engine uses pstoedit vector output', async () => {
  const source = read('python/engines/vector_render.py');

  expect(source).toContain('def convert_eps_to_svg(');
  expect(source).toContain(`'pstoedit'`);
  expect(source).toContain(`'plot-svg'`);
  expect(source).toContain(`b'<svg'`);

  expect(source).toContain(
    `if to_format.lower() == 'svg':`,
  );
  expect(source).toContain(
    `return convert_eps_to_svg(input_file, output_file)`,
  );
});

test('EPS pages do not claim browser-only processing or unlimited files', async () => {
  for (const file of [
    'app/all-tools/eps-to-jpg/page.tsx',
    'app/all-tools/eps-to-png/page.tsx',
    'app/all-tools/eps-to-svg/page.tsx',
  ]) {
    const source = read(file);

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/instant conversion in your browser/i);
    expect(source).not.toMatch(/no file size limits/i);
    expect(source).not.toMatch(/privacy is completely protected/i);
  }
});

test('EPS download policies require correct output types', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  expect(source).toContain(`'eps-to-jpg': {`);
  expect(source).toContain(`mimeTypes: ['image/jpeg']`);

  expect(source).toContain(`'eps-to-png': {`);
  expect(source).toContain(`mimeTypes: ['image/png']`);

  expect(source).toContain(`'eps-to-svg': {`);
  expect(source).toContain(`mimeTypes: ['image/svg+xml']`);
});
