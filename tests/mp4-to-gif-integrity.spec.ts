import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('MP4 to GIF frontend requests genuine GIF output', async () => {
  const source = read('app/all-tools/mp4-to-gif/page.tsx');

  expect(source).toContain(`from_format: 'mp4'`);
  expect(source).toContain(`to_format: 'gif'`);
  expect(source).toContain(`fps: 10`);
  expect(source).toContain(`scale: 480`);
  expect(source).toContain(`blob.type !== 'image/gif'`);

  expect(source).not.toContain(`quality: 85`);
});

test('MP4 to GIF backend uses animation engine', async () => {
  const source = read('python/convert.py');

  expect(source).toContain(
    `('mp4', 'gif'): animation_convert`,
  );
});

test('MP4 to GIF engine applies requested scale and FPS', async () => {
  const source = read('python/engines/animation.py');

  expect(source).toContain(
    `fps = max(1, min(30, int(fps)))`,
  );

  expect(source).toContain(
    `scale = max(64, min(1920, int(scale)))`,
  );

  expect(source).toContain(
    `f"scale='min({scale},iw)':-2:flags=lanczos"`,
  );

  expect(source).toContain(
    `palettegen=max_colors=256:stats_mode=diff`,
  );

  expect(source).toContain(
    `paletteuse=dither=bayer:bayer_scale=5`,
  );
});

test('MP4 to GIF engine validates GIF signature', async () => {
  const source = read('python/engines/animation.py');

  expect(source).toContain(`b'GIF87a'`);
  expect(source).toContain(`b'GIF89a'`);

  expect(source).toContain(
    `Generated output does not contain a valid GIF signature`,
  );
});

test('MP4 to GIF download policy requires GIF output', async () => {
  const source = read(
    'app/api/browser-download-result/route.ts',
  );

  const start = source.indexOf(`'mp4-to-gif': {`);

  expect(start).toBeGreaterThan(-1);

  const block = source.slice(start, start + 180);

  expect(block).toContain(`extensions: ['.gif']`);
  expect(block).toContain(`mimeTypes: ['image/gif']`);
});

test('MP4 to GIF page avoids unsupported quality claims', async () => {
  const source = read('app/all-tools/mp4-to-gif/page.tsx');

  expect(source).not.toContain(
    `10-second HD video typically creates a 10-50MB GIF`,
  );

  expect(source).not.toContain(
    `custom quality settings`,
  );

  expect(source).not.toContain(
    `quality: 85`,
  );
});
