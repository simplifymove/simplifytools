import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import AdmZip from 'adm-zip';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { AUDIT_CATEGORY_DEFINITIONS } from '../../app/lib/audit-category-tools';

const require = createRequire(import.meta.url);
const ffprobeStatic = require('ffprobe-static') as { path: string };

type Validation = {
  path: string;
  format: string;
  sizeBytes: number;
  detectedMime: string;
  magicValid: boolean;
  parserValid: boolean;
  parserDetail: string;
  tools: string[];
  sha256: string;
  durationSeconds?: number;
  dimensions?: string;
  expectedNegative?: boolean;
};

const ROOT = path.resolve('tests/fixtures');
const REPORT_JSON = path.join(ROOT, 'validation-report.json');
const REPORT_MD = path.join(ROOT, 'validation-report.md');
const excluded = new Set(['README.md', 'generate-fixtures.js', 'validate-fixtures.ts', 'validation-report.json', 'validation-report.md']);
const textExtensions = new Set(['.txt', '.html', '.css', '.js', '.ts', '.sql', '.md', '.json', '.xml', '.yaml', '.yml', '.csv', '.tsv', '.rtf', '.doc', '.xls', '.msg', '.svg', '.eps']);
const mediaExtensions = new Set(['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.m4v', '.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg']);
const zipContainerExtensions = new Set(['.zip', '.docx', '.xlsx', '.pptx', '.vsdx', '.epub']);

const mimeByExtension: Record<string, string> = {
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint', '.doc': 'application/msword', '.xls': 'application/vnd.ms-excel', '.rtf': 'application/rtf',
  '.txt': 'text/plain', '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ts': 'text/typescript', '.sql': 'application/sql',
  '.md': 'text/markdown', '.json': 'application/json', '.xml': 'application/xml', '.yaml': 'application/yaml', '.yml': 'application/yaml',
  '.csv': 'text/csv', '.tsv': 'text/tab-separated-values', '.msg': 'message/rfc822', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.heic': 'image/heic', '.eps': 'application/postscript', '.psd': 'image/vnd.adobe.photoshop',
  '.mp4': 'video/mp4', '.m4v': 'video/x-m4v', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo', '.webm': 'video/webm',
  '.mkv': 'video/x-matroska', '.flv': 'video/x-flv', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.aac': 'audio/aac', '.flac': 'audio/flac', '.ogg': 'audio/ogg', '.epub': 'application/epub+zip',
  '.mobi': 'application/x-mobipocket-ebook', '.azw3': 'application/vnd.amazon.ebook', '.vsd': 'application/vnd.visio',
  '.vsdx': 'application/vnd.ms-visio.drawing',
};

const usage = new Map<string, string[]>();
for (const category of AUDIT_CATEGORY_DEFINITIONS) {
  for (const tool of category.tools) {
    for (const fixture of tool.functionalAudit.fixtures || []) {
      const normalized = fixture.replaceAll('\\', '/');
      usage.set(normalized, [...(usage.get(normalized) || []), `${category.id}/${tool.slug}`]);
    }
  }
}

