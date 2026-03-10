// Shared Code Tools Registry
// All tools are defined here with their configuration

export type InputMode = 'text' | 'textarea' | 'none' | 'dual';
export type OutputMode = 'text' | 'textarea' | 'validation' | 'preview';
export type EngineType = 'formatter' | 'converter' | 'validator' | 'generator';

export interface CodeTool {
  id: string;
  title: string;
  description: string;
  engine: EngineType;
  inputMode: InputMode;
  outputMode: OutputMode;
  icon: string;
  options: ToolOption[];
}

export interface ToolOption {
  name: string;
  label: string;
  type: 'select' | 'number' | 'checkbox' | 'text';
  default?: string | number | boolean;
  choices?: { value: string; label: string }[];
}

export const codeTools: Record<string, CodeTool> = {
  // ==================== FORMATTER ENGINE ====================
  'code-minifier': {
    id: 'code-minifier',
    title: '📦 Code Minifier',
    description: 'Minify code to reduce file size',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Zap',
    options: [
      {
        name: 'language',
        label: 'Language',
        type: 'select',
        default: 'javascript',
        choices: [
          { value: 'javascript', label: 'JavaScript' },
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
          { value: 'json', label: 'JSON' },
          { value: 'xml', label: 'XML' },
        ],
      },
    ],
  },

  'code-beautifier': {
    id: 'code-beautifier',
    title: '✨ Code Beautifier',
    description: 'Format and beautify code',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Sparkles',
    options: [
      {
        name: 'language',
        label: 'Language',
        type: 'select',
        default: 'javascript',
        choices: [
          { value: 'javascript', label: 'JavaScript' },
          { value: 'html', label: 'HTML' },
          { value: 'css', label: 'CSS' },
          { value: 'json', label: 'JSON' },
          { value: 'xml', label: 'XML' },
          { value: 'sql', label: 'SQL' },
        ],
      },
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  'json-formatter': {
    id: 'json-formatter',
    title: '{ } JSON Formatter',
    description: 'Format and validate JSON',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Braces',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  'html-formatter': {
    id: 'html-formatter',
    title: '🏷️ HTML Formatter',
    description: 'Format and beautify HTML code',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Code2',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  'html-minifier': {
    id: 'html-minifier',
    title: '📦 HTML Minifier',
    description: 'Minify HTML for web performance',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Zap',
    options: [],
  },

  'css-formatter': {
    id: 'css-formatter',
    title: '🎨 CSS Formatter',
    description: 'Format and beautify CSS code',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Palette',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  'css-minifier': {
    id: 'css-minifier',
    title: '📦 CSS Minifier',
    description: 'Minify CSS for web performance',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Zap',
    options: [],
  },

  'xml-formatter': {
    id: 'xml-formatter',
    title: '📋 XML Formatter',
    description: 'Format and beautify XML code',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'FileText',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  'xml-minifier': {
    id: 'xml-minifier',
    title: '📦 XML Minifier',
    description: 'Minify XML to reduce file size',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Zap',
    options: [],
  },

  'sql-formatter': {
    id: 'sql-formatter',
    title: '💾 SQL Formatter',
    description: 'Format SQL queries for readability',
    engine: 'formatter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Database',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        default: 2,
      },
    ],
  },

  // ==================== CONVERTER ENGINE ====================
  'base64-encode': {
    id: 'base64-encode',
    title: '🔒 Base64 Encode',
    description: 'Encode text to Base64',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Lock',
    options: [],
  },

  'base64-decode': {
    id: 'base64-decode',
    title: '🔓 Base64 Decode',
    description: 'Decode Base64 to text',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Unlock',
    options: [],
  },

  'url-encode': {
    id: 'url-encode',
    title: '🔗 URL Encode',
    description: 'Encode text for URLs',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Link',
    options: [],
  },

  'url-decode': {
    id: 'url-decode',
    title: '🔗 URL Decode',
    description: 'Decode URL-encoded text',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Link2',
    options: [],
  },

  'case-converter': {
    id: 'case-converter',
    title: 'Aa Case Converter',
    description: 'Convert text case format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Type',
    options: [
      {
        name: 'caseType',
        label: 'Convert To',
        type: 'select',
        default: 'lowercase',
        choices: [
          { value: 'uppercase', label: 'UPPERCASE' },
          { value: 'lowercase', label: 'lowercase' },
          { value: 'titlecase', label: 'Title Case' },
          { value: 'camelcase', label: 'camelCase' },
          { value: 'pascalcase', label: 'PascalCase' },
          { value: 'snakecase', label: 'snake_case' },
          { value: 'kebabcase', label: 'kebab-case' },
        ],
      },
    ],
  },

  'json-to-csv': {
    id: 'json-to-csv',
    title: '📊 JSON to CSV',
    description: 'Convert JSON array to CSV format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Table',
    options: [],
  },

  'csv-to-json': {
    id: 'csv-to-json',
    title: '📊 CSV to JSON',
    description: 'Convert CSV data to JSON',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Braces',
    options: [
      {
        name: 'hasHeader',
        label: 'First row is header',
        type: 'checkbox',
        default: true,
      },
    ],
  },

  'json-to-xml': {
    id: 'json-to-xml',
    title: '📁 JSON to XML',
    description: 'Convert JSON to XML format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'FileText',
    options: [],
  },

  'xml-to-json': {
    id: 'xml-to-json',
    title: '📁 XML to JSON',
    description: 'Convert XML to JSON format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Braces',
    options: [],
  },

  'json-to-yaml': {
    id: 'json-to-yaml',
    title: '📝 JSON to YAML',
    description: 'Convert JSON to YAML format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'FileText',
    options: [],
  },

  'yaml-to-json': {
    id: 'yaml-to-json',
    title: '📝 YAML to JSON',
    description: 'Convert YAML to JSON format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Braces',
    options: [],
  },

  'html-encode': {
    id: 'html-encode',
    title: '🔤 HTML Encode',
    description: 'Encode text to HTML entities',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Code2',
    options: [],
  },

  'html-decode': {
    id: 'html-decode',
    title: '🔤 HTML Decode',
    description: 'Decode HTML entities to text',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Code2',
    options: [],
  },

  'slug-generator': {
    id: 'slug-generator',
    title: '🔗 Slug Generator',
    description: 'Generate URL-friendly slugs from text',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Zap',
    options: [],
  },

  // ==================== VALIDATOR ENGINE ====================
  'json-validator': {
    id: 'json-validator',
    title: '✓ JSON Validator',
    description: 'Validate JSON syntax',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'CheckCircle',
    options: [],
  },

  'html-validator': {
    id: 'html-validator',
    title: '✓ HTML Validator',
    description: 'Validate HTML markup syntax',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'CheckCircle',
    options: [],
  },

  'xml-validator': {
    id: 'xml-validator',
    title: '✓ XML Validator',
    description: 'Validate XML structure and syntax',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'CheckCircle',
    options: [],
  },

  'yaml-validator': {
    id: 'yaml-validator',
    title: '✓ YAML Validator',
    description: 'Validate YAML formatting',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'CheckCircle',
    options: [],
  },

  'markdown-validator': {
    id: 'markdown-validator',
    title: '✓ Markdown Validator',
    description: 'Validate Markdown syntax',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'CheckCircle',
    options: [],
  },

  'jwt-decoder': {
    id: 'jwt-decoder',
    title: '🔐 JWT Decoder',
    description: 'Decode and inspect JWT tokens',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'Lock',
    options: [],
  },

  'regex-tester': {
    id: 'regex-tester',
    title: '🔍 Regex Tester',
    description: 'Test and validate regular expressions',
    engine: 'validator',
    inputMode: 'dual',
    outputMode: 'validation',
    icon: 'SearchCheck',
    options: [
      {
        name: 'flags',
        label: 'Regex Flags',
        type: 'text',
        default: 'g',
      },
    ],
  },

  'text-diff': {
    id: 'text-diff',
    title: '📋 Text Diff Checker',
    description: 'Compare and highlight differences between texts',
    engine: 'validator',
    inputMode: 'dual',
    outputMode: 'validation',
    icon: 'GitCompare',
    options: [],
  },

  // ==================== GENERATOR ENGINE ====================
  'uuid-generator': {
    id: 'uuid-generator',
    title: '🆔 UUID Generator',
    description: 'Generate unique UUIDs',
    engine: 'generator',
    inputMode: 'none',
    outputMode: 'textarea',
    icon: 'Dice1',
    options: [
      {
        name: 'count',
        label: 'How many UUIDs',
        type: 'number',
        default: 1,
      },
      {
        name: 'uppercase',
        label: 'Uppercase',
        type: 'checkbox',
        default: false,
      },
    ],
  },

  'hash-generator': {
    id: 'hash-generator',
    title: '#️⃣ Hash Generator',
    description: 'Generate hash digests',
    engine: 'generator',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Hash',
    options: [
      {
        name: 'algorithm',
        label: 'Algorithm',
        type: 'select',
        default: 'sha256',
        choices: [
          { value: 'md5', label: 'MD5' },
          { value: 'sha1', label: 'SHA-1' },
          { value: 'sha256', label: 'SHA-256' },
          { value: 'sha512', label: 'SHA-512' },
        ],
      },
    ],
  },

  'password-generator': {
    id: 'password-generator',
    title: '🔐 Password Generator',
    description: 'Generate secure random passwords',
    engine: 'generator',
    inputMode: 'none',
    outputMode: 'textarea',
    icon: 'Lock',
    options: [
      {
        name: 'length',
        label: 'Password Length',
        type: 'number',
        default: 16,
      },
      {
        name: 'uppercase',
        label: 'Include Uppercase (A-Z)',
        type: 'checkbox',
        default: true,
      },
      {
        name: 'lowercase',
        label: 'Include Lowercase (a-z)',
        type: 'checkbox',
        default: true,
      },
      {
        name: 'numbers',
        label: 'Include Numbers (0-9)',
        type: 'checkbox',
        default: true,
      },
      {
        name: 'symbols',
        label: 'Include Symbols (!@#$)',
        type: 'checkbox',
        default: true,
      },
      {
        name: 'count',
        label: 'Generate Passwords',
        type: 'number',
        default: 1,
      },
    ],
  },

  'lorem-ipsum-generator': {
    id: 'lorem-ipsum-generator',
    title: '📄 Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    engine: 'generator',
    inputMode: 'none',
    outputMode: 'textarea',
    icon: 'FileText',
    options: [
      {
        name: 'type',
        label: 'Generate',
        type: 'select',
        default: 'sentences',
        choices: [
          { value: 'words', label: 'Words' },
          { value: 'sentences', label: 'Sentences' },
          { value: 'paragraphs', label: 'Paragraphs' },
        ],
      },
      {
        name: 'count',
        label: 'Quantity',
        type: 'number',
        default: 5,
      },
    ],
  },

  'random-string-generator': {
    id: 'random-string-generator',
    title: '🎲 Random String Generator',
    description: 'Generate random alphanumeric strings',
    engine: 'generator',
    inputMode: 'none',
    outputMode: 'textarea',
    icon: 'Shuffle',
    options: [
      {
        name: 'length',
        label: 'String Length',
        type: 'number',
        default: 10,
      },
      {
        name: 'count',
        label: 'Generate Strings',
        type: 'number',
        default: 1,
      },
      {
        name: 'charset',
        label: 'Character Set',
        type: 'select',
        default: 'alphanumeric',
        choices: [
          { value: 'alphanumeric', label: 'Alphanumeric (a-z, A-Z, 0-9)' },
          { value: 'alpha', label: 'Letters only (a-z, A-Z)' },
          { value: 'numeric', label: 'Numbers only (0-9)' },
          { value: 'hex', label: 'Hexadecimal (0-9, a-f)' },
        ],
      },
    ],
  },

  'color-converter': {
    id: 'color-converter',
    title: '🎨 Color Converter',
    description: 'Convert between color formats (HEX ↔ RGB)',
    engine: 'generator',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Palette',
    options: [
      {
        name: 'convertFrom',
        label: 'Convert From',
        type: 'select',
        default: 'hex',
        choices: [
          { value: 'hex', label: 'Hexadecimal (HEX)' },
          { value: 'rgb', label: 'RGB' },
        ],
      },
    ],
  },

  // ==================== PHASE 4: ADVANCED TOOLS ====================

  'base32-encode': {
    id: 'base32-encode',
    title: '🔒 Base32 Encode',
    description: 'Encode text to Base32 format',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Lock',
    options: [],
  },

  'base32-decode': {
    id: 'base32-decode',
    title: '🔓 Base32 Decode',
    description: 'Decode Base32 to text',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Unlock',
    options: [],
  },

  'markdown-to-html': {
    id: 'markdown-to-html',
    title: '📝 Markdown to HTML',
    description: 'Convert Markdown to HTML',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Code2',
    options: [],
  },

  'escape-unescape': {
    id: 'escape-unescape',
    title: '🔀 Escape/Unescape',
    description: 'Escape or unescape special characters',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Slash',
    options: [
      {
        name: 'type',
        label: 'Escape Type',
        type: 'select',
        default: 'javascript',
        choices: [
          { value: 'javascript', label: 'JavaScript' },
          { value: 'json', label: 'JSON Strings' },
          { value: 'url', label: 'URL (already implemented)' },
          { value: 'html', label: 'HTML (already implemented)' },
        ],
      },
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        default: 'escape',
        choices: [
          { value: 'escape', label: 'Escape' },
          { value: 'unescape', label: 'Unescape' },
        ],
      },
    ],
  },

  'number-base-converter': {
    id: 'number-base-converter',
    title: '🔢 Number Base Converter',
    description: 'Convert between binary, decimal, hex, octal',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Binary',
    options: [
      {
        name: 'fromBase',
        label: 'From Base',
        type: 'select',
        default: 'decimal',
        choices: [
          { value: 'binary', label: 'Binary (2)' },
          { value: 'octal', label: 'Octal (8)' },
          { value: 'decimal', label: 'Decimal (10)' },
          { value: 'hex', label: 'Hexadecimal (16)' },
        ],
      },
      {
        name: 'toBase',
        label: 'To Base',
        type: 'select',
        default: 'hex',
        choices: [
          { value: 'binary', label: 'Binary (2)' },
          { value: 'octal', label: 'Octal (8)' },
          { value: 'decimal', label: 'Decimal (10)' },
          { value: 'hex', label: 'Hexadecimal (16)' },
        ],
      },
    ],
  },

  'temperature-converter': {
    id: 'temperature-converter',
    title: '🌡️ Temperature Converter',
    description: 'Convert between Celsius, Fahrenheit, Kelvin',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Thermometer',
    options: [
      {
        name: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        default: 'celsius',
        choices: [
          { value: 'celsius', label: 'Celsius (°C)' },
          { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
          { value: 'kelvin', label: 'Kelvin (K)' },
        ],
      },
      {
        name: 'toUnit',
        label: 'To Unit',
        type: 'select',
        default: 'fahrenheit',
        choices: [
          { value: 'celsius', label: 'Celsius (°C)' },
          { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
          { value: 'kelvin', label: 'Kelvin (K)' },
        ],
      },
    ],
  },

  'cron-expression-generator': {
    id: 'cron-expression-generator',
    title: '⏰ Cron Expression Generator',
    description: 'Generate and validate cron expressions',
    engine: 'validator',
    inputMode: 'textarea',
    outputMode: 'validation',
    icon: 'Clock',
    options: [],
  },

  'unix-timestamp-converter': {
    id: 'unix-timestamp-converter',
    title: '⏱️ Unix Timestamp Converter',
    description: 'Convert between Unix timestamps and dates',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'Watch',
    options: [
      {
        name: 'direction',
        label: 'Convert',
        type: 'select',
        default: 'toDate',
        choices: [
          { value: 'toDate', label: 'Timestamp → Date/Time' },
          { value: 'toTimestamp', label: 'Date/Time → Timestamp' },
        ],
      },
    ],
  },

  'qr-code-generator': {
    id: 'qr-code-generator',
    title: '📲 QR Code Generator',
    description: 'Generate QR codes from text or URLs',
    engine: 'generator',
    inputMode: 'textarea',
    outputMode: 'preview',
    icon: 'QrCode',
    options: [
      {
        name: 'size',
        label: 'QR Code Size',
        type: 'select',
        default: '200',
        choices: [
          { value: '150', label: 'Small (150px)' },
          { value: '200', label: 'Medium (200px)' },
          { value: '300', label: 'Large (300px)' },
          { value: '400', label: 'Extra Large (400px)' },
        ],
      },
    ],
  },

  'json-schema-validator': {
    id: 'json-schema-validator',
    title: '✓ JSON Schema Validator',
    description: 'Validate JSON against a schema',
    engine: 'validator',
    inputMode: 'dual',
    outputMode: 'validation',
    icon: 'CheckCircle2',
    options: [],
  },

  'csv-json-converter': {
    id: 'csv-json-converter',
    title: '📊 CSV ↔ JSON Converter',
    description: 'Convert between CSV and JSON formats',
    engine: 'converter',
    inputMode: 'textarea',
    outputMode: 'textarea',
    icon: 'RotateCw',
    options: [
      {
        name: 'format',
        label: 'Input Format',
        type: 'select',
        default: 'csv-to-json',
        choices: [
          { value: 'csv-to-json', label: 'CSV → JSON' },
          { value: 'json-to-csv', label: 'JSON → CSV' },
        ],
      },
    ],
  },
};

export function getToolBySlug(slug: string): CodeTool | undefined {
  return codeTools[slug];
}

export function getToolsByEngine(engine: EngineType): CodeTool[] {
  return Object.values(codeTools).filter((tool) => tool.engine === engine);
}

export function getAllTools(): CodeTool[] {
  return Object.values(codeTools);
}
