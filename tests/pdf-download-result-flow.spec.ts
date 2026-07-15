import { expect, test, type APIRequestContext } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../lib/prisma';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const FIXTURE_DIRECTORY = path.join(process.cwd(), 'tests', 'fixtures');
const RUN_PROCESSOR_TESTS = process.env.PDF_RESULT_FLOW_TEST === 'true';

interface ResultMetadata {
  success: true;
  resultId: string;
  downloadPageUrl: string;
  outputName: string;
  mimeType: string;
  fileSize: string;
  expiresAt: string;
  outputPath?: string;
  id?: string;
}

async function fixture(name: string): Promise<Buffer> {
  const category = name.endsWith('.pdf') ? 'pdf' : 'images';
  return fs.readFile(path.join(FIXTURE_DIRECTORY, category, name));
}

async function cleanResult(resultId: string): Promise<void> {
  const record = await prisma.toolDownloadResult.findUnique({ where: { id: resultId } });
  if (!record) return;
  await fs.unlink(record.outputPath).catch(() => undefined);
  await prisma.toolDownloadResult.delete({ where: { id: resultId } }).catch(() => undefined);
}

async function processPdf(
  request: APIRequestContext,
  tool: string,
  files: Array<{ name: string; mimeType: string; buffer: Buffer }>,
  options: Record<string, unknown> = {},
): Promise<ResultMetadata> {
  const multipart = new FormData();
  multipart.append('tool', tool);
  multipart.append('options', JSON.stringify(options));
  for (const file of files) {
    multipart.append('file', new File([new Uint8Array(file.buffer)], file.name, { type: file.mimeType }));
  }
  const response = await request.post(`${BASE_URL}/api/pdf`, { multipart });
  expect(response.ok(), await response.text()).toBe(true);
  const result = await response.json() as ResultMetadata;
  expect(result.success).toBe(true);
  expect(result.downloadPageUrl).toBe(`/download/${result.resultId}`);
  expect(result.outputPath).toBeUndefined();
  expect(result.id).toBeUndefined();
  expect(Number(result.fileSize)).toBeGreaterThan(0);
  return result;
}

async function verifyManualDownload(
  request: APIRequestContext,
  result: ResultMetadata,
  expectedMimeType: string,
): Promise<void> {
  const resultPage = await request.get(`${BASE_URL}${result.downloadPageUrl}`);
  expect(resultPage.ok()).toBe(true);
  expect(await resultPage.text()).toContain('Download File');
  const download = await request.get(`${BASE_URL}/api/download-result/${result.resultId}`);
  expect(download.ok()).toBe(true);
  expect(download.headers()['content-type']).toContain(expectedMimeType);
  expect((await download.body()).length).toBeGreaterThan(0);
}

test.describe('PDF dedicated download-result flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('frontends do not retain synthetic automatic downloads', async () => {
    const sources = await Promise.all([
      fs.readFile(path.join(process.cwd(), 'app/all-tools/pdf/[slug]/page.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'app/all-tools/pdf/esign-pdf/page.tsx'), 'utf8'),
      fs.readFile(path.join(process.cwd(), 'app/lib/pdf-editor/pdfExport.ts'), 'utf8'),
    ]);
    for (const source of sources) {
      expect(source).not.toContain('URL.createObjectURL');
      expect(source).not.toMatch(/\.download\s*=/);
    }
  });

  test('representative server, ZIP, image, DOCX, interactive, and protected outputs', async ({ request }) => {
    test.skip(!RUN_PROCESSOR_TESTS, 'Set PDF_RESULT_FLOW_TEST=true to run processor-backed result tests');
    const validPdf = { name: 'sample.pdf', mimeType: 'application/pdf', buffer: await fixture('valid.pdf') };
    const multipagePdf = { name: 'multipage.pdf', mimeType: 'application/pdf', buffer: await fixture('multipage.pdf') };
    const cases = [
      { tool: 'rotate-pdf', files: [validPdf], options: { angle: 90 }, mime: 'application/pdf', suffix: '_rotated.pdf' },
      { tool: 'merge-pdf', files: [validPdf, multipagePdf], options: {}, mime: 'application/pdf', suffix: '_merged.pdf' },
      { tool: 'split-pdf', files: [multipagePdf], options: { mode: 'all' }, mime: 'application/zip', suffix: '_split.zip' },
      { tool: 'pdf-to-jpg', files: [validPdf], options: {}, mime: 'image/jpeg', suffix: '_images.jpg' },
      { tool: 'pdf-to-word', files: [validPdf], options: {}, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', suffix: '_converted.docx' },
      { tool: 'annotate-pdf', files: [validPdf], options: { annotations: [] }, mime: 'application/pdf', suffix: '_annotated.pdf' },
      { tool: 'protect-pdf', files: [validPdf], options: { userPassword: 'test123' }, mime: 'application/pdf', suffix: '_protected.pdf' },
    ];

    for (const item of cases) {
      const result = await processPdf(request, item.tool, item.files, item.options);
      try {
        expect(result.mimeType).toBe(item.mime);
        expect(result.outputName.endsWith(item.suffix)).toBe(true);
        await verifyManualDownload(request, result, item.mime);
      } finally {
        await cleanResult(result.resultId);
      }
    }
  });

  test('browser-generated PDF upload returns safe metadata', async ({ request }) => {
    test.skip(!RUN_PROCESSOR_TESTS, 'Set PDF_RESULT_FLOW_TEST=true to run database-backed result tests');
    const response = await request.post(`${BASE_URL}/api/pdf/browser-result`, {
      headers: { Origin: BASE_URL, 'Sec-Fetch-Site': 'same-origin' },
      multipart: {
        toolSlug: 'edit-pdf',
        originalName: 'source.pdf',
        outputName: '../source-edited.pdf',
        file: { name: 'source-edited.pdf', mimeType: 'application/pdf', buffer: await fixture('valid.pdf') },
      },
    });
    expect(response.ok(), await response.text()).toBe(true);
    const result = await response.json() as ResultMetadata;
    try {
      expect(result.outputPath).toBeUndefined();
      expect(result.id).toBeUndefined();
      expect(result.outputName).toBe('source-edited.pdf');
      expect(result.mimeType).toBe('application/pdf');
      await verifyManualDownload(request, result, 'application/pdf');
    } finally {
      await cleanResult(result.resultId);
    }
  });

  test('expired result download returns 410', async ({ request }) => {
    test.skip(!RUN_PROCESSOR_TESTS, 'Set PDF_RESULT_FLOW_TEST=true to run database-backed result tests');
    const ready = await request.post(`${BASE_URL}/api/pdf/browser-result`, {
      headers: { Origin: BASE_URL, 'Sec-Fetch-Site': 'same-origin' },
      multipart: {
        toolSlug: 'edit-pdf',
        originalName: 'expired.pdf',
        outputName: 'expired-edited.pdf',
        file: { name: 'expired-edited.pdf', mimeType: 'application/pdf', buffer: await fixture('valid.pdf') },
      },
    });
    const result = await ready.json() as ResultMetadata;
    await prisma.toolDownloadResult.update({
      where: { id: result.resultId },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    try {
      const expired = await request.get(`${BASE_URL}/api/download-result/${result.resultId}`);
      expect(expired.status()).toBe(410);
    } finally {
      await cleanResult(result.resultId);
    }
  });
});
