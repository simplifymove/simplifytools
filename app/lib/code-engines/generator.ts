// Generator Engine - handles generation and utility operations
import { randomBytes, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface GeneratorResult {
  result: string;
  meta?: Record<string, any>;
}

// UUID generation
export function generateUUIDs(count: number = 1, uppercase: boolean = false): GeneratorResult {
  try {
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      throw new Error('Count must be between 1 and 1000');
    }

    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = uuidv4();
      if (uppercase) {
        uuid = uuid.toUpperCase();
      }
      uuids.push(uuid);
    }

    return {
      result: uuids.join('\n'),
      meta: {
        count,
        uppercase,
      },
    };
  } catch (error) {
    throw new Error(
      `UUID generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Hash generation
export function generateHash(
  text: string,
  algorithm: string = 'sha256'
): GeneratorResult {
  try {
    const allowedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];

    if (typeof algorithm !== 'string' || !allowedAlgorithms.includes(algorithm)) {
      throw new Error('Algorithm must be one of: md5, sha1, sha256, sha512');
    }

    const hash = createHash(algorithm).update(text).digest('hex');

    return {
      result: hash,
      meta: {
        algorithm,
        inputLength: text.length,
        outputLength: hash.length,
      },
    };
  } catch (error) {
    throw new Error(
      `Hash generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Password generation
export function generatePassword(options: {
  length?: number;
  useUppercase?: boolean;
  useLowercase?: boolean;
  useNumbers?: boolean;
  useSymbols?: boolean;
}): GeneratorResult {
  try {
    const length = Math.min(Math.max(options.length || 16, 4), 128);

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';

    if (options.useUppercase !== false) chars += uppercase;
    if (options.useLowercase !== false) chars += lowercase;
    if (options.useNumbers !== false) chars += numbers;
    if (options.useSymbols !== false) chars += symbols;

    if (chars.length === 0) {
      throw new Error('At least one character set must be selected');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomByte = randomBytes(1)[0];
      password += chars.charAt(randomByte % chars.length);
    }

    return {
      result: password,
      meta: {
        length,
        configuration: {
          uppercase: options.useUppercase !== false,
          lowercase: options.useLowercase !== false,
          numbers: options.useNumbers !== false,
          symbols: options.useSymbols !== false,
        },
      },
    };
  } catch (error) {
    throw new Error(
      `Password generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Lorem Ipsum generation
export function generateLoremIpsum(options: {
  type?: 'words' | 'sentences' | 'paragraphs';
  count?: number;
}): GeneratorResult {
  const words = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
  ];

  const type = options.type === undefined ? 'sentences' : options.type;
  const count = options.count === undefined ? 5 : options.count;

  if (!['words', 'sentences', 'paragraphs'].includes(type)) {
    throw new Error('Type must be one of: words, sentences, paragraphs');
  }

  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error('Quantity must be a whole number between 1 and 100');
  }

  let result = '';

  if (type === 'words') {
    for (let i = 0; i < count; i++) {
      result += words[Math.floor(Math.random() * words.length)];
      if (i < count - 1) result += ' ';
    }
  } else if (type === 'sentences') {
    for (let s = 0; s < count; s++) {
      const sentenceLength = Math.floor(Math.random() * 8) + 4;
      let sentence = '';

      for (let i = 0; i < sentenceLength; i++) {
        sentence += words[Math.floor(Math.random() * words.length)];
        if (i < sentenceLength - 1) sentence += ' ';
      }

      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
      result += sentence;
      if (s < count - 1) result += ' ';
    }
  } else {
    // paragraphs
    for (let p = 0; p < count; p++) {
      const sentenceCount = Math.floor(Math.random() * 4) + 3;

      for (let s = 0; s < sentenceCount; s++) {
        const sentenceLength = Math.floor(Math.random() * 10) + 5;
        let sentence = '';

        for (let i = 0; i < sentenceLength; i++) {
          sentence += words[Math.floor(Math.random() * words.length)];
          if (i < sentenceLength - 1) sentence += ' ';
        }

        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
        result += sentence + ' ';
      }

      if (p < count - 1) result += '\n\n';
    }
  }

  return {
    result: result.trim(),
    meta: {
      type,
      count,
    },
  };
}

// QR Code generation using the local qrcode package
export async function generateQRCode(
  text: string,
  size: string = '200'
): Promise<GeneratorResult> {
  try {
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Text cannot be empty');
    }

    const allowedSizes = ['150', '200', '300', '400'];

    if (typeof size !== 'string' || !allowedSizes.includes(size)) {
      throw new Error('QR code size must be 150, 200, 300, or 400 pixels');
    }

    // Avoid generating extremely large QR payloads.
    if (Buffer.byteLength(text, 'utf8') > 2000) {
      throw new Error('Text is too long for this QR code generator (maximum 2000 UTF-8 bytes)');
    }

    const QRCode = await import('qrcode');

    const dataUrl = await QRCode.toDataURL(text, {
      width: Number(size),
      margin: 2,
      errorCorrectionLevel: 'M',
      type: 'image/png',
    });

    return {
      result: dataUrl,
      meta: {
        textLength: text.length,
        size,
        format: 'png',
        mimeType: 'image/png',
      },
    };
  } catch (error) {
    throw new Error(
      `QR Code generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Color conversion - Hex to RGB
export function hexToRGB(hex: string): GeneratorResult {
  try {
    const trimmedHex = hex.trim();
    const cleanHex = trimmedHex.startsWith('#')
      ? trimmedHex.slice(1)
      : trimmedHex;

    if (!/^[0-9a-f]{6}$/i.test(cleanHex)) {
      throw new Error('Invalid hex color format');
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return {
      result: `rgb(${r}, ${g}, ${b})`,
      meta: {
        r,
        g,
        b,
        hex: `#${cleanHex.toUpperCase()}`,
      },
    };
  } catch (error) {
    throw new Error(
      `Color conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Color conversion - RGB to Hex
export function rgbToHex(rgb: string): GeneratorResult {
  try {
    const match = rgb.trim().match(
      /^(?:rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)|(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})|(\d{1,3})\s+(\d{1,3})\s+(\d{1,3}))$/i
    );

    if (!match) {
      throw new Error('Invalid RGB format. Use: rgb(r, g, b) or r g b');
    }

    const values = match.slice(1).filter((value) => value !== undefined);
    const [r, g, b] = values.map((value) => Number(value));

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('RGB values must be between 0 and 255');
    }

    const hex =
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase();

    return {
      result: hex,
      meta: {
        r,
        g,
        b,
        rgb: `rgb(${r}, ${g}, ${b})`,
      },
    };
  } catch (error) {
    throw new Error(
      `Color conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Slug generation
export function generateSlug(text: string): GeneratorResult {
  try {
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new Error('Text must contain alphanumeric characters');
    }

    return {
      result: slug,
      meta: {
        originalLength: text.length,
        slugLength: slug.length,
      },
    };
  } catch (error) {
    throw new Error(
      `Slug generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Timestamp generation
export function generateTimestamp(format: string = 'ms'): GeneratorResult {
  const now = Date.now();
  const seconds = Math.floor(now / 1000);

  let result = '';

  switch (format.toLowerCase()) {
    case 'ms':
      result = String(now);
      break;
    case 'seconds':
      result = String(seconds);
      break;
    case 'iso':
      result = new Date(now).toISOString();
      break;
    default:
      result = String(now);
  }

  return {
    result,
    meta: {
      format,
      ms: now,
      seconds,
      iso: new Date(now).toISOString(),
    },
  };
}

// Random string generation
export function generateRandomString(options: {
  length?: number;
  count?: number;
  charset?: 'alphanumeric' | 'alpha' | 'numeric' | 'hex';
}): GeneratorResult {
  try {
    const length = options.length === undefined ? 10 : options.length;
    const count = options.count === undefined ? 1 : options.count;
    const charset = options.charset === undefined ? 'alphanumeric' : options.charset;

    if (typeof length !== 'number' || !Number.isInteger(length) || length < 1 || length > 256) {
      throw new Error('String length must be a whole number between 1 and 256');
    }

    if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 100) {
      throw new Error('String count must be a whole number between 1 and 100');
    }

    const characterSets: Record<string, string> = {
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      numeric: '0123456789',
      hex: '0123456789abcdef',
    };

    if (typeof charset !== 'string' || !Object.prototype.hasOwnProperty.call(characterSets, charset)) {
      throw new Error('Character set must be one of: alphanumeric, alpha, numeric, hex');
    }

    const chars = characterSets[charset];
    const limit = 256 - (256 % chars.length);
    const results: string[] = [];

    for (let stringIndex = 0; stringIndex < count; stringIndex++) {
      let generated = '';

      while (generated.length < length) {
        const bytes = randomBytes(length - generated.length);

        for (const byte of bytes) {
          if (byte < limit) {
            generated += chars[byte % chars.length];
          }
        }
      }

      results.push(generated);
    }

    return {
      result: results.join('\n'),
      meta: {
        length,
        count,
        charset,
      },
    };
  } catch (error) {
    throw new Error(
      `Random string generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
