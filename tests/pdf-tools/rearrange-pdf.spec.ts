import { expect, test } from '@playwright/test';
import fs from 'fs/promises';
import { decodePDFRawStream, PDFArray, PDFDocument, PDFRawStream, PDFStream } from 'pdf-lib';

const FIXTURE = 'tests/fixtures/pdf/multi-page.pdf';

function parseMultipartFields(postData: Buffer, contentType: string): Record<string, string> {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];
  if (!boundary) throw new Error(`Multipart request has no boundary: ${contentType}`);

  const fields: Record<string, string> = {};
  const marker = `--${boundary}`;
  for (const rawPart of postData.toString('latin1').split(marker).slice(1)) {
    if (rawPart.startsWith('--')) break;
    const part = rawPart.replace(/^\r?\n/, '');
    const separator = part.includes('\r\n\r\n') ? '\r\n\r\n' : '\n\n';
    const separatorIndex = part.indexOf(separator);
    if (separatorIndex < 0) continue;

    const rawHeaders = part.slice(0, separatorIndex);
    const disposition = rawHeaders.split(/\r?\n/)
      .find((header) => header.toLowerCase().startsWith('content-disposition:'));
    if (!disposition) continue;
    const nameMatch = disposition.match(/(?:^|;)\s*name\s*=\s*(?:"([^"]*)"|([^;\s]*))/i);
    const name = nameMatch?.[1] ?? nameMatch?.[2];
    if (!name) continue;

    fields[name] = part.slice(separatorIndex + separator.length).replace(/\r?\n$/, '');
  }
  return fields;
}

function submittedOptions(fields: Record<string, string>): { pageOrder?: number[] } {
  if (!fields.options) throw new Error('Rearrange request did not contain an options field');
  return JSON.parse(fields.options) as { pageOrder?: number[] };
}

function decodedPageContent(document: PDFDocument, pageIndex: number): Buffer {
  const contents = document.getPage(pageIndex).node.Contents();
  if (!contents) throw new Error(`PDF page ${pageIndex + 1} has no content stream`);
  const objects = contents instanceof PDFArray ? contents.asArray() : [contents];
  return Buffer.concat(objects.map((object) => {
    const stream = document.context.lookup(object);
    if (stream instanceof PDFRawStream) return Buffer.from(decodePDFRawStream(stream).decode());
    if (stream instanceof PDFStream) return Buffer.from(stream.getContents());
    throw new Error(`PDF page ${pageIndex + 1} contains an unsupported content object`);
  }));
}

test('reorders pages through the canonical parent state and downloads the result', async ({ page }) => {
  await page.addInitScript(() => {
    const auditWindow = window as typeof window & { __rearrangeFormFields?: Record<string, string> };
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      if (new URL(requestUrl, window.location.href).pathname === '/api/pdf' && init?.body instanceof FormData) {
        auditWindow.__rearrangeFormFields = Object.fromEntries(
          Array.from(init.body.entries()).flatMap(([name, value]) =>
            typeof value === 'string' ? [[name, value]] : [],
          ),
        );
      }
      return originalFetch(input, init);
    };
  });
  await page.goto('/all-tools/pdf/rearrange-pdf');
  await page.locator('input[type="file"]').setInputFiles(FIXTURE);

  await page.getByRole('img', { name: /^Page 1$/ }).waitFor({ state: 'visible' });
  await page.getByTitle('Move down').first().click();
  await expect(page.getByText(/^Page 2$/).locator('..').getByText(/^Position 1$/)).toBeVisible();

  const apiRequestPromise = page.waitForRequest((request) =>
    request.method() === 'POST' && new URL(request.url()).pathname === '/api/pdf',
  );
  const apiResponsePromise = page.waitForResponse((response) =>
    response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/pdf',
  );
  await page.getByRole('button', { name: /^Process PDF$/ }).click();

  const [apiRequest, apiResponse] = await Promise.all([apiRequestPromise, apiResponsePromise]);
  expect(apiResponse.status()).toBe(200);
  const postData = apiRequest.postDataBuffer();
  const contentType = apiRequest.headers()['content-type'] || '';
  const fields = postData
    ? parseMultipartFields(postData, contentType)
    : await page.evaluate(() =>
      (window as typeof window & { __rearrangeFormFields?: Record<string, string> }).__rearrangeFormFields || {},
    );
  expect(submittedOptions(fields)).toEqual({ pageOrder: [1, 0, 2] });

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

  const source = await PDFDocument.load(await fs.readFile(FIXTURE));
  expect(decodedPageContent(output, 0)).toEqual(decodedPageContent(source, 1));
  expect(decodedPageContent(output, 1)).toEqual(decodedPageContent(source, 0));
});
