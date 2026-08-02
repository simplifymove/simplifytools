import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('VSDX and VSD PDF pages use genuine server PDF conversion', async () => {
  const vsdx = read('app/all-tools/vsdx-to-pdf/page.tsx');
  const vsd = read('app/all-tools/vsd-to-pdf/page.tsx');

  expect(vsdx).toContain(`from_format: 'vsdx'`);
  expect(vsdx).toContain(`to_format: 'pdf'`);
  expect(vsdx).toContain(`fetch('/api/convert'`);
  expect(vsdx).toContain(`blob.type !== 'application/pdf'`);

  expect(vsd).toContain(`from_format: 'vsd'`);
  expect(vsd).toContain(`to_format: 'pdf'`);
  expect(vsd).toContain(`fetch('/api/convert'`);
  expect(vsd).toContain(`blob.type !== 'application/pdf'`);
});

test('Visio PDF pages do not expose backend-ignored controls', async () => {
  const combined =
    read('app/all-tools/vsdx-to-pdf/page.tsx') +
    read('app/all-tools/vsd-to-pdf/page.tsx');

  expect(combined).not.toMatch(/PDF Quality/i);
  expect(combined).not.toMatch(/Preserve Formatting/i);
  expect(combined).not.toMatch(/Choose standard paper size/i);
  expect(combined).not.toMatch(/setPageSize/);
  expect(combined).not.toMatch(/setOrientation/);
});

test('unsupported Visio DOCX and PPTX public routes are retired', async () => {
  for (const dir of [
    'app/all-tools/vsdx-to-docx',
    'app/all-tools/vsdx-to-pptx',
    'app/all-tools/vsd-to-docx',
    'app/all-tools/vsd-to-pptx',
  ]) {
    expect(
      fs.existsSync(path.join(process.cwd(), dir)),
      `${dir} should not exist`,
    ).toBe(false);
  }
});

test('unsupported Visio conversions are absent from registries', async () => {
  const tools = read('app/data/tools.ts');
  const converters = read('app/lib/converters.ts');
  const backend = read('python/convert.py');

  for (const slug of [
    'vsdx-to-docx',
    'vsdx-to-pptx',
    'vsd-to-docx',
    'vsd-to-pptx',
  ]) {
    expect(tools).not.toContain(slug);
    expect(converters).not.toContain(slug);
  }

  expect(backend).not.toContain(`('vsdx', 'docx')`);
  expect(backend).not.toContain(`('vsdx', 'pptx')`);
  expect(backend).not.toContain(`('vsd', 'docx')`);
  expect(backend).not.toContain(`('vsd', 'pptx')`);
});

test('supported Visio conversions remain registered', async () => {
  const tools = read('app/data/tools.ts');
  const backend = read('python/convert.py');

  expect(tools).toContain('/all-tools/vsdx-to-pdf');
  expect(tools).toContain('/all-tools/vsd-to-pdf');
  expect(tools).toContain('/all-tools/vsdx-to-jpg');

  expect(backend).toContain(`('vsdx', 'pdf')`);
  expect(backend).toContain(`('vsdx', 'jpg')`);
  expect(backend).toContain(`('vsd', 'pdf')`);
});

test('Visio PDF download results require genuine PDF files', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  expect(source).toContain(`'vsdx-to-pdf': PDF_POLICY`);
  expect(source).toContain(`'vsd-to-pdf': PDF_POLICY`);
  expect(source).toContain(`extensions: ['.pdf']`);
  expect(source).toContain(`mimeTypes: ['application/pdf']`);
  expect(source).toContain(`extension === '.pdf'`);
  expect(source).toContain(`=== '%PDF-'`);
});
