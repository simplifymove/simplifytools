import { Metadata } from 'next';
import { CodeTool, getToolBySlug } from '@/app/lib/code-tools';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

interface ToolSEOData {
  title: string;
  description: string;
  keywords: string[];
}

const acronymWords: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  base32: 'Base32',
  base64: 'Base64',
  css: 'CSS',
  csv: 'CSV',
  html: 'HTML',
  json: 'JSON',
  jwt: 'JWT',
  qr: 'QR',
  regex: 'Regex',
  rgb: 'RGB',
  sql: 'SQL',
  url: 'URL',
  uuid: 'UUID',
  xml: 'XML',
  yaml: 'YAML',
};

const titleOverrides: Record<string, string> = {
  'base32-decode': 'Base32 Decoder Online | Decode Base32 to Text',
  'base32-encode': 'Base32 Encoder Online | Encode Text to Base32',
  'base64-decode': 'Base64 Decoder Online | Decode Base64 to Text',
  'base64-encode': 'Base64 Encoder Online | Encode Text to Base64',
  'case-converter': 'Case Converter Online | Convert Text Case Formats',
  'code-beautifier': 'Code Beautifier Online | Format Code',
  'code-minifier': 'Code Minifier Online | Compress JS CSS HTML Files',
  'color-converter': 'Color Converter Online | Convert HEX and RGB Codes',
  'cron-expression-generator': 'Cron Expression Generator | Build & Validate Cron Schedules',
  'css-formatter': 'CSS Formatter Online | Beautify CSS Code',
  'css-minifier': 'CSS Minifier Online | Compress CSS Code Files',
  'csv-json-converter': 'CSV JSON Converter Online | Convert CSV and JSON',
  'csv-to-json': 'Pasted CSV to JSON | Preserve String Values',
  'escape-unescape': 'Escape Unescape Tool Online | Encode Special Characters',
  'hash-generator': 'Hash Generator Online | Generate MD5 SHA Hashes',
  'html-decode': 'HTML Decoder Online | Decode HTML Entities',
  'html-encode': 'HTML Encoder Online | Encode HTML Entities',
  'html-formatter': 'HTML Formatter Online | Beautify HTML Code',
  'html-minifier': 'HTML Minifier Online | Compress HTML Code',
  'html-validator': 'HTML Validator Online | Check HTML Markup',
  'json-formatter': 'JSON Formatter - Validate Syntax and Set Indentation',
  'json-schema-validator': 'JSON Schema Validator | Validate JSON Data Online',
  'json-to-csv': 'JSON to CSV Converter Online | Export JSON to CSV',
  'json-to-xml': 'JSON to XML Converter Online | Convert JSON Data',
  'json-to-yaml': 'JSON to YAML Converter Online | Convert JSON Data',
  'json-validator': 'JSON Validator - Check JSON Syntax and Parser Errors',
  'jwt-decoder': 'JWT Decoder Online | Decode JWT Header and Payload',
  'lorem-ipsum-generator': 'Lorem Ipsum Generator Online | Create Dummy Text',
  'markdown-to-html': 'Markdown to HTML Converter Online | Convert Markdown',
  'markdown-validator': 'Markdown Validator Online | Check Markdown Syntax',
  'number-base-converter': 'Number Base Converter Online | Binary Decimal Hex Tool',
  'password-generator': 'Password Generator Online | Generate Random Passwords',
  'qr-code-generator': 'QR Code Generator Online | Create QR Codes',
  'random-string-generator': 'Random String Generator Online | Create Random Text',
  'regex-tester': 'Regex Tester Online | Test Regular Expressions',
  'slug-generator': 'Slug Generator Online | Create URL Friendly Slugs',
  'sql-formatter': 'SQL Formatter Online | Format SQL Queries',
  'temperature-converter': 'Temperature Converter Online | Celsius Fahrenheit Kelvin',
  'text-diff': 'Text Diff Checker Online | Compare Text Differences',
  'unix-timestamp-converter': 'Unix Timestamp Converter Online | Convert Epoch Time',
  'url-decode': 'URL Decoder Online | Decode URL Encoded Text',
  'url-encode': 'URL Encoder Online | Encode Text for URLs',
  'uuid-generator': 'UUID Generator Online | Generate UUID v4 IDs',
  'xml-formatter': 'XML Formatter Online | Beautify XML Documents',
  'xml-minifier': 'XML Minifier Online | Compress XML Documents',
  'xml-to-json': 'XML to JSON Converter Online | Convert XML Data',
  'xml-validator': 'XML Validator Online | Check XML Syntax Errors',
  'yaml-to-json': 'YAML to JSON Converter Online | Convert YAML Data',
  'yaml-validator': 'YAML Validator Online | Check YAML Syntax',
};

