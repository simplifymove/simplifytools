// Converter Engine - handles format conversions and encoding/decoding
import { Buffer } from 'buffer';

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
    const decoded = Buffer.from(text, 'base64').toString('utf-8');
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
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(htmlUnescapes)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  return {
    result: decoded,
    meta: { 
      encodedLength: text.length,
      decodedLength: decoded.length 
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
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        break;

      case 'camelcase':
        result = text
          .toLowerCase()
          .split(/[\s_-]+/)
          .map((word, index) =>
            index === 0
              ? word
              : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join('');
        break;

      case 'pascalcase':
        result = text
          .toLowerCase()
          .split(/[\s_-]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;

      case 'snakecase':
        result = text
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();
        break;

      case 'kebabcase':
        result = text
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
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
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      return { result: '', meta: { rows: 0, columns: 0 } };
    }

    // Get all unique headers
    const headers = new Set<string>();
    data.forEach((obj) => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => headers.add(key));
      }
    });

    const headerArray = Array.from(headers);
    const csv: string[] = [];

    // Add header row
    csv.push(headerArray.map((h) => `"${h}"`).join(','));

    // Add data rows
    data.forEach((obj) => {
      const row = headerArray.map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) return '""';
        const strValue = String(value).replace(/"/g, '""');
        return `"${strValue}"`;
      });
      csv.push(row.join(','));
    });

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
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV is empty');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    const data: Record<string, string>[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const obj: Record<string, string> = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      data.push(obj);
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

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

// JSON to XML
export function jsonToXML(jsonText: string): ConverterResult {
  try {
    const data = JSON.parse(jsonText);
    const xml = buildXML(data, 'root');

    return {
      result: xml,
      meta: { format: 'xml' },
    };
  } catch (error) {
    throw new Error(
      `JSON to XML conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper to build XML from JSON
function buildXML(
  obj: any,
  rootName: string = 'root',
  indent: string = ''
): string {
  let xml = '';

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `<${rootName}>${String(obj)}</${rootName}>`;
  }

  if (Array.isArray(obj)) {
    xml += `${indent}<${rootName}>\n`;
    obj.forEach((item) => {
      xml += buildXML(item, 'item', indent + '  ');
    });
    xml += `${indent}</${rootName}>`;
  } else if (obj !== null && typeof obj === 'object') {
    xml += `${indent}<${rootName}>\n`;
    Object.entries(obj).forEach(([key, value]) => {
      xml += buildXML(value, key, indent + '  ');
    });
    xml += `${indent}</${rootName}>`;
  }

  return xml + '\n';
}

// XML to JSON
export function xmlToJSON(xmlText: string): ConverterResult {
  try {
    // Simple regex-based XML parser for Node.js environment
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

// Simple XML to object conversion using regex
function parseXMLToJSON(xmlText: string): any {
  const trimmed = xmlText.trim();

  // Remove XML declaration
  const withoutDeclaration = trimmed.replace(/<\?xml[^?]*\?>/, '').trim();

  // Find root element
  const rootMatch = withoutDeclaration.match(/<([^\s/>]+)([\s\S]*?)>([\s\S]*)<\/\1>/);

  if (!rootMatch) {
    return { error: 'Invalid XML structure' };
  }

  const [, rootName, , rootContent] = rootMatch;
  const result: any = {};
  result[rootName] = parseXMLContent(rootContent);

  return result;
}

// Parse XML content recursively
function parseXMLContent(content: string): any {
  const obj: any = {};
  const tagRegex = /<([^\s/>]+)([\s\S]*?)>([\s\S]*?)<\/\1>/g;
  let match;

  let lastIndex = 0;
  let textContent = '';

  while ((match = tagRegex.exec(content)) !== null) {
    // Check for text before this tag
    if (match.index > lastIndex) {
      const beforeText = content.substring(lastIndex, match.index).trim();
      if (beforeText && !beforeText.match(/^\s*$/)) {
        textContent += beforeText;
      }
    }

    const [, tagName, attrs, tagContent] = match;
    const childObj = parseXMLContent(tagContent);

    if (obj[tagName]) {
      if (!Array.isArray(obj[tagName])) {
        obj[tagName] = [obj[tagName]];
      }
      obj[tagName].push(Object.keys(childObj).length > 0 ? childObj : tagContent.trim());
    } else {
      obj[tagName] = Object.keys(childObj).length > 0 ? childObj : tagContent.trim();
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Check for remaining text
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      textContent += remainingText;
    }
  }

  if (Object.keys(obj).length === 0 && textContent) {
    return textContent;
  }

  return obj;
}

// JSON to YAML (simplified)
export function jsonToYAML(jsonText: string): ConverterResult {
  try {
    const data = JSON.parse(jsonText);
    const yaml = objectToYAML(data);

    return {
      result: yaml,
      meta: { format: 'yaml' },
    };
  } catch (error) {
    throw new Error(
      `JSON to YAML conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper to convert object to YAML
function objectToYAML(obj: any, indent: number = 0): string {
  const indentStr = ' '.repeat(indent);
  let yaml = '';

  if (obj === null) {
    return 'null';
  }

  if (typeof obj === 'string') {
    return `'${obj.replace(/'/g, "''")}'`;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      yaml += `${indentStr}- ${objectToYAML(item, 0)}\n`;
    });
  } else if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      yaml += `${indentStr}${key}: ${objectToYAML(value, indent + 2)}\n`;
    });
  }

  return yaml;
}

