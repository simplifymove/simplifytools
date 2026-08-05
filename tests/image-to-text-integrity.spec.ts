import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('Image to Text uses the generic OCR conversion API', async () => {
  const source = read('app/all-tools/image-to-text/page.tsx');

  expect(source).toContain(`formData.append('image', file)`);
  expect(source).toContain(`from_format: inputFormat`);
  expect(source).toContain(`to_format: outputFormat`);
  expect(source).toContain(`options: { language }`);
  expect(source).toContain(`fetch('/api/convert'`);
});

test('Image to Text supports genuine OCR input formats', async () => {
  const source = read('python/convert.py');

  for (const format of ['jpg', 'png', 'webp', 'tiff']) {
    expect(source).toContain(`('${format}', 'txt'): ocr_convert`);
    expect(source).toContain(`('${format}', 'pdf'): ocr_convert`);
  }
});

test('Image to Text download policy supports TXT and PDF', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  const start = source.indexOf(`'image-to-text': {`);
  expect(start).toBeGreaterThan(-1);

  const block = source.slice(start, start + 320);

  expect(block).toContain(`'.txt'`);
  expect(block).toContain(`'.pdf'`);
  expect(block).toContain(`'text/plain'`);
  expect(block).toContain(`'application/pdf'`);
});

test('Image to Text UI exposes only installed OCR languages', async () => {
  const source = read('app/all-tools/image-to-text/page.tsx');

  for (const lang of [
    'eng',
    'spa',
    'fra',
    'deu',
    'chi_sim',
    'jpn',
    'ita',
    'por',
    'rus',
  ]) {
    expect(source).toContain(`value="${lang}"`);
  }
});

test('Image to Text supports TXT and searchable PDF output', async () => {
  const source = read('app/all-tools/image-to-text/page.tsx');

  expect(source).toContain(
    `<option value="txt">Plain Text (.txt)</option>`,
  );

  expect(source).toContain(
    `<option value="pdf">PDF (.pdf)</option>`,
  );
});
