import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('TIFF to Text uses generic conversion API', async () => {
  const source = read('app/all-tools/tiff-to-text/page.tsx');

  expect(source).toContain(`formData.append('image', file)`);
  expect(source).toContain(`from_format: 'tiff'`);
  expect(source).toContain(`to_format: outputFormat`);
  expect(source).toContain(`language,`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).not.toContain(`fetch('/api/pdf'`);
});

test('TIFF OCR backend supports TXT and PDF output', async () => {
  const source = read('python/convert.py');

  expect(source).toContain(`('tiff', 'txt'): ocr_convert`);
  expect(source).toContain(`('tiff', 'pdf'): ocr_convert`);
});

test('TIFF OCR forwards selected language to Tesseract', async () => {
  const source = read('python/engines/ocr.py');

  expect(source).toContain(`lang = options.get('language', 'eng')`);
  expect(source).toContain(`'-l', lang`);
});

test('TIFF to Text validates TXT and PDF MIME output', async () => {
  const source = read('app/all-tools/tiff-to-text/page.tsx');

  expect(source).toContain(`blob.type === 'application/pdf'`);
  expect(source).toContain(`blob.type.startsWith('text/plain')`);
});

test('TIFF to Text exposes supported output formats only', async () => {
  const source = read('app/all-tools/tiff-to-text/page.tsx');

  expect(source).toContain(`<option value="txt">Plain Text</option>`);
  expect(source).toContain(`<option value="pdf">Searchable PDF</option>`);
});

test('TIFF to Text download policy allows TXT and PDF', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  const start = source.indexOf(`'tiff-to-text': {`);
  expect(start).toBeGreaterThan(-1);

  const block = source.slice(start, start + 320);

  expect(block).toContain(`'.txt'`);
  expect(block).toContain(`'.pdf'`);
  expect(block).toContain(`'text/plain'`);
  expect(block).toContain(`'application/pdf'`);
});

test('TIFF to Text accepts TIFF input', async () => {
  const source = read('app/all-tools/tiff-to-text/page.tsx');

  expect(source).toContain(`accept=".tiff,.tif"`);
});