const descriptionOverrides: Record<string, string> = {
  'csv-json-converter': 'Convert CSV to JSON or JSON to CSV in one tool. Switch directions, handle quoted fields, and review examples, data types, and flat-record limitations.',
  'qr-code-generator': 'Create QR codes from URLs or text online. Preview and download PNG images in 150, 200, 300, or 400 pixels, with scanning tips and input limits.',
  'unix-timestamp-converter': 'Convert Unix timestamps in seconds to UTC dates and ISO 8601 date/time values back to epoch seconds. Includes examples, timezone guidance, and input validation.',
  'temperature-converter': 'Convert Celsius, Fahrenheit, and Kelvin temperatures online. Check conversion formulas, practical examples, absolute-zero limits, and rounded results.',
  'number-base-converter': 'Convert integers between binary, octal, decimal, and hexadecimal online. Supports negative and large integers with exact results, examples, and input validation.',
  'escape-unescape': 'Escape and unescape JavaScript, JSON strings, URL components, and HTML entities online. Convert special characters with practical examples and format-specific guidance.',
  'markdown-to-html': 'Convert Markdown to HTML online with support for headings, lists, links, tables, and code blocks. Generate sanitized HTML with examples and formatting guidance.',
  'color-converter': 'Convert HEX colors to RGB and RGB values to HEX online. Enter six-digit HEX codes or RGB channels from 0 to 255 with clear examples and format guidance.',
  'random-string-generator': 'Generate random strings online using letters, numbers, alphanumeric, or hexadecimal characters. Choose lengths from 1 to 256 and create up to 100 strings at once.',
  'lorem-ipsum-generator': 'Generate Lorem Ipsum placeholder text online for website layouts, wireframes, and prototypes. Create 1 to 100 words, sentences, or paragraphs with adjustable quantity.',
  'hash-generator': 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text online. Compare hexadecimal digests, learn hash lengths, and understand hashing security limitations.',
  'uuid-generator': 'Generate random UUID v4 identifiers online. Create 1 to 1000 UUIDs per request, choose uppercase or lowercase formatting, and learn how UUID identifiers work.',
  'slug-generator': 'Generate lowercase, hyphen-separated URL slugs from text online. Handles spaces, punctuation, repeated separators, and common accented Latin characters.',
  'html-decode': 'Decode HTML entities into readable text online. Supports HTML5 named references, decimal and hexadecimal Unicode entities, and correctly handles double-encoded text.',
  'html-encode': 'Encode HTML special characters into entities online. Escape ampersands, angle brackets, quotation marks, and apostrophes with examples and clear encoding limitations.',
  'yaml-to-json': 'Convert YAML to formatted JSON online. Supports nested mappings, arrays, multiline strings, Unicode, and YAML anchors, with clear errors for invalid YAML.',
  'json-to-yaml': 'Convert valid JSON to YAML online. Supports nested objects, arrays, Unicode, multiline strings, and empty collections with clear errors for invalid JSON.',
  'xml-to-json': 'Convert well-formed XML to JSON online. Supports nested elements, repeated tags, attributes, CDATA, and XML entity decoding, with errors for malformed documents.',
  'json-to-xml': 'Convert JSON objects and arrays to well-formed XML online. Supports nested data, XML character escaping, Unicode text, and clear errors for unsupported element names.',

  'json-to-csv': 'Convert JSON arrays of flat objects to CSV online. Supports quoted fields, commas, line breaks, Unicode, missing values, and clear errors for nested data.',
  'case-converter': 'Convert text to uppercase, lowercase, Title Case, camelCase, PascalCase, snake_case, or kebab-case. Handles common word separators and naming patterns.',
  'url-decode': 'Decode percent-encoded URL components using decodeURIComponent. Convert %20, %26, and other escaped characters into readable text, with guidance on plus signs and malformed input.',
  'url-encode': 'Percent-encode text for URL query parameters and other URL components using encodeURIComponent. See examples for spaces, special characters, and complete-URL limitations.',
  'base32-decode': 'Decode standard RFC 4648 Base32 into readable UTF-8 text online. Supports padded and unpadded uppercase Base32, Unicode text, and clear invalid-input errors.',
  'base32-encode': 'Encode UTF-8 text into standard RFC 4648 Base32 online. Generate uppercase Base32 strings with correct padding, Unicode support, and practical encoding examples.',
  'base64-decode': 'Decode standard Base64 into UTF-8 text online. Supports optional padding and whitespace, detects malformed input, and explains Base64 decoding limitations.',
  'html-minifier': 'Minify HTML using html-minifier-terser. Remove unnecessary whitespace and comments, simplify supported attributes, and compress inline CSS and JavaScript.',
  'json-schema-validator': 'Validate JSON data against JSON Schema Draft-07 rules. Check required fields, nested objects, arrays, types, formats, and constraints with detailed validation errors.',
  'cron-expression-generator': 'Generate five-field cron expressions using schedule presets or enter your own. Validate minutes, hours, weekdays, ranges, lists, and steps before configuring a cron job.',
  'csv-to-json': 'Convert pasted comma-separated CSV to JSON text while preserving string values and leading zeros. Includes header, quoting, blank-line, and output guidance.',
  'base64-encode': 'Encode UTF-8 text as standard Base64. Includes reproducible examples, padding and Unicode guidance, and server-processing limitations.',
  'json-formatter': 'Parse valid JSON and rewrite it with your selected indentation. Includes common syntax-error guidance and a warning not to submit secrets to server processing.',
  'json-validator': 'Check JSON syntax with JSON.parse and diagnose quotes, trailing commas, missing values, and nesting errors. This validates syntax, not JSON Schema.',
  'jwt-decoder': 'Decode and inspect the header and payload of a JWT token. Decoding does not verify the token signature or establish that its claims are trustworthy.',
  'password-generator': 'Generate random password strings using the available length, uppercase, lowercase, number, and symbol options. Review the generated value before use.',
};

