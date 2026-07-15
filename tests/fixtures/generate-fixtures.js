/** Reproducibly generate the small, non-personal fixtures used by functional audits. */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const PptxGenJS = require('pptxgenjs');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');

const ROOT = __dirname;
const dirs = Object.fromEntries(['pdf', 'images', 'documents', 'video', 'audio', 'data', 'code', 'archives'].map((name) => [name, path.join(ROOT, name)]));
Object.values(dirs).forEach((directory) => fs.mkdirSync(directory, { recursive: true }));

function write(group, name, content) {
  fs.writeFileSync(path.join(dirs[group], name), content);
}

function addZipText(zip, name, content) {
  zip.addFile(name, Buffer.from(content, 'utf8'));
}

async function createPdfs() {
  async function pdf(pageCount, label) {
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    for (let index = 1; index <= pageCount; index += 1) {
      const page = document.addPage([320, 240]);
      page.drawText(`${label} - Page ${index}`, { x: 24, y: 190, size: 18, font, color: rgb(0.1, 0.2, 0.5) });
      page.drawText('Predictable audit fixture content.', { x: 24, y: 160, size: 10, font });
    }
    return Buffer.from(await document.save());
  }
  const simple = await pdf(1, 'SimplifyConvert Test PDF');
  const multi = await pdf(3, 'SimplifyConvert Multi-page PDF');
  write('pdf', 'simple.pdf', simple);
  write('pdf', 'valid.pdf', simple);
  write('pdf', 'multi-page.pdf', multi);
  write('pdf', 'multipage.pdf', multi);
  write('pdf', 'corrupted.pdf', Buffer.from('%PDF-1.4\ninvalid audit fixture\n%%EOF\n'));
  const pythonCandidates = process.platform === 'win32'
    ? [path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'), 'python']
    : [path.join(process.cwd(), '.venv', 'bin', 'python'), 'python3'];
  const python = pythonCandidates.find((candidate) => candidate === 'python' || candidate === 'python3' || fs.existsSync(candidate));
  const encryptionScript = 'from PyPDF2 import PdfReader, PdfWriter\nimport sys\nr=PdfReader(sys.argv[1]); w=PdfWriter()\nfor p in r.pages: w.add_page(p)\nw.encrypt("Audit123!")\nwith open(sys.argv[2], "wb") as f: w.write(f)';
  const encrypted = spawnSync(python, ['-c', encryptionScript, path.join(dirs.pdf, 'simple.pdf'), path.join(dirs.pdf, 'protected.pdf')], { encoding: 'utf8' });
  if (encrypted.status !== 0) throw new Error(`Unable to generate encrypted PDF: ${encrypted.stderr}`);
}

function deterministicThresholdImage() {
  const pixels = Buffer.alloc(32 * 32 * 4);
  for (let y = 0; y < 32; y += 1) {
    for (let x = 0; x < 32; x += 1) {
      const offset = (y * 32 + x) * 4;
      pixels[offset] = (x * 17 + y * 3) % 256;
      pixels[offset + 1] = (x * 5 + y * 19) % 256;
      pixels[offset + 2] = (x * 11 + y * 7) % 256;
      pixels[offset + 3] = 255;
    }
  }
  return sharp(pixels, { raw: { width: 32, height: 32, channels: 4 } });
}

async function createImages() {
  const pixels = Buffer.from([
    30, 100, 220, 255, 240, 240, 240, 255,
    240, 240, 240, 255, 30, 100, 220, 255,
  ]);
  const image = sharp(pixels, { raw: { width: 2, height: 2, channels: 4 } });
  const thresholdImage = deterministicThresholdImage();
  await Promise.all([
    image.clone().jpeg({ quality: 80 }).toFile(path.join(dirs.images, 'sample.jpg')),
    image.clone().jpeg({ quality: 80 }).toFile(path.join(dirs.images, 'sample.jpeg')),
    image.clone().png().toFile(path.join(dirs.images, 'sample.png')),
    thresholdImage.clone().webp({ quality: 80 }).toFile(path.join(dirs.images, 'sample.webp')),
    thresholdImage.clone().gif().toFile(path.join(dirs.images, 'sample.gif')),
    image.clone().tiff().toFile(path.join(dirs.images, 'sample.tiff')),
    image.clone().avif().toFile(path.join(dirs.images, 'sample.avif')),
    image.clone().avif().toFile(path.join(dirs.images, 'sample.heic')),
  ]);
  write('images', 'sample.bmp', Buffer.from('424d3a0000000000000036000000280000000100000001000000010018000000000004000000000000000000000000000000000000001e64dc00', 'hex'));
  write('images', 'sample.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#1e64dc"/></svg>\n');
  write('images', 'sample.eps', '%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 32 32\n0.12 0.39 0.86 setrgbcolor\n0 0 32 32 rectfill\nshowpage\n');
  const psd = Buffer.alloc(43, 0);
  psd.write('8BPS', 0, 'ascii'); psd.writeUInt16BE(1, 4); psd.writeUInt16BE(3, 12); psd.writeUInt32BE(1, 14); psd.writeUInt32BE(1, 18); psd.writeUInt16BE(8, 22); psd.writeUInt16BE(3, 24);
  write('images', 'sample.psd', psd);

  const imagePdf = await PDFDocument.create();
  const embedded = await imagePdf.embedPng(fs.readFileSync(path.join(dirs.images, 'sample.png')));
  for (let index = 0; index < 2; index += 1) {
    const page = imagePdf.addPage([64, 64]);
    page.drawImage(embedded, { x: 16, y: 16, width: 32, height: 32 });
  }
  const imageOnlyPdf = Buffer.from(await imagePdf.save());
  write('pdf', 'images.pdf', imageOnlyPdf);
  write('pdf', 'scanned.pdf', imageOnlyPdf);
}

async function createThresholdImageFixtures() {
  const image = deterministicThresholdImage();
  await Promise.all([
    image.clone().webp({ quality: 80 }).toFile(path.join(dirs.images, 'sample.webp')),
    image.clone().gif().toFile(path.join(dirs.images, 'sample.gif')),
  ]);
}

function createXlsx() {
  const zip = new AdmZip();
  addZipText(zip, '[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
  addZipText(zip, '_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  addZipText(zip, 'xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Audit" sheetId="1" r:id="rId1"/></sheets></workbook>');
  addZipText(zip, 'xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
  addZipText(zip, 'xl/worksheets/sheet1.xml', '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>name</t></is></c><c r="B1" t="inlineStr"><is><t>value</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>audit</t></is></c><c r="B2"><v>1</v></c></row></sheetData></worksheet>');
  zip.writeZip(path.join(dirs.documents, 'sample.xlsx'));
}

async function createDocuments() {
  const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun('SimplifyConvert predictable audit document.')] })] }] });
  write('documents', 'sample.docx', await Packer.toBuffer(doc));
  write('documents', 'sample.doc', '<html><body><p>SimplifyConvert predictable audit document.</p></body></html>');
  write('documents', 'sample.txt', 'SimplifyConvert predictable audit text.\n');
  write('documents', 'sample.rtf', '{\\rtf1\\ansi SimplifyConvert predictable audit document.}');
  write('documents', 'sample.xls', '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet Name="Audit"><Table><Row><Cell><Data Type="String">audit</Data></Cell></Row></Table></Worksheet></Workbook>');
  write('documents', 'sample.msg', 'From: audit@example.invalid\r\nTo: audit@example.invalid\r\nSubject: Audit fixture\r\n\r\nPredictable audit message.');
  // VSD/VSDX are parser-tested Apache Tika fixtures retained in version control;
  // there is no standards-compliant Visio writer in this project's dependency set.
  const vsdPath = path.join(dirs.documents, 'sample.vsd');
  const vsdxPath = path.join(dirs.documents, 'sample.vsdx');
  if (!fs.existsSync(vsdPath) || !fs.readFileSync(vsdPath).subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))) {
    throw new Error('Missing valid sample.vsd. Restore the Apache Tika fixture documented in tests/fixtures/README.md.');
  }
  if (!fs.existsSync(vsdxPath) || !fs.readFileSync(vsdxPath).subarray(0, 4).equals(Buffer.from('504b0304', 'hex'))) {
    throw new Error('Missing valid sample.vsdx. Restore the Apache Tika fixture documented in tests/fixtures/README.md.');
  }
  createXlsx();

  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addText('SimplifyConvert Audit Slide', { x: 0.5, y: 0.5, w: 5, h: 0.5 });
  await pptx.writeFile({ fileName: path.join(dirs.documents, 'sample.pptx') });
  const legacyPptPath = path.join(dirs.documents, 'sample.ppt');
  if (process.platform === 'win32') {
    const legacyResult = spawnSync('cscript.exe', ['//nologo', path.join(process.cwd(), 'scripts', 'generate-legacy-ppt.vbs'), legacyPptPath], { encoding: 'utf8' });
    const existingLegacyPpt = fs.existsSync(legacyPptPath) ? fs.readFileSync(legacyPptPath) : Buffer.alloc(0);
    if (legacyResult.status !== 0 && !existingLegacyPpt.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))) {
      throw new Error(`Unable to generate legacy PPT with installed PowerPoint: ${legacyResult.stderr}`);
    }
  }
  const legacyPpt = fs.existsSync(legacyPptPath) ? fs.readFileSync(legacyPptPath) : Buffer.alloc(0);
  if (!legacyPpt.subarray(0, 8).equals(Buffer.from('d0cf11e0a1b11ae1', 'hex'))) {
    throw new Error('sample.ppt must be a committed OLE PowerPoint fixture; generation requires Microsoft PowerPoint on Windows.');
  }

  const epub = new AdmZip();
  addZipText(epub, 'mimetype', 'application/epub+zip');
  addZipText(epub, 'META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  addZipText(epub, 'OEBPS/content.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Audit</dc:title><dc:identifier id="id">audit-fixture</dc:identifier></metadata><manifest><item id="page" href="page.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="page"/></spine></package>');
  addZipText(epub, 'OEBPS/page.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Predictable audit ebook.</p></body></html>');
  epub.writeZip(path.join(dirs.documents, 'sample.epub'));
  createEbookFixtures();
}

