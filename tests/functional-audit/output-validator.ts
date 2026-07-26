import crypto from 'crypto';
import path from 'path';
import type { FunctionalExpectedOutput } from '../../app/lib/audit-category-tools';

export interface ValidatedOutputEvidence {
  filename: string;
  extension: string;
  mimeType?: string;
  sizeBytes: number;
  sha256: string;
  signature: string;
}

function signatureName(buffer: Buffer): string {
  const hex = buffer.subarray(0, 16).toString('hex');
  const ascii = buffer.subarray(0, 16).toString('ascii');
  if (ascii.startsWith('%PDF-')) return 'pdf';
  if (hex.startsWith('504b0304') || hex.startsWith('504b0506') || hex.startsWith('504b0708')) return 'zip';
  if (hex.startsWith('ffd8ff')) return 'jpeg';
  if (hex.startsWith('89504e470d0a1a0a')) return 'png';
  if (ascii.startsWith('GIF8')) return 'gif';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'webp';
  if (ascii.startsWith('RIFF')) return 'riff';
  if (ascii.startsWith('ID3') || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)) return 'mpeg-audio';
  if (ascii.startsWith('fLaC')) return 'flac';
  if (ascii.startsWith('OggS')) return 'ogg';
  if (ascii.includes('ftyp')) return 'iso-media';
  if (hex.startsWith('1a45dfa3')) return 'matroska';
  if (hex.startsWith('49492a00') || hex.startsWith('4d4d002a')) return 'tiff';
  if (hex.startsWith('d0cf11e0a1b11ae1')) return 'ole-office';
  return 'text-or-unknown';
}

function detectedMimeType(signature: string, extension: string): string | undefined {
  const bySignature: Record<string, string> = {
    pdf: 'application/pdf', zip: 'application/zip', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', tiff: 'image/tiff', matroska: extension === '.webm' ? 'video/webm' : 'video/x-matroska',
    'mpeg-audio': extension === '.aac' ? 'audio/aac' : 'audio/mpeg', flac: 'audio/flac', ogg: 'audio/ogg',
  };
  const byExtension: Record<string, string> = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.m4a': 'audio/mp4', '.m4r': 'audio/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.avi': 'video/x-msvideo', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.csv': 'text/csv', '.txt': 'text/plain',
    '.json': 'application/json', '.xml': 'application/xml', '.yaml': 'application/yaml', '.yml': 'application/yaml',
    '.html': 'text/html', '.rtf': 'application/rtf', '.tsv': 'text/tab-separated-values',
  };
  return byExtension[extension] || bySignature[signature];
}

export function validateOutputBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string | undefined,
  expected?: FunctionalExpectedOutput,
): ValidatedOutputEvidence {
  const extension = path.extname(filename).toLowerCase();
  const minSize = expected?.minSizeBytes ?? 1;
  if (buffer.length < minSize) {
    throw new Error(`Output ${filename} is ${buffer.length} bytes; expected at least ${minSize}`);
  }
  if (expected?.extension && extension !== expected.extension.toLowerCase()) {
    throw new Error(`Output extension ${extension || 'missing'} does not match ${expected.extension}`);
  }
  const signature = signatureName(buffer);
  const normalizedMime = mimeType?.split(';')[0].trim().toLowerCase() || detectedMimeType(signature, extension);
  if (expected?.mimeType && normalizedMime !== expected.mimeType.toLowerCase()) {
    throw new Error(`Output MIME ${normalizedMime || 'unknown'} does not match ${expected.mimeType}`);
  }
  if (expected?.signature === 'pdf' && signature !== 'pdf') throw new Error('Downloaded output is not a valid PDF signature');
  if (expected?.signature === 'zip' && signature !== 'zip') throw new Error('Downloaded output is not a valid ZIP signature');
  if (expected?.signature === 'office' && ['.docx', '.xlsx', '.pptx'].includes(extension) && signature !== 'zip') throw new Error('Downloaded OOXML output is not a valid ZIP signature');
  if (expected?.signature === 'office' && !['.docx', '.xlsx', '.pptx'].includes(extension) && !['zip', 'ole-office', 'text-or-unknown'].includes(signature)) throw new Error('Downloaded output has an invalid Office signature');
  if (expected?.signature === 'image' && !['jpeg', 'png', 'gif', 'webp', 'tiff', 'iso-media', 'riff'].includes(signature)) throw new Error('Downloaded output has an invalid image signature');
  if (expected?.signature === 'media' && !['riff', 'iso-media', 'matroska', 'mpeg-audio', 'flac', 'ogg'].includes(signature)) throw new Error('Downloaded output has an invalid media signature');
  if (expected?.signature === 'text' && signature !== 'text-or-unknown') throw new Error('Downloaded output has an invalid text signature');

  return {
    filename,
    extension,
    mimeType: normalizedMime,
    sizeBytes: buffer.length,
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
    signature,
  };
}