function formatToolName(slug: string): string {
  return slug
    .split('-')
    .map((word) => acronymWords[word] || word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildSearchIntentDescription(slug: string, tool: CodeTool, label: string): string {
  if (descriptionOverrides[slug]) {
    return descriptionOverrides[slug];
  }

  if (slug.includes('validator')) {
    return `Validate ${label.replace(/ Validator$/, '')} syntax using the checks available for this tool. Review reported errors and limitations before relying on the result.`;
  }

  if (slug.includes('formatter') || slug.includes('beautifier')) {
    return `Format and beautify ${label.replace(/ Formatter$| Beautifier$/, '')} code using the available formatting options. Review the output before replacing source code.`;
  }

  if (slug.includes('minifier')) {
    return `Minify ${label.replace(/ Minifier$/, '')} code by applying the transformations supported by this tool. Review the output before using it in production.`;
  }

  if (slug.includes('decoder') || slug.includes('decode')) {
    return `Decode ${label.replace(/ Decoder$| Decode$/, '')} data using the supported decoding workflow. Check the resulting text or data before using it.`;
  }

  if (slug.includes('encoder') || slug.includes('encode')) {
    return `Encode ${label.replace(/ Encoder$| Encode$/, '')} data using the supported encoding workflow. Encoding changes representation and should not be treated as encryption.`;
  }

  if (slug.includes('converter') || slug.includes('-to-')) {
    return `Convert ${label.replace(/ Converter$/, '')} using the supported conversion workflow. Review the generated structure, values, and formatting before using the result.`;
  }

  if (slug.includes('generator')) {
    return `Generate ${label.replace(/ Generator$/, '')} using the options available for this tool. Review generated values before using them in an application or workflow.`;
  }

  if (slug.includes('regex')) {
    return 'Test a regular expression against the provided text using the available flags. Review matches and pattern behavior before using the expression in an application.';
  }

  if (slug.includes('diff')) {
    return 'Compare two text inputs and review the differences reported by the tool. The comparison is intended to help inspect changed, added, or removed text.';
  }

  return `${tool.description}. Use the available options for this developer utility and review the generated result before using it in another workflow.`;
}

function buildSEOData(slug: string, tool: CodeTool): ToolSEOData {
  const label = formatToolName(slug);
  const title = titleOverrides[slug] || `${label} Online | ${tool.engine.charAt(0).toUpperCase() + tool.engine.slice(1)} Developer Tool`;
  const description = buildSearchIntentDescription(slug, tool, label);

  return {
    title,
    description,
    keywords: [
      label,
      `${label} online`,
      `${label} free`,
      tool.engine,
      'developer tool',
      'browser based tool',
    ],
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/code-tools/${slug}`;
  const seoData = buildSEOData(slug, tool);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: seoData.title,
      description: seoData.description,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: seoData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CodeToolsSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (!getToolBySlug(slug)) {
    notFound();
  }

  return <>{children}</>;
}
