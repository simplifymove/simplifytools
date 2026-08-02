import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('PSD to JPG uses server conversion, JPEG MIME and real quality control', async () => {
  const page = read('app/all-tools/psd-to-jpg/page.tsx');
  const engine = read('python/engines/document.py');

  expect(page).toContain(`from_format: 'psd'`);
  expect(page).toContain(`to_format: 'jpg'`);
  expect(page).toContain(`quality: quality`);
  expect(page).toContain(`fetch('/api/convert'`);
  expect(page).toContain(`blob.type !== 'image/jpeg'`);

  expect(engine).toContain(
    `pillow_format = "JPEG" if output_format.lower() in ("jpg", "jpeg")`,
  );
  expect(engine).toContain(`quality = int(options.get("quality", 85))`);
});

test('PSD to PNG matches its dedicated API contract and 200 MB limit', async () => {
  const page = read('app/all-tools/psd-to-png/page.tsx');
  const api = read('app/api/convert/psd-to-png/route.ts');

  expect(page).toContain(`fetch('/api/convert/psd-to-png'`);
  expect(page).toContain(`blob.type !== 'image/png'`);
  expect(page).toContain('up to 200 MB');
  expect(page).not.toContain('up to 100 MB');

  expect(api).toContain(`200 * 1024 * 1024`);
});

test('PSD to PNG does not make absolute privacy or color guarantees', async () => {
  const page = read('app/all-tools/psd-to-png/page.tsx');

  expect(page).toContain('Server-assisted conversion');
  expect(page).toContain(
    'uploaded to the conversion server and processed only as needed',
  );

  expect(page).not.toMatch(/privacy is guaranteed/i);
  expect(page).not.toMatch(/never stored on our servers/i);
  expect(page).not.toMatch(/color accuracy perfectly/i);
});

test('PSD to SVG accurately describes embedded raster output', async () => {
  const page = read('app/all-tools/psd-to-svg/page.tsx');
  const engine = read('python/engines/document.py');

  expect(page).toContain(`from_format: 'psd'`);
  expect(page).toContain(`to_format: 'svg'`);
  expect(page).toContain(`options: {}`);
  expect(page).toContain(`blob.type !== 'image/svg+xml'`);

  expect(page).toContain('SVG container');
  expect(page).toContain('embedded raster image');
  expect(page).toContain(
    'does not trace PSD artwork into editable vector paths',
  );

  expect(page).not.toMatch(/PSD to SVG Vectorizer/i);
  expect(page).not.toMatch(/Raster Quality/i);
  expect(page).not.toContain('setColorReduce');
  expect(page).not.toContain('setCornerThreshold');
  expect(page).not.toContain('setCurveOptimize');
  expect(page).not.toMatch(/Potrace algorithm/i);

  expect(engine).toContain(
    `<image width="{width}" height="{height}" href="data:image/png;base64,{encoded}"/>`,
  );
});

test('PSD browser-download policies require genuine output types', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  expect(source).toContain(`'psd-to-jpg': {`);
  expect(source).toContain(`'psd-to-png': {`);
  expect(source).toContain(`'psd-to-svg': {`);

  expect(source).toContain(`mimeTypes: ['image/jpeg']`);
  expect(source).toContain(`mimeTypes: ['image/png']`);
  expect(source).toContain(`mimeTypes: ['image/svg+xml']`);

  // Existing generic signature checks protect each of these outputs.
  expect(source).toContain(`extension === '.jpg'`);
  expect(source).toContain(`extension === '.png'`);
  expect(source).toContain(`extension === '.svg'`);
});
