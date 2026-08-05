import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('legacy PDF to Text URL redirects to canonical dynamic PDF route', async () => {
  const config = read('next.config.js');

  expect(config).toContain(
    `source: '/all-tools/pdf-to-text'`,
  );

  expect(config).toContain(
    `destination: '/all-tools/pdf/pdf-to-text'`,
  );

  expect(config).toContain(`statusCode: 301`);
});

test('canonical PDF to Text tool remains registered', async () => {
  const registry = read('app/lib/pdf-tools.ts');

  const start = registry.indexOf(`'pdf-to-text': {`);
  expect(start).toBeGreaterThan(-1);

  const block = registry.slice(start, start + 350);

  expect(block).toContain(`id: 'pdf-to-text'`);
  expect(block).toContain(`title: 'PDF to Text'`);
  expect(block).toContain(`engine: 'convert'`);
  expect(block).toContain(`output: '.txt'`);
});

test('dynamic PDF slug route resolves registered PDF tools', async () => {
  const page = read('app/all-tools/pdf/[slug]/page.tsx');

  expect(page).toContain(`getPdfToolById`);
});

test('PDF to Text and Extract Text from PDF remain separate tools', async () => {
  const registry = read('app/lib/pdf-tools.ts');

  expect(registry).toContain(`'pdf-to-text': {`);
  expect(registry).toContain(`'extract-text-from-pdf': {`);

  expect(registry).toContain(`engine: 'convert'`);
  expect(registry).toContain(`engine: 'extract'`);
});

test('legacy OCR to Text URL redirects to canonical PDF OCR tool', async () => {
  const config = read('next.config.js');

  expect(config).toContain(
    `source: '/all-tools/pdf/ocr-to-text'`,
  );

  expect(config).toContain(
    `destination: '/all-tools/pdf/pdf-ocr'`,
  );

  expect(config).toContain(`permanent: true`);
});

test('canonical PDF OCR tool remains registered', async () => {
  const registry = read('app/lib/pdf-tools.ts');

  const start = registry.indexOf(`'pdf-ocr': {`);
  expect(start).toBeGreaterThan(-1);

  const block = registry.slice(start, start + 1100);

  expect(block).toContain(`id: 'pdf-ocr'`);
  expect(block).toContain(`title: 'PDF OCR'`);
  expect(block).toContain(`engine: 'ocr_translate'`);
  expect(block).toContain(`accepts: ['.pdf']`);
  expect(block).toContain(`value: 'docx'`);
  expect(block).toContain(`value: 'pdf'`);
  expect(block).toContain(`value: 'txt'`);
});

test('obsolete standalone OCR to Text page is removed', async () => {
  expect(
    fs.existsSync(
      path.join(
        process.cwd(),
        'app/all-tools/pdf/ocr-to-text/page.tsx',
      ),
    ),
  ).toBe(false);
});

test('redirect-only PDF to Text alias is excluded from sitemap', async () => {
  const sitemap = read('app/sitemap.ts');

  expect(sitemap).toContain(
    `'/all-tools/pdf-to-text'`,
  );

  expect(sitemap).toContain(
    `REDIRECT_ONLY_TOOL_ROUTES`,
  );
});

test('obsolete standalone PDF to Text page is removed', async () => {
  expect(
    fs.existsSync(
      path.join(
        process.cwd(),
        'app/all-tools/pdf-to-text/page.tsx',
      ),
    ),
  ).toBe(false);
});
