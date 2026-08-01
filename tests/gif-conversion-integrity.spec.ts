import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const pages = [
  {
    file: 'app/all-tools/jpg-to-gif/page.tsx',
    slug: 'jpg-to-gif',
    from: 'jpg',
  },
  {
    file: 'app/all-tools/webp-to-gif/page.tsx',
    slug: 'webp-to-gif',
    from: 'webp',
  },
];

test('GIF pages request genuine GIF output', async () => {
  for (const item of pages) {
    const source = fs.readFileSync(
      path.join(process.cwd(), item.file),
      'utf8',
    );

    expect(source).toContain(`from_format: '${item.from}'`);
    expect(source).toContain(`to_format: 'gif'`);
    expect(source).toContain(`blob.type !== 'image/gif'`);
    expect(source).toContain(`originalName: 'converted.gif'`);
    expect(source).toContain(`outputName: 'converted.gif'`);

    expect(source).not.toContain(
      `convertImageFormat(file, 'image/webp'`,
    );
    expect(source).not.toMatch(/Frames Per Second/i);
    expect(source).not.toMatch(/adjustable frame rate/i);
  }
});

test('GIF backend routes use raster conversion', async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'python/convert.py'),
    'utf8',
  );

  expect(source).toContain(
    "('jpg', 'gif'): convert_raster",
  );
  expect(source).toContain(
    "('webp', 'gif'): convert_raster",
  );
});

test('GIF download policies require real GIF output', async () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'app/api/browser-download-result/route.ts',
    ),
    'utf8',
  );

  for (const slug of ['jpg-to-gif', 'webp-to-gif']) {
    expect(source).toContain(`'${slug}': {`);
  }

  expect(
    source.match(/mimeTypes: \['image\/gif'\]/g)?.length,
  ).toBeGreaterThanOrEqual(2);
});

test('GIF pages do not make old animation or browser-only claims', async () => {
  for (const item of pages) {
    const source = fs.readFileSync(
      path.join(process.cwd(), item.file),
      'utf8',
    );

    expect(source).not.toMatch(/never uploaded/i);
    expect(source).not.toMatch(/conversion in your browser/i);
    expect(source).not.toMatch(/smooth animations/i);
    expect(source).not.toMatch(/adjustable frame rate/i);
  }
});