// YAML to JSON (simplified)
export function yamlToJSON(yamlText: string): ConverterResult {
  try {
    // Very basic YAML parser for key: value pairs
    const lines = yamlText.split('\n');
    const result: any = {};

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          result[key.trim()] = parseYAMLValue(value);
        }
      }
    });

    return {
      result: JSON.stringify(result, null, 2),
      meta: { format: 'json' },
    };
  } catch (error) {
    throw new Error(
      `YAML to JSON conversion error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper to parse YAML values
function parseYAMLValue(value: string): any {
  const v = value.trim();

  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (!isNaN(Number(v))) return Number(v);

  return v.replace(/^['"]|['"]$/g, '');
}

// Slug generation
export function generateSlug(text: string): ConverterResult {
  try {
    const slug = text
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < text.length; i++) {
      bits += text.charCodeAt(i).toString(2).padStart(8, '0');
    }
    bits = bits.padEnd(Math.ceil(bits.length / 5) * 5, '0');
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
      result += chars.charAt(parseInt(bits.substr(i, 5), 2));
    }
    return { result, meta: { originalLength: text.length, encodedLength: result.length } };
  } catch (error) {
    throw new Error(`Base32 encoding error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Base32 decoding
export function decodeBase32(text: string): ConverterResult {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < text.length; i++) {
      bits += chars.indexOf(text[i]).toString(2).padStart(5, '0');
    }
    let result = '';
    for (let i = 0; i < bits.length - 7; i += 8) {
      result += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
    }
    return { result, meta: { encodedLength: text.length, decodedLength: result.length } };
  } catch (error) {
    throw new Error(`Base32 decoding error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Markdown to HTML (basic conversion)
export function markdownToHTML(text: string): ConverterResult {
  try {
    let html = text
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Code blocks
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return { result: html, meta: { originalLength: text.length, htmlLength: html.length } };
  } catch (error) {
    throw new Error(`Markdown conversion error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Escape/Unescape special characters
export function escapeSpecialChars(text: string, type: string, mode: string): ConverterResult {
  try {
    let result = text;
    
    if (mode === 'escape') {
      if (type === 'javascript') {
        result = text
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      } else if (type === 'json') {
        result = JSON.stringify(text);
      }
    } else {
      if (type === 'javascript') {
        result = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else if (type === 'json') {
        try {
          result = JSON.parse('"' + text + '"');
        } catch {
          result = text;
        }
      }
    }
    
    return { result, meta: { originalLength: text.length, resultLength: result.length, type, mode } };
  } catch (error) {
    throw new Error(`Escape/Unescape error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Number base converter
export function convertNumberBase(text: string, fromBase: string, toBase: string): ConverterResult {
  try {
    const value = text.trim();
    let decimal: number;
    
    // Convert from source base to decimal
    if (fromBase === 'binary') decimal = parseInt(value, 2);
    else if (fromBase === 'octal') decimal = parseInt(value, 8);
    else if (fromBase === 'decimal') decimal = parseInt(value, 10);
    else if (fromBase === 'hex') decimal = parseInt(value, 16);
    else throw new Error('Invalid source base');
    
    // Convert from decimal to target base
    let result: string;
    if (toBase === 'binary') result = '0b' + decimal.toString(2);
    else if (toBase === 'octal') result = '0o' + decimal.toString(8);
    else if (toBase === 'decimal') result = decimal.toString(10);
    else if (toBase === 'hex') result = '0x' + decimal.toString(16);
    else throw new Error('Invalid target base');
    
    return { result, meta: { fromBase, toBase, decimal, originalValue: value } };
  } catch (error) {
    throw new Error(`Number base conversion error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Temperature converter
export function convertTemperature(value: string, fromUnit: string, toUnit: string): ConverterResult {
  try {
    const temp = parseFloat(value);
    if (isNaN(temp)) throw new Error('Invalid temperature value');
    
    let celsius: number;
    
    // Convert to Celsius
    if (fromUnit === 'celsius') celsius = temp;
    else if (fromUnit === 'fahrenheit') celsius = (temp - 32) * (5 / 9);
    else if (fromUnit === 'kelvin') celsius = temp - 273.15;
    else throw new Error('Invalid source unit');
    
    // Convert from Celsius to target
    let result: number;
    if (toUnit === 'celsius') result = celsius;
    else if (toUnit === 'fahrenheit') result = celsius * (9 / 5) + 32;
    else if (toUnit === 'kelvin') result = celsius + 273.15;
    else throw new Error('Invalid target unit');
    
    return {
      result: result.toFixed(2),
      meta: { fromUnit, toUnit, originalValue: temp, convertedValue: result },
    };
  } catch (error) {
    throw new Error(`Temperature conversion error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Unix timestamp converter
export function convertUnixTimestamp(input: string, direction: string): ConverterResult {
  try {
    let result: string;
    let meta: Record<string, any> = { direction };
    
    if (direction === 'toDate') {
      const timestamp = parseInt(input);
      if (isNaN(timestamp)) throw new Error('Invalid timestamp');
      const date = new Date(timestamp * 1000);
      result = date.toISOString();
      meta.timestamp = timestamp;
    } else {
      const date = new Date(input);
      if (isNaN(date.getTime())) throw new Error('Invalid date format');
      const timestamp = Math.floor(date.getTime() / 1000);
      result = timestamp.toString();
      meta.timestamp = timestamp;
    }
    
    return { result, meta };
  } catch (error) {
    throw new Error(`Timestamp conversion error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
