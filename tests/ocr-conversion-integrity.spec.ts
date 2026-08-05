import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('canonical PDF OCR uses the registered OCR engine', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/lib/pdf-tools.ts'),
    'utf8',
  );

  const start = source.indexOf(`'pdf-ocr': {`);
  expect(start).toBeGreaterThan(-1);

  const block = source.slice(start, start + 1100);

  expect(block).toContain(`id: 'pdf-ocr'`);
  expect(block).toContain(`engine: 'ocr_translate'`);
  expect(block).toContain(`accepts: ['.pdf']`);
  expect(block).toContain(`value: 'docx'`);
  expect(block).toContain(`value: 'pdf'`);
  expect(block).toContain(`value: 'txt'`);
});

test('image OCR browser download policy remains registered', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/api/browser-download-result/route.ts'),
    'utf8',
  );

  expect(source).toContain(`'image-to-text'`);
});

test('PDF OCR server library uses Node canvas', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/lib/tesseract-ocr.ts'),
    'utf8',
  );

  expect(source).toContain(`await import('canvas')`);
  expect(source).toContain(`createCanvas(`);
  expect(source).not.toContain(
    `typeof document !== 'undefined' ? document.createElement('canvas') : null`,
  );
});

test('image OCR copy describes server-side processing accurately', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/image-to-text/page.tsx'),
    'utf8',
  );

  expect(source).toContain('Server-assisted OCR processing');
  expect(source).not.toContain('Secure & instant processing');
});