function detectMime(bytes: Buffer, extension: string): string {
  const ascii = bytes.subarray(0, 16).toString('ascii');
  if (ascii.startsWith('%PDF-')) return 'application/pdf';
  if (bytes.subarray(0, 4).equals(Buffer.from('504b0304', 'hex'))) return 'application/zip';
  if (bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (ascii.startsWith('\u0089PNG')) return 'image/png';
  if (ascii.startsWith('GIF8')) return 'image/gif';
  if (ascii.startsWith('RIFF') && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (ascii.startsWith('RIFF') && bytes.subarray(8, 12).toString('ascii') === 'WAVE') return 'audio/wav';
  if (ascii.startsWith('RIFF') && bytes.subarray(8, 12).toString('ascii') === 'AVI ') return 'video/x-msvideo';
  if (ascii.startsWith('BM')) return 'image/bmp';
  if (ascii.startsWith('II*\0') || ascii.startsWith('MM\0*')) return 'image/tiff';
  if (ascii.startsWith('8BPS')) return 'image/vnd.adobe.photoshop';
  if (ascii.startsWith('fLaC')) return 'audio/flac';
  if (ascii.startsWith('OggS')) return extension === '.ogg' ? 'audio/ogg' : mimeByExtension[extension];
  if (ascii.startsWith('ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return extension === '.aac' ? 'audio/aac' : 'audio/mpeg';
  if (bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = bytes.subarray(8, 12).toString('ascii');
    if (/avif|avis/.test(brand)) return 'image/avif';
    if (/heic|heix|hevc|hevx|mif1/.test(brand)) return 'image/heic';
    return extension === '.m4a' ? 'audio/mp4' : mimeByExtension[extension] || 'video/mp4';
  }
  if (bytes.subarray(0, 4).equals(Buffer.from('1a45dfa3', 'hex'))) return extension === '.webm' ? 'video/webm' : 'video/x-matroska';
  if (bytes.subarray(0, 4).equals(Buffer.from('d0cf11e0', 'hex'))) return mimeByExtension[extension] || 'application/x-ole-storage';
  if (bytes.subarray(60, 68).toString('ascii') === 'BOOKMOBI') return mimeByExtension[extension];
  return mimeByExtension[extension] || (textExtensions.has(extension) ? 'text/plain' : 'application/octet-stream');
}

function validateZip(file: string, extension: string): string {
  const entries = new Set(new AdmZip(file).getEntries().map((entry) => entry.entryName));
  const required: Record<string, string[]> = {
    '.docx': ['[Content_Types].xml', 'word/document.xml'],
    '.xlsx': ['[Content_Types].xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml'],
    '.pptx': ['[Content_Types].xml', 'ppt/presentation.xml', 'ppt/slides/slide1.xml'],
    '.vsdx': ['[Content_Types].xml', 'visio/document.xml'],
    '.epub': ['mimetype', 'META-INF/container.xml', 'OEBPS/content.opf'],
  };
  const missing = (required[extension] || []).filter((entry) => !entries.has(entry));
  if (missing.length) throw new Error(`missing ZIP entries: ${missing.join(', ')}`);
  return `${entries.size} ZIP entries`;
}

function validateOle(bytes: Buffer): string {
  if (bytes.length < 1536 || !bytes.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))) throw new Error('invalid OLE compound document signature or length');
  const majorVersion = bytes.readUInt16LE(26);
  const byteOrder = bytes.readUInt16LE(28);
  const sectorShift = bytes.readUInt16LE(30);
  if (![3, 4].includes(majorVersion) || byteOrder !== 0xfffe || ![9, 12].includes(sectorShift)) throw new Error('invalid OLE compound document header');
  return `OLE v${majorVersion}, ${2 ** sectorShift}-byte sectors`;
}

async function parseFixture(file: string, extension: string, bytes: Buffer): Promise<{ detail: string; durationSeconds?: number; dimensions?: string }> {
  if (extension === '.pdf') {
    const document = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return { detail: `${document.getPageCount()} PDF page(s)` };
  }
  if (['.docx', '.xlsx', '.pptx', '.vsdx', '.epub', '.zip'].includes(extension)) return { detail: validateZip(file, extension) };
  if (mediaExtensions.has(extension)) {
    const result = spawnSync(ffprobeStatic.path, ['-v', 'error', '-show_entries', 'format=duration,format_name', '-of', 'json', file], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr.trim() || 'ffprobe rejected file');
    const parsed = JSON.parse(result.stdout);
    const durationSeconds = Number(parsed.format?.duration);
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 5) throw new Error(`invalid fixture duration ${parsed.format?.duration}`);
    return { detail: `${parsed.format.format_name}, ${durationSeconds.toFixed(3)}s`, durationSeconds };
  }
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.avif', '.heic', '.svg'].includes(extension)) {
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height) throw new Error('image has no dimensions');
    return { detail: `${metadata.format} ${metadata.width}x${metadata.height}`, dimensions: `${metadata.width}x${metadata.height}` };
  }
  if (extension === '.bmp') {
    const width = bytes.readInt32LE(18); const height = Math.abs(bytes.readInt32LE(22));
    if (width < 1 || height < 1 || bytes.readUInt32LE(2) !== bytes.length) throw new Error('invalid BMP header or length');
    return { detail: `BMP ${width}x${height}`, dimensions: `${width}x${height}` };
  }
  if (extension === '.psd') {
    const width = bytes.readUInt32BE(18); const height = bytes.readUInt32BE(14);
    if (bytes.subarray(0, 4).toString() !== '8BPS' || bytes.readUInt16BE(4) !== 1 || !width || !height) throw new Error('invalid PSD header');
    return { detail: `PSD ${width}x${height}`, dimensions: `${width}x${height}` };
  }
  const text = bytes.toString('utf8');
  if (extension === '.json') JSON.parse(text);
  if (extension === '.xml' && !/^<\?xml[\s\S]*<items>[\s\S]*<\/items>\s*$/.test(text.trim())) throw new Error('XML structure is not well formed for the fixture contract');
  if (['.yaml', '.yml'].includes(extension) && !text.split(/\r?\n/).filter(Boolean).every((line) => /^[\w-]+:\s+.+$/.test(line))) throw new Error('YAML key/value parse failed');
  if (extension === '.csv' && !text.trim().split(/\r?\n/).every((line) => line.split(',').length === 2)) throw new Error('CSV column counts differ');
  if (extension === '.tsv' && !text.trim().split(/\r?\n/).every((line) => line.split('\t').length === 2)) throw new Error('TSV column counts differ');
  if (extension === '.rtf' && !text.startsWith('{\\rtf1')) throw new Error('invalid RTF header');
  if (extension === '.doc' && !/<html[\s>]/i.test(text)) throw new Error('Word-compatible HTML document is invalid');
  if (extension === '.xls' && !/<Workbook[\s>]/.test(text)) throw new Error('SpreadsheetML workbook is invalid');
  if (extension === '.msg' && !/^From:.*\r?\nTo:.*\r?\nSubject:/m.test(text)) throw new Error('RFC822 message headers missing');
  if (extension === '.eps' && !text.startsWith('%!PS-Adobe') ) throw new Error('invalid EPS header');
  if (['.mobi', '.azw3'].includes(extension)) {
    if (bytes.subarray(60, 68).toString('ascii') !== 'BOOKMOBI') throw new Error('BOOKMOBI header missing');
    const palmRecordCount = bytes.readUInt16BE(76);
    if (palmRecordCount === 0) throw new Error('Palm database has no records');
    return { detail: `BOOKMOBI, ${palmRecordCount} Palm record(s)` };
  }
  if (extension === '.vsd' || extension === '.ppt') return { detail: validateOle(bytes) };
  if (!bytes.length) throw new Error('empty file');
  return { detail: 'text/structure parsed' };
}

