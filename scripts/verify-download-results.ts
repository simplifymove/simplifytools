/**
 * Development verification fixture.
 * Start the app, then run:
 * node --conditions=react-server --import tsx scripts/verify-download-results.ts
 */
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { ToolDownloadResultStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  createDownloadResult,
  getAllowedDownloadDirectories,
} from '../lib/services/download-result';

const baseUrl = process.env.VERIFICATION_BASE_URL || 'http://localhost:3000';
const createdResultIds: string[] = [];
const createdFiles: string[] = [];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const token = `${Date.now()}-${process.pid}`;
  const allowedDirectory = getAllowedDownloadDirectories()[0];
  const samplePath = path.join(allowedDirectory, `download-result-${token}.txt`);
  const expiredPath = path.join(allowedDirectory, `download-result-expired-${token}.txt`);
  const outsidePath = path.join(process.cwd(), 'tmp', `download-result-outside-${token}.txt`);

  await mkdir(allowedDirectory, { recursive: true });
  await mkdir(path.dirname(outsidePath), { recursive: true });
  await writeFile(samplePath, 'SimplifyConvert download-result verification');
  await writeFile(expiredPath, 'Expired result verification');
  await writeFile(outsidePath, 'This path must be rejected');
  createdFiles.push(samplePath, expiredPath, outsidePath);

  let rejectedOutsidePath = false;
  try {
    await createDownloadResult({
      toolSlug: 'verification-only',
      outputName: 'outside.txt',
      outputPath: outsidePath,
      mimeType: 'text/plain',
    });
  } catch {
    rejectedOutsidePath = true;
  }
  assert(rejectedOutsidePath, 'Creation service accepted a path outside approved directories');

  const ready = await createDownloadResult({
    toolSlug: 'verification-only',
    originalName: 'sample.txt',
    outputName: 'verified-result.txt',
    outputPath: samplePath,
    mimeType: 'text/plain',
  });
  createdResultIds.push(ready.id);

  const expired = await prisma.toolDownloadResult.create({
    data: {
      toolSlug: 'verification-only',
      outputName: 'expired-result.txt',
      outputPath: expiredPath,
      mimeType: 'text/plain',
      fileSize: BigInt(27),
      status: ToolDownloadResultStatus.READY,
      expiresAt: new Date(Date.now() - 60_000),
    },
  });
  createdResultIds.push(expired.id);

  const pageResponse = await fetch(`${baseUrl}${ready.downloadPageUrl}`, { cache: 'no-store' });
  const pageHtml = await pageResponse.text();
  assert(pageResponse.ok, `Download page returned ${pageResponse.status}`);
  assert(pageHtml.includes('Your file is ready'), 'Ready metadata was not rendered');
  assert(pageHtml.includes('verified-result.txt'), 'Output filename was not rendered');
  assert(!pageHtml.includes(samplePath), 'Physical output path leaked into the page');

  const downloadResponse = await fetch(`${baseUrl}/api/download-result/${ready.id}`);
  assert(downloadResponse.ok, `Download endpoint returned ${downloadResponse.status}`);
  assert(
    downloadResponse.headers.get('content-disposition')?.includes('verified-result.txt'),
    'Download filename header was not set',
  );
  assert(
    (await downloadResponse.text()) === 'SimplifyConvert download-result verification',
    'Downloaded file content did not match',
  );

  const expiredResponse = await fetch(`${baseUrl}/api/download-result/${expired.id}`);
  assert(expiredResponse.status === 410, `Expired result returned ${expiredResponse.status}, expected 410`);

  console.log('Download-result verification passed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (createdResultIds.length > 0) {
      await prisma.toolDownloadResult.deleteMany({
        where: { id: { in: createdResultIds } },
      }).catch(() => undefined);
    }
    await Promise.all(createdFiles.map((file) => unlink(file).catch(() => undefined)));
    await prisma.$disconnect();
  });
