import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('PNG to EPS uses the vector backend and correct MIME', async () => {
  const page = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/png-to-eps/page.tsx'),
    'utf8',
  );

  expect(page).toContain(`from_format: 'png'`);
  expect(page).toContain(`to_format: 'eps'`);
  expect(page).toContain(`blob.type !== 'application/postscript'`);
  expect(page).not.toContain(`convertImageFormat(file, 'image/png')`);

  const routes = fs.readFileSync(
    path.join(process.cwd(), 'python/convert.py'),
    'utf8',
  );

  expect(routes).toContain(`('png', 'eps'): vector_trace`);
});

test('TIFF to SVG uses vector tracing and forwards trace controls', async () => {
  const page = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/tiff-to-svg/page.tsx'),
    'utf8',
  );

  expect(page).toContain(`from_format: 'tiff'`);
  expect(page).toContain(`to_format: 'svg'`);
  expect(page).toContain(`corner_threshold: cornerThreshold`);
  expect(page).toContain(`curve_optimize: curveOptimize`);
  expect(page).toContain(`blob.type !== 'image/svg+xml'`);
  expect(page).not.toContain(`convertImageFormat(file, 'image/webp'`);
});

test('vector download policies require EPS and SVG output', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  expect(source).toContain(`'png-to-eps': {`);
  expect(source).toContain(`extensions: ['.eps']`);
  expect(source).toContain(`mimeTypes: ['application/postscript']`);

  expect(source).toContain(`'tiff-to-svg': {`);
  expect(source).toContain(`extensions: ['.svg']`);
  expect(source).toContain(`mimeTypes: ['image/svg+xml']`);

  expect(source).toContain(`extension === '.eps'`);
  expect(source).toContain(`prefix.startsWith('%!PS-Adobe-')`);
  expect(source).toContain(`prefix.includes('EPSF-')`);
});

test('vector pages do not retain misleading browser-only claims', async () => {
  for (const file of [
    'app/all-tools/png-to-eps/page.tsx',
    'app/all-tools/tiff-to-svg/page.tsx',
  ]) {
    const source = fs.readFileSync(
      path.join(process.cwd(), file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/conversion in your browser/i);
    expect(source).not.toMatch(/no file size limits/i);
    expect(source).not.toMatch(/infinite scaling without quality loss/i);
  }
});