async function main() {
  const files = fs.readdirSync(ROOT, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !excluded.has(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  const results: Validation[] = [];
  for (const file of files) {
    const relative = path.relative(process.cwd(), file).replaceAll('\\', '/');
    const extension = path.extname(file).toLowerCase();
    const bytes = fs.readFileSync(file);
    const detectedMime = detectMime(bytes, extension);
    const expectedMime = mimeByExtension[extension];
    const expectedNegative = relative.endsWith('/corrupted.pdf');
    let parserValid = false; let parserDetail = '';
    try {
      const parsed = await parseFixture(file, extension, bytes);
      parserValid = true; parserDetail = parsed.detail;
      results.push({ path: relative, format: extension.slice(1).toUpperCase(), sizeBytes: bytes.length, detectedMime,
        magicValid: !expectedMime || detectedMime === expectedMime || (zipContainerExtensions.has(extension) && detectedMime === 'application/zip') || (extension === '.heic' && detectedMime === 'image/avif'), parserValid,
        parserDetail, tools: usage.get(relative) || [], sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        durationSeconds: parsed.durationSeconds, dimensions: parsed.dimensions, expectedNegative });
    } catch (error) {
      parserDetail = error instanceof Error ? error.message : String(error);
      results.push({ path: relative, format: extension.slice(1).toUpperCase(), sizeBytes: bytes.length, detectedMime,
        magicValid: !expectedMime || detectedMime === expectedMime, parserValid, parserDetail, tools: usage.get(relative) || [],
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'), expectedNegative });
    }
  }
  const personalDataHits = results.filter((result) => {
    if (!textExtensions.has(`.${result.format.toLowerCase()}`)) return false;
    const text = fs.readFileSync(result.path, 'utf8');
    return /\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]*?){13,16}\b|@(?!example\.invalid\b)[\w.-]+\.[a-z]{2,}\b/i.test(text);
  });
  const failures = results.filter((result) => (!result.magicValid || !result.parserValid) && !result.expectedNegative);
  const summary = { fixtureCount: results.length, totalBytes: results.reduce((sum, result) => sum + result.sizeBytes, 0),
    valid: results.length - failures.length, failures: failures.length, expectedNegative: results.filter((result) => result.expectedNegative).length,
    personalDataHits: personalDataHits.length };
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, fixtures: results }, null, 2)}\n`);
  const rows = results.map((result) => `| ${result.path} | ${result.format} | ${result.sizeBytes} | ${result.detectedMime} | ${result.magicValid ? 'PASS' : 'FAIL'} | ${result.parserValid ? 'PASS' : result.expectedNegative ? 'EXPECTED_NEGATIVE' : 'FAIL'} (${result.parserDetail.replaceAll('|', '\\|')}) | ${result.tools.join(', ') || '-'} |`);
  fs.writeFileSync(REPORT_MD, `# Functional audit fixture validation\n\nGenerated by \`npm run validate-fixtures\`. Paths are repository-relative; no host paths are recorded.\n\n${JSON.stringify(summary)}\n\n| Fixture path | Format | Bytes | Detected MIME | Magic | Parser | Tools using fixture |\n|---|---:|---:|---|---|---|---|\n${rows.join('\n')}\n`);
  console.log(JSON.stringify(summary, null, 2));
  if (results.length !== 65) throw new Error(`Expected 65 fixture assets, found ${results.length}`);
  if (personalDataHits.length) throw new Error(`Personal-data patterns found in: ${personalDataHits.map((item) => item.path).join(', ')}`);
  if (failures.length) throw new Error(`Fixture validation failed: ${failures.map((item) => `${item.path} (${item.parserDetail})`).join('; ')}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
