import fs from 'fs';
import path from 'path';
import { AUDIT_CATEGORY_DEFINITIONS } from '../../app/lib/audit-category-tools';
import { validateOutputBuffer } from './output-validator';

const errors: string[] = [];
const activeTargets = AUDIT_CATEGORY_DEFINITIONS.flatMap((category) =>
  category.tools.map((target) => ({ category: category.id, target })),
).filter(({ target }) => target.functionalAudit.strategy !== 'inactive');

for (const { category, target } of activeTargets) {
  const contract = target.functionalAudit;
  if (!target.route) errors.push(`${category}/${target.slug}: route is missing`);
  if (!contract.resultFlow || contract.resultFlow === 'none') errors.push(`${category}/${target.slug}: active tool has no result flow`);
  if (['file', 'pdf-editor', 'pdf-annotate', 'pdf-esign', 'pdf-rearrange'].includes(contract.strategy) && !contract.fixtures?.length) {
    errors.push(`${category}/${target.slug}: file strategy has no fixture`);
  }
  for (const fixture of contract.fixtures || []) {
    const resolved = path.resolve(fixture);
    if (!fs.existsSync(resolved)) errors.push(`${category}/${target.slug}: fixture does not exist: ${fixture}`);
    else if (fs.statSync(resolved).size === 0) errors.push(`${category}/${target.slug}: fixture is empty: ${fixture}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/pdf/simple.pdf')), 'simple.pdf', 'application/pdf', { extension: '.pdf', mimeType: 'application/pdf', minSizeBytes: 100, signature: 'pdf' });
validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/archives/sample.zip')), 'sample.zip', 'application/zip', { extension: '.zip', mimeType: 'application/zip', minSizeBytes: 32, signature: 'zip' });
validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/images/sample.png')), 'sample.png', 'image/png', { extension: '.png', mimeType: 'image/png', minSizeBytes: 32, signature: 'image' });
validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/documents/sample.docx')), 'sample.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', { extension: '.docx', minSizeBytes: 32, signature: 'office' });
validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/video/sample.mp4')), 'sample.mp4', 'video/mp4', { extension: '.mp4', mimeType: 'video/mp4', minSizeBytes: 32, signature: 'media' });
let rejectedMissingExtension = false;
try {
  validateOutputBuffer(fs.readFileSync(path.resolve('tests/fixtures/pdf/simple.pdf')), 'missing-extension', 'application/pdf', { extension: '.pdf', mimeType: 'application/pdf', signature: 'pdf' });
} catch {
  rejectedMissingExtension = true;
}
if (!rejectedMissingExtension) throw new Error('Output validation accepted a filename without its required extension');

let rejectedZipAsCsv = false;
try {
  validateOutputBuffer(
    fs.readFileSync(path.resolve('tests/fixtures/documents/sample.docx')),
    'renamed.csv',
    'text/csv',
    { extension: '.csv', mimeType: 'text/csv', signature: 'text' },
  );
} catch {
  rejectedZipAsCsv = true;
}
if (!rejectedZipAsCsv) throw new Error('Output validation accepted ZIP/OOXML bytes as CSV');

const uniqueFixtures = new Set(activeTargets.flatMap(({ target }) => target.functionalAudit.fixtures || []));
console.log(JSON.stringify({ categories: AUDIT_CATEGORY_DEFINITIONS.length, targets: activeTargets.length, fixtures: uniqueFixtures.size }, null, 2));
