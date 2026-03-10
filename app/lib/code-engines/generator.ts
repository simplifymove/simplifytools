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
    if (count < 1 || count > 1000) {
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

  const type = options.type || 'paragraphs';
  const count = Math.max(1, Math.min(options.count || 5, 100));

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

// QR Code generation (returns SVG or data string for now)
export function generateQRCode(text: string, size: string = '300'): GeneratorResult {
  try {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    // Since we're working in Node.js environment, return a placeholder
    // In a browser environment, this would use qrcode library
    const encoded = encodeURIComponent(text);
    const qrSize = size || '300';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encoded}`;

    return {
      result: qrCodeUrl,
      meta: {
        textLength: text.length,
        size: qrSize,
        format: 'url',
        htmlEmbed: `<img src="${qrCodeUrl}" alt="QR Code" />`,
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
    const cleanHex = hex.replace(/[#\s]/g, '');

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
    const match = rgb.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);

    if (!match) {
      throw new Error('Invalid RGB format. Use: rgb(r, g, b) or r g b');
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

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
  charset?: 'alphanumeric' | 'alpha' | 'numeric' | 'hex';
}): GeneratorResult {
  try {
    const length = Math.min(Math.max(options.length || 16, 1), 256);
    const charset = options.charset || 'alphanumeric';

    let chars = '';

    switch (charset) {
      case 'alpha':
        chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        break;
      case 'numeric':
        chars = '0123456789';
        break;
      case 'hex':
        chars = '0123456789abcdef';
        break;
      default:
        chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    let result = '';
    const randomBytesArray = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomBytesArray[i] % chars.length);
    }

    return {
      result,
      meta: {
        length,
        charset,
      },
    };
  } catch (error) {
    throw new Error(
      `Random string generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
