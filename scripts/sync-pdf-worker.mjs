import { createHash } from 'node:crypto';
import { copyFile, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJsonPath = require.resolve('pdfjs-dist/package.json');
const packageDirectory = path.dirname(packageJsonPath);
const source = path.join(packageDirectory, 'build', 'pdf.worker.min.js');
const destination = path.join(process.cwd(), 'public', 'pdf.worker.js');
const temporaryDestination = `${destination}.tmp`;

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

try {
  const sourceStats = await stat(source);
  if (!sourceStats.isFile() || sourceStats.size === 0) {
    throw new Error('the worker source is not a non-empty file');
  }
} catch (error) {
  throw new Error(
    `Cannot synchronize PDF.js ${packageJson.version}: expected worker source was not found at ${source}`,
    { cause: error },
  );
}

try {
  await copyFile(source, temporaryDestination);
  await rename(temporaryDestination, destination);
} finally {
  await rm(temporaryDestination, { force: true }).catch(() => undefined);
}

const [sourceBytes, destinationBytes] = await Promise.all([
  readFile(source),
  readFile(destination),
]);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

if (sha256(sourceBytes) !== sha256(destinationBytes)) {
  throw new Error(`PDF.js worker verification failed after copying to ${destination}`);
}

console.log(`Synchronized pdfjs-dist ${packageJson.version} worker to ${destination}`);
console.log(`Verified ${destinationBytes.length} bytes, SHA-256 ${sha256(destinationBytes)}`);
