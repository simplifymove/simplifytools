import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const FIXTURE = 'tests/fixtures/pdf/multi-page.pdf';

function submittedOptions(postData: Buffer | null): { pageOrder?: number[] } {
  const body = postData?.toString('utf8') || '';
  const match = body.match(/name="options"\r?\n\r?\n([^\r\n]+)/);
  if (!match) throw new Error('Rearrange request did not contain an options field');
  return JSON.parse(match[1]) as { pageOrder?: number[] };
}

test('reorders pages through the canonical parent state and downloads the result', async ({ page }) => {
  await page.goto('/all-tools/pdf/rearrange-pdf');
  await page.locator('input[type="file"]').setInputFiles(FIXTURE);

  await page.getByRole('img', { name: /^Page 1$/ }).waitFor({ state: 'visible' });
  await page.getByTitle('Move down').first().click();
  await expect(page.getByText(/^Page 2$/).locator('..').getByText(/^Position 1$/)).toBeVisible();

  const apiRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/pdf',
  );
  await page.getByRole('button', { name: /^Process PDF$/ }).click();

  const apiRequest = await apiRequestPromise;
  expect(submittedOptions(apiRequest.postDataBuffer()).pageOrder).toEqual([1, 0, 2]);

  await page.waitForURL(/\/download\/[^/?#]+$/, { timeout: 120_000 });
  const downloadLink = page.getByRole('link', { name: /^Download File$/ });
  await expect(downloadLink).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadLink.click(),
  ]);
  const outputPath = await download.path();
  if (!outputPath) throw new Error('Rearrange PDF download did not produce a readable file');

  const outputBytes = await download.createReadStream().then(async (stream) => {
    if (!stream) throw new Error('Rearrange PDF download stream was unavailable');
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  });
  const output = await PDFDocument.load(outputBytes);
  expect(output.getPageCount()).toBe(3);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

  const pdfjs = await import('pdfjs-dist');
  const parsed = await pdfjs.getDocument({ data: new Uint8Array(outputBytes) }).promise;
  const firstPageText = await parsed.getPage(1).then((pdfPage) => pdfPage.getTextContent())
    .then((content) => content.items.map((item) => 'str' in item ? item.str : '').join(' '));
  const secondPageText = await parsed.getPage(2).then((pdfPage) => pdfPage.getTextContent())
    .then((content) => content.items.map((item) => 'str' in item ? item.str : '').join(' '));
  expect(firstPageText).toContain('Page 2');
  expect(secondPageText).toContain('Page 1');
});
