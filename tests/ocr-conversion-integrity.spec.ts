import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('PDF OCR page uses the dedicated OCR endpoint and TXT output', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/all-tools/pdf/ocr-to-text/page.tsx'),
    'utf8',
  );

  expect(source).toContain(`fetch('/api/pdf/ocr'`);
  expect(source).toContain(`result.data?.fullText`);
  expect(source).toContain(`aria-label="Extracted PDF text"`);
  expect(source).toContain(`toolSlug: 'ocr-to-text'`);
  expect(source).not.toContain(`fetch('/api/pdf'`);
  expect(source).not.toContain(`result.output`);
});

test('OCR download policies include both image and PDF OCR tools', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/api/browser-download-result/route.ts'),
    'utf8',
  );

  expect(source).toContain(`'image-to-text'`);
  expect(source).toContain(`'ocr-to-text'`);
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
