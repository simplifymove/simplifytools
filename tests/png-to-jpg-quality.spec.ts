import { expect, test } from '@playwright/test';
import {
  normalizePngToJpgQuality,
  PNG_TO_JPG_DEFAULT_QUALITY,
} from '../app/lib/png-to-jpg-quality';

declare global {
  interface Window {
    __pngToJpgEncodes?: Array<{
      quality: number | undefined;
      type: string | undefined;
      blobType: string;
      size: number;
      signature: string;
    }>;
  }
}

test('PNG-to-JPG quality normalization clamps invalid values and preserves the default', () => {
  expect(normalizePngToJpgQuality()).toBe(PNG_TO_JPG_DEFAULT_QUALITY);
  expect(normalizePngToJpgQuality(Number.NaN)).toBe(PNG_TO_JPG_DEFAULT_QUALITY);
  expect(normalizePngToJpgQuality(1)).toBe(10);
  expect(normalizePngToJpgQuality(110)).toBe(100);
  expect(normalizePngToJpgQuality(75)).toBe(75);
});

test('PNG-to-JPG passes materially different quality values to a valid JPEG encoder', async ({ page }) => {
  await page.addInitScript(() => {
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    window.__pngToJpgEncodes = [];

    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      return originalToBlob.call(
        this,
        (blob) => {
          if (!blob) {
            callback(blob);
            return;
          }

          void blob.slice(0, 3).arrayBuffer().then((prefix) => {
            window.__pngToJpgEncodes?.push({
              quality,
              type,
              blobType: blob.type,
              size: blob.size,
              signature: Array.from(new Uint8Array(prefix))
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join(''),
            });
          });
          callback(blob);
        },
        type,
        quality,
      );
    };
  });

  await page.goto('/all-tools/png-to-jpg');

  const pngBase64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');

    const pixels = context.createImageData(canvas.width, canvas.height);
    let seed = 123456789;
    for (let index = 0; index < pixels.data.length; index += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      pixels.data[index] = seed & 255;
      pixels.data[index + 1] = (seed >>> 8) & 255;
      pixels.data[index + 2] = (seed >>> 16) & 255;
      pixels.data[index + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  });

  await page.locator('input[type="file"]').setInputFiles({
    name: 'quality-test.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBase64, 'base64'),
  });

  const slider = page.getByRole('slider', { name: 'JPEG quality' });
  const convert = page.getByRole('button', { name: /Convert to JPG/i });

  await slider.fill('20');
  await convert.click();
  await expect(page.getByText('Conversion Complete!')).toBeVisible();

  await slider.fill('95');
  await convert.click();

  await expect.poll(async () => page.evaluate(() => window.__pngToJpgEncodes?.length)).toBe(2);
  const encodes = await page.evaluate(() => window.__pngToJpgEncodes ?? []);

  expect(encodes.map((encode) => encode.quality)).toEqual([0.2, 0.95]);
  for (const encode of encodes) {
    expect(encode.type).toBe('image/jpeg');
    expect(encode.blobType).toBe('image/jpeg');
    expect(encode.signature).toBe('ffd8ff');
  }
  expect(encodes[1].size).toBeGreaterThan(encodes[0].size * 1.5);
});
