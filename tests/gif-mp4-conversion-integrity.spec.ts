import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('GIF to MP4 uses server conversion and MP4 MIME validation', async () => {
  const source = read('app/all-tools/gif-to-mp4/page.tsx');

  expect(source).toContain(`from_format: 'gif'`);
  expect(source).toContain(`to_format: 'mp4'`);
  expect(source).toContain(`options: { fps }`);
  expect(source).toContain(`fetch('/api/convert'`);
  expect(source).toContain(`blob.type !== 'video/mp4'`);
});

test('GIF to MP4 exposes FPS but no fake quality control', async () => {
  const page = read('app/all-tools/gif-to-mp4/page.tsx');
  const engine = read('python/engines/animation.py');

  expect(page).toContain('Frames Per Second');
  expect(page).not.toMatch(/MP4 Quality/i);
  expect(page).not.toContain('setQuality');
  expect(page).not.toContain('quality,');

  expect(engine).toContain(`'-r', str(fps)`);
  expect(engine).not.toContain(`options.get('quality'`);
  expect(engine).not.toContain(`--quality`);
});

test('GIF to MP4 copy describes server processing accurately', async () => {
  const source = read('app/all-tools/gif-to-mp4/page.tsx');

  expect(source).toContain('Server-assisted GIF to MP4 conversion');
  expect(source).not.toMatch(/instant conversion in your browser/i);
  expect(source).not.toMatch(/files never uploaded/i);
});

test('GIF to MP4 browser download requires real MP4 output', async () => {
  const source = read('app/api/browser-download-result/route.ts');

  expect(source).toContain(`const MP4_POLICY`);
  expect(source).toContain(`extensions: ['.mp4']`);
  expect(source).toContain(`mimeTypes: ['video/mp4']`);
  expect(source).toContain(`'gif-to-mp4': MP4_POLICY`);
  expect(source).toContain(`extension === '.mp4'`);
  expect(source).toContain(`=== 'ftyp'`);
});
