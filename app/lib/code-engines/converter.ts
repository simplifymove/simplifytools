// Converter Engine - handles format conversions and encoding/decoding
import { Buffer } from 'buffer';
import * as sax from 'sax';
import * as yaml from 'js-yaml';
import { decode as decodeHtmlEntities } from 'html-entities';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export interface ConverterResult {
  result: string;
  meta?: Record<string, any>;
}

// Base64 encoding
export function encodeBase64(text: string): ConverterResult {
  try {
    const encoded = Buffer.from(text, 'utf-8').toString('base64');
    return {
      result: encoded,
      meta: { 
        originalLength: text.length,
        encodedLength: encoded.length 
      },
    };
  } catch (error) {
    throw new Error(
      `Base64 encoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Base64 decoding
export function decodeBase64(text: string): ConverterResult {
  try {
    // Accept ordinary whitespace and optional omitted padding.
    const normalized = text.replace(/\s+/g, '');

    if (!normalized) {
      throw new Error('Base64 input is empty');
    }

    // Standard Base64 alphabet only; Base64URL is a separate format.
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
      throw new Error('Invalid Base64 characters or padding');
    }

    const withoutPadding = normalized.replace(/=+$/, '');

    if (withoutPadding.length % 4 === 1) {
      throw new Error('Invalid Base64 length');
    }

    const requiredPadding =
      (4 - (withoutPadding.length % 4)) % 4;

    const expected = withoutPadding + '='.repeat(requiredPadding);

    if (normalized !== withoutPadding && normalized !== expected) {
      throw new Error('Invalid Base64 padding');
    }

    const bytes = Buffer.from(expected, 'base64');

    // Reject non-canonical encodings instead of silently discarding bits.
    if (bytes.toString('base64') !== expected) {
      throw new Error('Invalid Base64 encoding');
    }

    // Decode UTF-8 strictly rather than replacing malformed bytes with U+FFFD.
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    return {
      result: decoded,
      meta: {
        encodedLength: text.length,
        decodedLength: decoded.length
      },
    };
  } catch (error) {
    throw new Error(
      `Base64 decoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// URL encoding
export function encodeURL(text: string): ConverterResult {
  try {
    const encoded = encodeURIComponent(text);
    return {
      result: encoded,
      meta: { 
        originalLength: text.length,
        encodedLength: encoded.length 
      },
    };
  } catch (error) {
    throw new Error(
      `URL encoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// URL decoding
export function decodeURL(text: string): ConverterResult {
  try {
    const decoded = decodeURIComponent(text);
    return {
      result: decoded,
      meta: { 
        encodedLength: text.length,
        decodedLength: decoded.length 
      },
    };
  } catch (error) {
    throw new Error(
      `URL decoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// HTML encoding
export function encodeHTML(text: string): ConverterResult {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  const encoded = text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  return {
    result: encoded,
    meta: { 
      originalLength: text.length,
      encodedLength: encoded.length 
    },
  };
}

// HTML decoding
export function decodeHTML(text: string): ConverterResult {
  const decoded = decodeHtmlEntities(text, { level: 'html5' });

  return {
    result: decoded,
    meta: {
      encodedLength: text.length,
      decodedLength: decoded.length,
    },
  };
}

// Case conversion
export function convertCase(
  text: string,
  caseType: string
): ConverterResult {
  try {
    let result: string;

    const words = () =>
      text
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .trim()
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase());

    switch (caseType.toLowerCase()) {
      case 'uppercase':
        result = text.toUpperCase();
        break;

      case 'lowercase':
        result = text.toLowerCase();
        break;

      case 'titlecase':
        result = text
          .toLowerCase()
          .replace(/(^|[\s_-])([^\s_-])/g, (_, separator, letter: string) =>
            separator + letter.toUpperCase()
          );
        break;

      case 'camelcase':
        result = words()
          .map((word, index) =>
            index === 0
              ? word
              : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join('');
        break;

      case 'pascalcase':
        result = words()
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;

      case 'snakecase':
        result = words().join('_');
        break;

      case 'kebabcase':
        result = words().join('-');
        break;

      default:
        throw new Error(`Unknown case type: ${caseType}`);
    }

    return {
      result,
      meta: { caseType },
    };
  } catch (error) {
    throw new Error(
      `Case conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// JSON to CSV
export function jsonToCSV(jsonText: string): ConverterResult {
  try {
    const data: unknown = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      return { result: '', meta: { rows: 0, columns: 0 } };
    }

    const headers = new Set<string>();

    for (const [index, row] of data.entries()) {
      if (
        typeof row !== 'object' ||
        row === null ||
        Array.isArray(row)
      ) {
        throw new Error(
          `Row ${index + 1} must be a JSON object`
        );
      }

      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'object' && value !== null) {
          throw new Error(
            `Row ${index + 1}, field "${key}" contains a nested object or array. Only flat JSON objects are supported.`
          );
        }

        headers.add(key);
      }
    }

    const headerArray = Array.from(headers);

    if (headerArray.length === 0) {
      return {
        result: '',
        meta: {
          rows: data.length,
          columns: 0,
        },
      };
    }

    const escapeCSV = (value: string): string =>
      `"${value.replace(/"/g, '""')}"`;

    const csv: string[] = [
      headerArray.map(escapeCSV).join(','),
    ];

    for (const row of data as Record<string, unknown>[]) {
      const fields = headerArray.map((header) => {
        const value = row[header];

        if (value === null || value === undefined) {
          return escapeCSV('');
        }

        return escapeCSV(String(value));
      });

      csv.push(fields.join(','));
    }

    return {
      result: csv.join('\n'),
      meta: {
        rows: data.length,
        columns: headerArray.length,
      },
    };
  } catch (error) {
    throw new Error(
      `JSON to CSV conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// CSV to JSON
export function csvToJSON(csvText: string): ConverterResult {
  try {
    const records = parseCSVRecords(csvText);
    if (records.length === 0) {
      throw new Error('CSV is empty');
    }

    const headers = records[0];
    const seenHeaders = new Set<string>();
    for (const header of headers) {
      if (header.trim() === '') throw new Error('CSV headers must not be blank');
      if (seenHeaders.has(header)) throw new Error(`Duplicate CSV header: ${JSON.stringify(header)}`);
      seenHeaders.add(header);
    }
    const data: Record<string, string>[] = [];

    for (let i = 1; i < records.length; i++) {
      const values = records[i];
      if (values.length !== headers.length) {
        throw new Error(`CSV record ${i + 1} has ${values.length} fields; expected ${headers.length}`);
      }
      // Define own properties safely, including a literal __proto__ header.
      data.push(Object.fromEntries(headers.map((header, index) => [header, values[index]])));
    }

    return {
      result: JSON.stringify(data, null, 2),
      meta: {
        rows: data.length,
        columns: headers.length,
      },
    };
  } catch (error) {
    throw new Error(
      `CSV to JSON conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Skip only completely empty physical lines outside quotes. Do not trim fields.
function parseCSVRecords(text: string): string[][] {
  const records: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let state: 'start' | 'unquoted' | 'quoted' | 'closed' = 'start';
  let recordStarted = false;

  const finishRecord = () => {
    if (recordStarted) records.push([...fields, field]);
    fields = [];
    field = '';
    state = 'start';
    recordStarted = false;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (state === 'quoted') {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          state = 'closed';
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      finishRecord();
    } else if (char === ',') {
      fields.push(field);
      field = '';
      state = 'start';
      recordStarted = true;
    } else if (char === '"') {
      if (state !== 'start') throw new Error(`Unexpected quote at character ${i + 1}`);
      state = 'quoted';
      recordStarted = true;
    } else {
      if (state === 'closed') throw new Error(`Unexpected character after closing quote at character ${i + 1}`);
      field += char;
      state = 'unquoted';
      recordStarted = true;
    }
  }

  if (state === 'quoted') throw new Error('Unclosed quoted CSV field');
  finishRecord();
  return records;
}

// JSON to XML
export function jsonToXML(jsonText: string): ConverterResult {
  try {
    const data = JSON.parse(jsonText);
    const xml = buildXML(data, 'root');

    return {
      result: xml + '\n',
      meta: { format: 'xml' },
    };
  } catch (error) {
    throw new Error(
      `JSON to XML conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Validate XML 1.0 characters, including supplementary Unicode characters.
function escapeXMLText(value: string): string {
  for (const character of value) {
    const code = character.codePointAt(0)!;
    const allowed =
      code === 0x9 ||
      code === 0xA ||
      code === 0xD ||
      (code >= 0x20 && code <= 0xD7FF) ||
      (code >= 0xE000 && code <= 0xFFFD) ||
      (code >= 0x10000 && code <= 0x10FFFF);

    if (!allowed) {
      throw new Error('Text contains a character not allowed in XML 1.0');
    }
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function validateXMLElementName(name: string): void {
  // Support common ASCII XML element names without namespace prefixes.
  // Reject unsupported names rather than generating malformed XML.
  if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(name)) {
    throw new Error(`Invalid or unsupported XML element name: ${JSON.stringify(name)}`);
  }

  if (/^xml/i.test(name)) {
    throw new Error(`Reserved XML element name: ${JSON.stringify(name)}`);
  }
}

function buildXML(
  value: unknown,
  elementName: string,
  indent: string = ''
): string {
  validateXMLElementName(elementName);

  if (value === null) {
    return `${indent}<${elementName}/>`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${indent}<${elementName}/>`;
    }

    const children = value.map((item) =>
      buildXML(item, 'item', indent + '  ')
    );

    return `${indent}<${elementName}>\n${children.join('\n')}\n${indent}</${elementName}>`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return `${indent}<${elementName}/>`;
    }

    const children = entries.map(([key, child]) =>
      buildXML(child, key, indent + '  ')
    );

    return `${indent}<${elementName}>\n${children.join('\n')}\n${indent}</${elementName}>`;
  }

  const text = escapeXMLText(String(value));
  return `${indent}<${elementName}>${text}</${elementName}>`;
}

// XML to JSON
export function xmlToJSON(xmlText: string): ConverterResult {
  try {
    const json = parseXMLToJSON(xmlText);

    return {
      result: JSON.stringify(json, null, 2),
      meta: { format: 'json' },
    };
  } catch (error) {
    throw new Error(
      `XML to JSON conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

interface XMLJSONNode {
  name: string;
  attributes: Record<string, string>;
  children: Array<{ name: string; value: unknown }>;
  text: string;
}

function parseXMLToJSON(xmlText: string): Record<string, unknown> {
  if (!xmlText.trim()) {
    throw new Error('XML input is empty');
  }

  // SAX can accept some characters forbidden by XML 1.0.
  for (const character of xmlText) {
    const code = character.codePointAt(0)!;

    const allowed =
      code === 0x09 ||
      code === 0x0A ||
      code === 0x0D ||
      (code >= 0x20 && code <= 0xD7FF) ||
      (code >= 0xE000 && code <= 0xFFFD) ||
      (code >= 0x10000 && code <= 0x10FFFF);

    if (!allowed) {
      throw new Error(
        `Character U+${code.toString(16).toUpperCase().padStart(4, '0')} is not permitted in XML 1.0`
      );
    }
  }

  const parser = sax.parser(true, {
    trim: false,
    normalize: false,
    xmlns: false,
  });

  const stack: XMLJSONNode[] = [];
  const result: Record<string, unknown> = Object.create(null);
  let rootCount = 0;

  parser.onopentag = (tag) => {
    if (stack.length === 0) {
      rootCount++;
      if (rootCount > 1) {
        throw new Error('XML must contain exactly one root element');
      }
    }

    const attributes: Record<string, string> = Object.create(null);

    for (const [key, value] of Object.entries(tag.attributes)) {
      attributes[key] = String(value);
    }

    stack.push({
      name: tag.name,
      attributes,
      children: [],
      text: '',
    });
  };

  parser.ontext = (text) => {
    if (stack.length > 0) {
      stack[stack.length - 1].text += text;
    }
  };

  parser.oncdata = (text) => {
    if (stack.length > 0) {
      stack[stack.length - 1].text += text;
    }
  };

  parser.onclosetag = () => {
    const node = stack.pop();

    if (!node) {
      throw new Error('Unexpected XML closing element');
    }

    const hasAttributes = Object.keys(node.attributes).length > 0;
    const hasChildren = node.children.length > 0;
    const text = node.text.trim();

    let value: unknown;

    if (!hasAttributes && !hasChildren) {
      value = text;
    } else {
      const object: Record<string, unknown> = Object.create(null);

      if (hasAttributes) {
        object['$'] = node.attributes;
      }

      for (const child of node.children) {
        if (
          (child.name === '$' && hasAttributes) ||
          (child.name === '_' && text)
        ) {
          throw new Error(
            `XML element name "${child.name}" conflicts with the JSON attribute/text representation`
          );
        }

        if (Object.prototype.hasOwnProperty.call(object, child.name)) {
          const previous = object[child.name];

          if (Array.isArray(previous)) {
            previous.push(child.value);
          } else {
            object[child.name] = [previous, child.value];
          }
        } else {
          object[child.name] = child.value;
        }
      }

      if (text) {
        object['_'] = text;
      }

      value = object;
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push({
        name: node.name,
        value,
      });
    } else {
      result[node.name] = value;
    }
  };

  parser.write(xmlText).close();

  if (rootCount !== 1 || stack.length !== 0) {
    throw new Error('XML must contain exactly one complete root element');
  }

  return result;
}

// JSON to YAML
export function jsonToYAML(jsonText: string): ConverterResult {
  try {
    const data = JSON.parse(jsonText);

    const result = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    return {
      result,
      meta: { format: 'yaml' },
    };
  } catch (error) {
    throw new Error(
      `JSON to YAML conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// YAML to JSON
export function yamlToJSON(yamlText: string): ConverterResult {
  try {
    if (!yamlText.trim()) {
      throw new Error('Enter a YAML document to convert.');
    }

    const data = yaml.load(yamlText);

    if (data === undefined) {
      throw new Error('Enter a YAML document to convert.');
    }

    return {
      result: JSON.stringify(data, null, 2),
      meta: { format: 'json' },
    };
  } catch (error) {
    throw new Error(
      `YAML to JSON conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Slug generation
export function generateSlug(text: string): ConverterResult {
  try {
    const slug = text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores/hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    return {
      result: slug,
      meta: { originalLength: text.length, slugLength: slug.length },
    };
  } catch (error) {
    throw new Error(
      `Slug generation error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Base32 encoding
export function encodeBase32(text: string): ConverterResult {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = Buffer.from(text, 'utf-8');

    let result = '';
    let buffer = 0;
    let bitCount = 0;

    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bitCount += 8;

      while (bitCount >= 5) {
        bitCount -= 5;
        result += alphabet[(buffer >>> bitCount) & 31];
      }

      buffer &= (1 << bitCount) - 1;
    }

    if (bitCount > 0) {
      result += alphabet[(buffer << (5 - bitCount)) & 31];
    }

    // RFC 4648 Base32 uses eight-character blocks with '=' padding.
    result = result.padEnd(Math.ceil(result.length / 8) * 8, '=');

    return {
      result,
      meta: {
        originalLength: text.length,
        encodedLength: result.length
      },
    };
  } catch (error) {
    throw new Error(
      `Base32 encoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Base32 decoding
export function decodeBase32(text: string): ConverterResult {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const normalized = text.trim();

    if (!normalized) {
      throw new Error('Base32 input is empty');
    }

    if (!/^[A-Z2-7]*={0,6}$/.test(normalized)) {
      throw new Error('Invalid Base32 characters or padding');
    }

    const unpadded = normalized.replace(/=+$/, '');
    const remainder = unpadded.length % 8;

    const allowedRemainders = [0, 2, 4, 5, 7];

    if (!allowedRemainders.includes(remainder)) {
      throw new Error('Invalid Base32 length');
    }

    const requiredPadding = (8 - remainder) % 8;
    const canonical = unpadded + '='.repeat(requiredPadding);

    if (normalized !== unpadded && normalized !== canonical) {
      throw new Error('Invalid Base32 padding');
    }

    const bytes: number[] = [];
    let buffer = 0;
    let bitCount = 0;

    for (const char of unpadded) {
      const value = alphabet.indexOf(char);

      buffer = (buffer << 5) | value;
      bitCount += 5;

      if (bitCount >= 8) {
        bitCount -= 8;
        bytes.push((buffer >>> bitCount) & 0xff);
        buffer &= (1 << bitCount) - 1;
      }
    }

    if (buffer !== 0) {
      throw new Error('Invalid Base32 trailing bits');
    }

    const decoded = new TextDecoder('utf-8', { fatal: true })
      .decode(Uint8Array.from(bytes));

    return {
      result: decoded,
      meta: {
        encodedLength: text.length,
        decodedLength: decoded.length
      },
    };
  } catch (error) {
    throw new Error(
      `Base32 decoding error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Markdown to HTML using a Markdown parser and sanitized output.
export function markdownToHTML(text: string): ConverterResult {
  try {
    const parsed = marked.parse(text, {
      async: false,
      gfm: true,
      breaks: false,
    });

    if (typeof parsed !== 'string') {
      throw new Error('Unexpected asynchronous Markdown result');
    }

    const html = sanitizeHtml(parsed, {
      allowedTags: [
        'p', 'br', 'hr',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'del', 's',
        'blockquote', 'pre', 'code',
        'ul', 'ol', 'li',
        'a',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      allowedAttributes: {
        a: ['href', 'title'],
        code: ['class'],
        th: ['align'],
        td: ['align']
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href'],
      allowProtocolRelative: false,
      disallowedTagsMode: 'discard',
      parser: {
        decodeEntities: false
      }
    });

    return {
      result: html,
      meta: {
        originalLength: text.length,
        htmlLength: html.length
      }
    };
  } catch (error) {
    throw new Error(
      `Markdown conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Escape/Unescape special characters
export function escapeSpecialChars(text: string, type: string, mode: string): ConverterResult {
  try {
    const supportedTypes = ['javascript', 'json', 'url', 'html'];
    if (!supportedTypes.includes(type)) {
      throw new Error('Unsupported escape type');
    }
    if (mode !== 'escape' && mode !== 'unescape') {
      throw new Error('Unsupported escape mode');
    }

    let result: string;

    if (type === 'javascript') {
      if (mode === 'escape') {
        result = text
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\x08/g, '\\b')
          .replace(/\f/g, '\\f');
      } else {
        result = text.replace(
          /\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\\'"nrtbfv0])/g,
          (match, sequence: string) => {
            const escapes: Record<string, string> = {
              '\\': '\\',
              "'": "'",
              '"': '"',
              n: '\n',
              r: '\r',
              t: '\t',
              b: '\b',
              f: '\f',
              v: '\v',
              '0': '\0',
            };
            if (sequence.startsWith('u') || sequence.startsWith('x')) {
              return String.fromCharCode(parseInt(sequence.slice(1), 16));
            }
            return escapes[sequence] ?? match;
          }
        );
      }
    } else if (type === 'json') {
      if (mode === 'escape') {
        result = JSON.stringify(text);
      } else {
        const trimmed = text.trim();
        const jsonLiteral = trimmed.startsWith('"')
          ? trimmed
          : '"' + text + '"';

        const parsed: unknown = JSON.parse(jsonLiteral);
        if (typeof parsed !== 'string') {
          throw new Error('Input must represent a JSON string');
        }
        result = parsed;
      }
    } else if (type === 'url') {
      result = mode === 'escape'
        ? encodeURIComponent(text)
        : decodeURIComponent(text);
    } else {
      if (mode === 'escape') {
        result = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      } else {
        result = decodeHtmlEntities(text, { level: 'html5' });
      }
    }

    return {
      result,
      meta: {
        originalLength: text.length,
        resultLength: result.length,
        type,
        mode,
      },
    };
  } catch (error) {
    throw new Error(
      `Escape/Unescape error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Number base converter
export function convertNumberBase(text: string, fromBase: string, toBase: string): ConverterResult {
  try {
    const bases: Record<string, number> = {
      binary: 2,
      octal: 8,
      decimal: 10,
      hex: 16,
    };

    const sourceBase = bases[fromBase];
    const targetBase = bases[toBase];

    if (!sourceBase) throw new Error('Invalid source base');
    if (!targetBase) throw new Error('Invalid target base');

    const value = text.trim();

    if (!value) throw new Error('Enter an integer to convert');

    const negative = value.startsWith('-');
    const unsigned = negative || value.startsWith('+')
      ? value.slice(1)
      : value;

    const patterns: Record<string, RegExp> = {
      binary: /^(?:0[bB])?[01]+$/,
      octal: /^(?:0[oO])?[0-7]+$/,
      decimal: /^[0-9]+$/,
      hex: /^(?:0[xX])?[0-9a-fA-F]+$/,
    };

    if (!patterns[fromBase].test(unsigned)) {
      throw new Error(`Invalid ${fromBase} integer`);
    }

    const digits = unsigned.replace(
      sourceBase === 2 ? /^0[bB]/ :
      sourceBase === 8 ? /^0[oO]/ :
      sourceBase === 16 ? /^0[xX]/ :
      /^(?!) /,
      ''
    );

    let decimal = BigInt(0);

    for (const character of digits.toLowerCase()) {
      const digit = parseInt(character, 16);

      if (digit >= sourceBase) {
        throw new Error(`Invalid ${fromBase} digit`);
      }

      decimal = decimal * BigInt(sourceBase) + BigInt(digit);
    }

    if (negative) decimal = -decimal;

    const magnitude = decimal < BigInt(0) ? -decimal : decimal;
    const sign = decimal < BigInt(0) ? '-' : '';

    const prefixes: Record<string, string> = {
      binary: '0b',
      octal: '0o',
      decimal: '',
      hex: '0x',
    };

    const result = sign + prefixes[toBase] + magnitude.toString(targetBase);

    return {
      result,
      meta: {
        fromBase,
        toBase,
        decimal: decimal.toString(10),
        originalValue: value,
      },
    };
  } catch (error) {
    throw new Error(
      `Number base conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Temperature converter
export function convertTemperature(value: string, fromUnit: string, toUnit: string): ConverterResult {
  try {
    const supportedUnits = ['celsius', 'fahrenheit', 'kelvin'];

    if (!supportedUnits.includes(fromUnit)) {
      throw new Error('Invalid source unit');
    }

    if (!supportedUnits.includes(toUnit)) {
      throw new Error('Invalid target unit');
    }

    const input = value.trim();

    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(input)) {
      throw new Error('Enter a valid numeric temperature');
    }

    const temp = Number(input);

    if (!Number.isFinite(temp)) {
      throw new Error('Temperature must be a finite number');
    }

    // Validate against absolute zero in the selected input unit.
    const absoluteZero: Record<string, number> = {
      celsius: -273.15,
      fahrenheit: -459.67,
      kelvin: 0,
    };

    if (temp < absoluteZero[fromUnit]) {
      throw new Error('Temperature cannot be below absolute zero');
    }

    let celsius: number;

    if (fromUnit === 'celsius') celsius = temp;
    else if (fromUnit === 'fahrenheit') celsius = (temp - 32) * (5 / 9);
    else celsius = temp - 273.15;

    let result: number;

    if (toUnit === 'celsius') result = celsius;
    else if (toUnit === 'fahrenheit') result = celsius * (9 / 5) + 32;
    else result = celsius + 273.15;

    if (!Number.isFinite(result)) {
      throw new Error('Converted temperature is outside the supported numeric range');
    }

    // Avoid displaying -0.00 after floating-point rounding.
    const formatted = result.toFixed(2);
    const normalized = formatted === '-0.00' ? '0.00' : formatted;

    return {
      result: normalized,
      meta: {
        fromUnit,
        toUnit,
        originalValue: temp,
        convertedValue: result,
      },
    };
  } catch (error) {
    throw new Error(
      `Temperature conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Unix timestamp converter
export function convertUnixTimestamp(input: string, direction: string): ConverterResult {
  try {
    const value = input.trim();
    const meta: Record<string, any> = { direction };

    if (direction === 'toDate') {
      if (!/^[+-]?\d+$/.test(value)) {
        throw new Error('Enter a valid integer Unix timestamp in seconds');
      }

      const seconds = Number(value);

      if (!Number.isSafeInteger(seconds)) {
        throw new Error('Timestamp is outside the supported integer range');
      }

      const milliseconds = seconds * 1000;
      const date = new Date(milliseconds);

      if (!Number.isFinite(milliseconds) || !Number.isFinite(date.getTime())) {
        throw new Error('Timestamp is outside the supported date range');
      }

      meta.timestamp = seconds;

      return {
        result: date.toISOString(),
        meta,
      };
    }

    if (direction === 'toTimestamp') {
      const pattern =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/;

      const match = pattern.exec(value);

      if (!match) {
        throw new Error('Enter an ISO 8601 date/time with a timezone');
      }

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const second = Number(match[6]);
      const fraction = Number((match[7] || '').padEnd(3, '0'));
      const zone = match[8];

      const leapYear =
        year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

      const daysInMonth = [
        31, leapYear ? 29 : 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31,
      ];

      if (
        month < 1 || month > 12 ||
        day < 1 || day > daysInMonth[month - 1] ||
        hour > 23 || minute > 59 || second > 59
      ) {
        throw new Error('Invalid calendar date or time');
      }

      let offsetMinutes = 0;

      if (zone !== 'Z') {
        const offsetHours = Number(match[10]);
        const offsetMins = Number(match[11]);

        if (offsetHours > 23 || offsetMins > 59) {
          throw new Error('Invalid timezone offset');
        }

        const sign = match[9] === '+' ? 1 : -1;
        offsetMinutes = sign * (offsetHours * 60 + offsetMins);
      }

      const utcDate = new Date(0);
      utcDate.setUTCFullYear(year, month - 1, day);
      utcDate.setUTCHours(hour, minute, second, fraction);

      const milliseconds =
        utcDate.getTime() - offsetMinutes * 60_000;

      if (!Number.isFinite(milliseconds)) {
        throw new Error('Date is outside the supported range');
      }

      const timestamp = Math.floor(milliseconds / 1000);

      meta.timestamp = timestamp;

      return {
        result: timestamp.toString(),
        meta,
      };
    }

    throw new Error('Invalid conversion direction');
  } catch (error) {
    throw new Error(
      `Timestamp conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