function normalizeCalibreEbook(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length < 82 || bytes.subarray(60, 68).toString('ascii') !== 'BOOKMOBI') {
    throw new Error(`Calibre did not create a valid BOOKMOBI file: ${file}`);
  }

  // Calibre writes the current Palm timestamps and a generated internal UUID.
  // Normalize only those identity fields so the committed fixtures are byte-stable.
  bytes.writeUInt32BE(0, 36);
  bytes.writeUInt32BE(0, 40);
  const firstRecordOffset = bytes.readUInt32BE(78);
  bytes.writeUInt32BE(0x53434658, firstRecordOffset + 32);
  const calibreUuid = /calibre:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
  const latin1 = bytes.toString('latin1');
  const matches = [...latin1.matchAll(calibreUuid)];
  if (matches.length !== 1 || matches[0].index === undefined) {
    throw new Error(`Expected one Calibre UUID in ${file}, found ${matches.length}`);
  }
  bytes.write('calibre:00000000-0000-4000-8000-000000000001', matches[0].index, 'ascii');
  fs.writeFileSync(file, bytes);
}

function createEbookFixtures() {
  const ebookConvert = process.env.CALIBRE_EBOOK_CONVERT || 'ebook-convert';
  const input = path.join(dirs.documents, 'sample.epub');
  const commonArgs = [
    '--title', 'SimplifyConvert Audit Ebook',
    '--authors', 'SimplifyConvert',
    '--publisher', 'SimplifyConvert',
    '--book-producer', 'SimplifyConvert Fixture Generator',
    '--pubdate', '2000-01-01T00:00:00Z',
    '--timestamp', '2000-01-01T00:00:00Z',
    '--share-not-sync',
  ];

  for (const extension of ['mobi', 'azw3']) {
    const output = path.join(dirs.documents, `sample.${extension}`);
    const result = spawnSync(ebookConvert, [input, output, ...commonArgs], { encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error(`ebook-convert failed for sample.${extension}: ${result.stderr || result.error?.message || result.stdout}`);
    }
    normalizeCalibreEbook(output);
  }
}

function createTextFixtures() {
  write('data', 'sample.json', JSON.stringify({ name: 'SimplifyConvert', value: 1 }, null, 2));
  write('data', 'sample.xml', '<?xml version="1.0"?><items><item><name>audit</name><value>1</value></item></items>\n');
  write('data', 'sample.yaml', 'name: SimplifyConvert\nvalue: 1\n');
  write('data', 'sample.yml', 'name: SimplifyConvert\nvalue: 1\n');
  write('data', 'sample.csv', 'name,value\naudit,1\n');
  write('data', 'sample.tsv', 'name\tvalue\naudit\t1\n');
  const code = {
    'sample.html': '<!doctype html><title>Audit</title><p>SimplifyConvert</p>\n',
    'sample.css': 'body { color: #123456; }\n', 'sample.js': 'const audit = true;\n', 'sample.ts': 'const audit: boolean = true;\n',
    'sample.sql': 'SELECT 1 AS audit;\n', 'sample.md': '# SimplifyConvert Audit\n',
    'base64.txt': 'U2ltcGxpZnlDb252ZXJ0IGF1ZGl0', 'url-encoded.txt': 'SimplifyConvert%20audit',
    'jwt.txt': 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhdWRpdCJ9.', 'regex.txt': '^[a-z]+$\n',
  };
  Object.entries(code).forEach(([name, value]) => write('code', name, value));
  const archive = new AdmZip();
  archive.addFile('audit.txt', Buffer.from('Predictable archive content.'));
  archive.writeZip(path.join(dirs.archives, 'sample.zip'));
}

function runFfmpeg(args, output) {
  const result = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args, output], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${path.basename(output)}: ${result.stderr}`);
}

function createMedia() {
  const videoInput = ['-f', 'lavfi', '-i', 'color=c=blue:s=160x120:r=10', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000', '-t', '1'];
  runFfmpeg([...videoInput, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest'], path.join(dirs.video, 'sample.mp4'));
  runFfmpeg([...videoInput, '-c:v', 'mpeg4', '-c:a', 'aac', '-shortest'], path.join(dirs.video, 'sample.mov'));
  runFfmpeg([...videoInput, '-c:v', 'mpeg4', '-c:a', 'mp3', '-shortest'], path.join(dirs.video, 'sample.avi'));
  runFfmpeg([...videoInput, '-c:v', 'libvpx-vp9', '-c:a', 'libopus', '-shortest'], path.join(dirs.video, 'sample.webm'));
  runFfmpeg([...videoInput, '-c:v', 'libx264', '-c:a', 'aac', '-shortest'], path.join(dirs.video, 'sample.mkv'));
  runFfmpeg(['-i', path.join(dirs.video, 'sample.mp4'), '-an', '-c:v', 'flv'], path.join(dirs.video, 'sample.flv'));
  runFfmpeg(['-i', path.join(dirs.video, 'sample.mp4'), '-an', '-c:v', 'copy'], path.join(dirs.video, 'sample.m4v'));
  const audioInput = ['-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000', '-t', '1'];
  runFfmpeg([...audioInput, '-c:a', 'libmp3lame'], path.join(dirs.audio, 'sample.mp3'));
  runFfmpeg([...audioInput, '-c:a', 'pcm_s16le'], path.join(dirs.audio, 'sample.wav'));
  runFfmpeg([...audioInput, '-c:a', 'aac'], path.join(dirs.audio, 'sample.m4a'));
  runFfmpeg([...audioInput, '-c:a', 'aac', '-f', 'adts'], path.join(dirs.audio, 'sample.aac'));
  runFfmpeg([...audioInput, '-c:a', 'flac'], path.join(dirs.audio, 'sample.flac'));
  runFfmpeg([...audioInput, '-c:a', 'libvorbis'], path.join(dirs.audio, 'sample.ogg'));
}

async function generateFixtures() {
  await createPdfs();
  await createImages();
  await createDocuments();
  createTextFixtures();
  createMedia();
  console.log('Generated reproducible functional-audit fixtures.');
}

if (require.main === module) {
  const generate = process.argv.includes('--threshold-images')
    ? createThresholdImageFixtures
    : process.argv.includes('--ebook-fixtures')
      ? createEbookFixtures
      : generateFixtures;
  Promise.resolve(generate()).catch((error) => { console.error(error); process.exit(1); });
}
module.exports = { generateFixtures };
