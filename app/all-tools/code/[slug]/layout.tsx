import { Metadata } from 'next';
import { getToolBySlug } from '@/app/lib/code-tools';

interface Params {
  slug: string;
}

// Comprehensive SEO database for all 49 code tools
// Ensures unique, high-quality metadata for each tool
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  longDescription?: string;
}> = {
  // FORMATTERS
  'code-minifier': {
    title: 'Code Minifier - Reduce File Size for JavaScript, HTML, CSS, JSON',
    description: 'Minify JavaScript, HTML, CSS, JSON code instantly. Reduce file sizes for faster web performance. Free online tool, no signup required.',
    keywords: ['code minifier', 'minify JavaScript', 'minify HTML', 'minify CSS', 'minify code', 'file size reducer'],
    longDescription: 'Minify code to reduce file size and improve web performance. Supports JavaScript, HTML, CSS, JSON, and XML formats.',
  },
  'code-beautifier': {
    title: 'Code Beautifier & Formatter - Format Code Online',
    description: 'Format and beautify JavaScript, HTML, CSS, JSON, XML, SQL code. Instant formatting with customizable indentation. Free tool for developers.',
    keywords: ['code beautifier', 'code formatter', 'format code', 'JavaScript formatter', 'HTML formatter', 'pretty print'],
    longDescription: 'Beautify and format code with proper indentation. Supports multiple programming languages and customizable options.',
  },
  'json-formatter': {
    title: 'JSON Formatter & Prettifier - Format JSON Online Free',
    description: 'Format, validate, and beautify JSON instantly. Pretty-print JSON with customizable indentation. Debug malformed JSON easily.',
    keywords: ['JSON formatter', 'JSON prettifier', 'format JSON', 'validate JSON', 'pretty print JSON', 'JSON beautifier'],
    longDescription: 'Format and validate JSON data with proper indentation. Instantly identify syntax errors and debug JSON structures.',
  },
  'html-formatter': {
    title: 'HTML Formatter - Format & Beautify HTML Code Online',
    description: 'Format and beautify HTML markup instantly. Fix indentation, spacing, and structure. Free HTML code formatter, no downloads needed.',
    keywords: ['HTML formatter', 'format HTML', 'HTML beautifier', 'HTML code cleaner', 'format HTML markup'],
    longDescription: 'Beautify HTML code with proper formatting and indentation for better readability and debugging.',
  },
  'html-minifier': {
    title: 'HTML Minifier - Reduce HTML File Size for Web Performance',
    description: 'Minify HTML code to reduce file size and improve page load speed. Remove unnecessary whitespace and comments. Free online tool.',
    keywords: ['HTML minifier', 'minify HTML', 'HTML code minifier', 'reduce HTML size', 'web performance'],
    longDescription: 'Minify HTML by removing whitespace, comments, and unnecessary characters to reduce file size.',
  },
  'css-formatter': {
    title: 'CSS Formatter - Format & Beautify CSS Code Online',
    description: 'Format and beautify CSS stylesheets instantly. Fix indentation and improve readability. Free CSS code formatter for developers.',
    keywords: ['CSS formatter', 'format CSS', 'CSS beautifier', 'stylesheet formatter', 'format CSS code'],
    longDescription: 'Beautify CSS code with proper formatting and indentation for better maintainability and debugging.',
  },
  'css-minifier': {
    title: 'CSS Minifier - Reduce CSS File Size for Web Performance',
    description: 'Minify CSS stylesheets to reduce file size and improve page load speed. Remove whitespace and unnecessary characters. Free online.',
    keywords: ['CSS minifier', 'minify CSS', 'CSS code minifier', 'reduce CSS size', 'stylesheet minifier'],
    longDescription: 'Minify CSS by removing whitespace and comments to reduce file size and improve web performance.',
  },
  'xml-formatter': {
    title: 'XML Formatter - Format & Beautify XML Code Online',
    description: 'Format and beautify XML documents instantly. Fix indentation and improve readability. Free XML code formatter, no signup needed.',
    keywords: ['XML formatter', 'format XML', 'XML beautifier', 'XML code cleaner', 'pretty print XML'],
    longDescription: 'Beautify and format XML data with proper indentation for better readability and debugging.',
  },
  'xml-minifier': {
    title: 'XML Minifier - Reduce XML File Size',
    description: 'Minify XML documents to reduce file size. Remove whitespace and unnecessary characters. Free online XML minifier tool.',
    keywords: ['XML minifier', 'minify XML', 'XML compressor', 'reduce XML size', 'XML optimization'],
    longDescription: 'Minify XML by removing whitespace and comments to reduce file size.',
  },
  'sql-formatter': {
    title: 'SQL Formatter - Format & Beautify SQL Queries Online',
    description: 'Format and beautify SQL queries instantly. Improve readability with proper indentation. Free SQL code formatter for developers.',
    keywords: ['SQL formatter', 'format SQL', 'SQL beautifier', 'query formatter', 'SQL code cleaner'],
    longDescription: 'Beautify and format SQL queries with proper indentation and spacing for better readability.',
  },

  // CONVERTERS
  'base64-encode': {
    title: 'Base64 Encoder - Encode Text to Base64 Online',
    description: 'Encode text and strings to Base64 format instantly. Useful for data transmission and storage. Free online encoder, no signup.',
    keywords: ['Base64 encoder', 'encode Base64', 'text to Base64', 'Base64 encoding', 'string encoder'],
    longDescription: 'Convert text and strings to Base64 encoded format for data transmission and storage.',
  },
  'base64-decode': {
    title: 'Base64 Decoder - Decode Base64 to Text Online',
    description: 'Decode Base64 strings to plain text instantly. Retrieve original data from encoded strings. Free online decoder.',
    keywords: ['Base64 decoder', 'decode Base64', 'Base64 to text', 'Base64 decoding', 'string decoder'],
    longDescription: 'Convert Base64 encoded strings back to plain text instantly.',
  },
  'url-encode': {
    title: 'URL Encoder - Encode Text for URLs Online Free',
    description: 'URL encode text for safe transmission in URLs. Convert special characters to percent-encoded format. Free online encoder.',
    keywords: ['URL encoder', 'encode URL', 'text to URL', 'percent encoding', 'URL encoding'],
    longDescription: 'Encode text safely for URLs by converting special characters to percent-encoded format.',
  },
  'url-decode': {
    title: 'URL Decoder - Decode URL-Encoded Text Online',
    description: 'Decode URL-encoded strings back to plain text. Convert percent-encoded characters to readable format. Free decoder.',
    keywords: ['URL decoder', 'decode URL', 'percent decoding', 'URL decoding', 'decode text'],
    longDescription: 'Decode URL-encoded strings back to readable plain text format.',
  },
  'case-converter': {
    title: 'Case Converter - Convert Text Case Online (Upper, Lower, Title, Camel)',
    description: 'Convert text between uppercase, lowercase, title case, camelCase, PascalCase, snake_case, kebab-case. Free online tool.',
    keywords: ['case converter', 'text case converter', 'uppercase', 'lowercase', 'camelCase', 'PascalCase', 'snake_case'],
    longDescription: 'Convert text to any case format: uppercase, lowercase, title case, camelCase, PascalCase, snake_case, kebab-case.',
  },
  'json-to-csv': {
    title: 'JSON to CSV Converter - Convert JSON Arrays to CSV Format',
    description: 'Convert JSON arrays to CSV format instantly. Export data to spreadsheet-compatible format. Free online converter.',
    keywords: ['JSON to CSV', 'convert JSON', 'JSON CSV converter', 'JSON to spreadsheet', 'data export'],
    longDescription: 'Convert JSON arrays to CSV format for use in spreadsheets and data analysis tools.',
  },
  'csv-to-json': {
    title: 'CSV to JSON Converter - Convert CSV to JSON Format Online',
    description: 'Convert CSV data to JSON format instantly. Parse CSV files and generate clean JSON. Free online converter, no signup.',
    keywords: ['CSV to JSON', 'convert CSV', 'CSV JSON converter', 'CSV parser', 'data conversion'],
    longDescription: 'Convert CSV spreadsheet data to JSON format for use in APIs and applications.',
  },
  'json-to-xml': {
    title: 'JSON to XML Converter - Convert JSON to XML Format Online',
    description: 'Convert JSON data to XML format instantly. Useful for legacy system integration. Free online converter tool.',
    keywords: ['JSON to XML', 'convert JSON', 'JSON XML converter', 'format conversion', 'data interchange'],
    longDescription: 'Convert JSON data structures to XML format for system integration and data interchange.',
  },
  'xml-to-json': {
    title: 'XML to JSON Converter - Convert XML to JSON Format Online',
    description: 'Convert XML documents to JSON format instantly. Perfect for API integration. Free online converter, no downloads needed.',
    keywords: ['XML to JSON', 'convert XML', 'XML JSON converter', 'format conversion', 'API integration'],
    longDescription: 'Convert XML documents to JSON format for modern API and application use.',
  },
  'json-to-yaml': {
    title: 'JSON to YAML Converter - Convert JSON to YAML Format Online',
    description: 'Convert JSON data to YAML format instantly. Create readable configuration files. Free online converter.',
    keywords: ['JSON to YAML', 'convert JSON', 'JSON YAML converter', 'YAML format', 'configuration'],
    longDescription: 'Convert JSON to YAML format for configuration files and data serialization.',
  },
  'yaml-to-json': {
    title: 'YAML to JSON Converter - Convert YAML to JSON Format Online',
    description: 'Convert YAML configuration files to JSON format instantly. Parse YAML easily. Free online converter tool.',
    keywords: ['YAML to JSON', 'convert YAML', 'YAML JSON converter', 'configuration conversion', 'format conversion'],
    longDescription: 'Convert YAML configuration files to JSON format for development and API use.',
  },
  'html-encode': {
    title: 'HTML Encoder - Encode Text to HTML Entities Online',
    description: 'Encode text to HTML entities for safe display in web pages. Convert special characters instantly. Free online encoder.',
    keywords: ['HTML encoder', 'encode HTML', 'HTML entities', 'HTML encoding', 'special character encoder'],
    longDescription: 'Convert text and special characters to HTML entities for safe web display.',
  },
  'html-decode': {
    title: 'HTML Decoder - Decode HTML Entities to Text Online',
    description: 'Decode HTML entities back to readable text. Convert encoded special characters. Free online decoder, instant results.',
    keywords: ['HTML decoder', 'decode HTML', 'HTML entity decoder', 'HTML decoding', 'special character decoder'],
    longDescription: 'Decode HTML entities back to plain text and special characters.',
  },
  'slug-generator': {
    title: 'Slug Generator - Generate URL-Friendly Slugs Online',
    description: 'Generate clean, URL-friendly slugs from text instantly. Perfect for URLs, file names, and identifiers. Free online tool.',
    keywords: ['slug generator', 'URL slug', 'slug converter', 'URL friendly', 'text to slug'],
    longDescription: 'Convert text to URL-friendly slugs for use in web URLs and file names.',
  },
  'base32-encode': {
    title: 'Base32 Encoder - Encode Text to Base32 Format Online',
    description: 'Encode text to Base32 format for secure data transmission. Free online Base32 encoder tool.',
    keywords: ['Base32 encoder', 'encode Base32', 'Base32 encoding', 'text encoder'],
    longDescription: 'Encode text to Base32 format for data transmission and storage.',
  },
  'base32-decode': {
    title: 'Base32 Decoder - Decode Base32 to Text Online',
    description: 'Decode Base32 strings back to plain text instantly. Free online Base32 decoder.',
    keywords: ['Base32 decoder', 'decode Base32', 'Base32 decoding', 'string decoder'],
    longDescription: 'Decode Base32 strings back to plain text format.',
  },
  'markdown-to-html': {
    title: 'Markdown to HTML Converter - Convert Markdown to HTML Online',
    description: 'Convert Markdown syntax to HTML instantly. Generate web-ready HTML from Markdown. Free online converter.',
    keywords: ['Markdown to HTML', 'convert Markdown', 'Markdown HTML', 'Markdown converter', 'HTML generator'],
    longDescription: 'Convert Markdown formatted text to HTML for web pages and blogs.',
  },
  'escape-unescape': {
    title: 'Escape/Unescape Tool - Escape Special Characters Online',
    description: 'Escape or unescape special characters for JavaScript, JSON, and URLs. Instant conversion. Free online tool.',
    keywords: ['escape characters', 'unescape', 'escape tool', 'special character escape', 'string escape'],
    longDescription: 'Escape or unescape special characters for safe use in code strings.',
  },
  'number-base-converter': {
    title: 'Number Base Converter - Convert Binary, Decimal, Hex, Octal Online',
    description: 'Convert numbers between binary, decimal, hexadecimal, and octal bases. Instant conversion. Free online converter.',
    keywords: ['number base converter', 'binary converter', 'hex converter', 'decimal conversion', 'base conversion'],
    longDescription: 'Convert numbers between different bases: binary, decimal, hexadecimal, and octal.',
  },
  'temperature-converter': {
    title: 'Temperature Converter - Convert Celsius, Fahrenheit, Kelvin Online',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin temperature scales instantly. Free online converter.',
    keywords: ['temperature converter', 'Celsius to Fahrenheit', 'convert temperature', 'temperature calculator'],
    longDescription: 'Convert temperatures between Celsius, Fahrenheit, and Kelvin scales.',
  },
  'csv-json-converter': {
    title: 'CSV ↔ JSON Converter - Bidirectional Format Conversion Online',
    description: 'Convert between CSV and JSON formats instantly. Bidirectional converter for data interchange. Free online tool.',
    keywords: ['CSV JSON converter', 'bidirectional converter', 'data conversion', 'format converter', 'export import'],
    longDescription: 'Convert data between CSV and JSON formats in both directions.',
  },

  // VALIDATORS
  'json-validator': {
    title: 'JSON Validator - Validate JSON Syntax Online Free',
    description: 'Validate JSON syntax instantly. Find and fix JSON errors quickly. Free online validator for developers.',
    keywords: ['JSON validator', 'validate JSON', 'JSON syntax checker', 'JSON error finder', 'JSON verification'],
    longDescription: 'Validate JSON syntax and identify errors instantly for debugging.',
  },
  'html-validator': {
    title: 'HTML Validator - Validate HTML Markup Online',
    description: 'Validate HTML markup syntax instantly. Find HTML errors and improve code quality. Free online validator.',
    keywords: ['HTML validator', 'validate HTML', 'HTML syntax checker', 'HTML error checker', 'markup validation'],
    longDescription: 'Validate HTML markup syntax and identify structural errors.',
  },
  'xml-validator': {
    title: 'XML Validator - Validate XML Syntax & Structure Online',
    description: 'Validate XML documents instantly. Check syntax and structure. Find XML errors quickly. Free online validator.',
    keywords: ['XML validator', 'validate XML', 'XML syntax checker', 'XML error finder', 'document validation'],
    longDescription: 'Validate XML document syntax and structure to identify errors.',
  },
  'yaml-validator': {
    title: 'YAML Validator - Validate YAML Syntax Online',
    description: 'Validate YAML configuration files instantly. Check YAML syntax and find errors. Free online validator.',
    keywords: ['YAML validator', 'validate YAML', 'YAML syntax checker', 'configuration validator', 'YAML error finder'],
    longDescription: 'Validate YAML configuration file syntax and identify formatting errors.',
  },
  'markdown-validator': {
    title: 'Markdown Validator - Validate Markdown Syntax Online',
    description: 'Validate Markdown syntax instantly. Check formatting and find errors. Free online Markdown validator.',
    keywords: ['Markdown validator', 'validate Markdown', 'Markdown checker', 'syntax validator', 'Markdown error finder'],
    longDescription: 'Validate Markdown formatting syntax to ensure proper document structure.',
  },
  'jwt-decoder': {
    title: 'JWT Decoder - Decode JWT Tokens Online | Inspect JWT Payload',
    description: 'Decode and inspect JWT tokens instantly. View payload, headers, and signature. Free online JWT decoder tool.',
    keywords: ['JWT decoder', 'decode JWT', 'JWT inspector', 'token decoder', 'JWT validation', 'JSON Web Token'],
    longDescription: 'Decode JWT tokens to inspect payload, header, and signature for debugging and verification.',
  },
  'regex-tester': {
    title: 'Regex Tester - Test Regular Expressions Online Free',
    description: 'Test and validate regular expressions instantly. Debug regex patterns with live matching. Free online regex tester.',
    keywords: ['regex tester', 'regular expression tester', 'test regex', 'regex validator', 'pattern matcher'],
    longDescription: 'Test regular expressions against sample text to validate patterns and debugging.',
  },
  'text-diff': {
    title: 'Text Diff Checker - Compare & Highlight Text Differences Online',
    description: 'Compare two texts and highlight differences instantly. Side-by-side text comparison. Free online tool.',
    keywords: ['text diff', 'text difference', 'compare text', 'diff checker', 'text comparison'],
    longDescription: 'Compare two texts side-by-side and highlight differences for content review.',
  },
  'cron-expression-generator': {
    title: 'Cron Expression Generator & Validator - Create & Test Cron Jobs',
    description: 'Generate and validate cron expressions instantly. Test cron schedules. Free online cron tool for developers.',
    keywords: ['cron expression', 'cron generator', 'cron validator', 'cron scheduler', 'cron job'],
    longDescription: 'Generate and validate cron expressions for scheduled tasks and job automation.',
  },
  'json-schema-validator': {
    title: 'JSON Schema Validator - Validate JSON Against Schema Online',
    description: 'Validate JSON data against JSON Schema instantly. Verify data structure and types. Free online validator.',
    keywords: ['JSON schema validator', 'validate JSON schema', 'schema validation', 'JSON data validator', 'schema compliance'],
    longDescription: 'Validate JSON data against schemas to ensure data structure compliance.',
  },

  // GENERATORS
  'uuid-generator': {
    title: 'UUID Generator - Generate Unique IDs Online Free',
    description: 'Generate unique UUIDs (version 4) instantly. Bulk generate multiple UUIDs. Free online UUID generator for developers.',
    keywords: ['UUID generator', 'generate UUID', 'unique ID generator', 'GUID generator', 'identifier generator'],
    longDescription: 'Generate unique universal identifiers (UUIDs) for database keys and identifiers.',
  },
  'hash-generator': {
    title: 'Hash Generator - Generate MD5, SHA1, SHA256, SHA512 Hashes Online',
    description: 'Generate cryptographic hashes instantly. Support MD5, SHA1, SHA256, SHA512. Free online hash generator.',
    keywords: ['hash generator', 'generate hash', 'MD5 hash', 'SHA256 hash', 'hash calculator', 'cryptographic hash'],
    longDescription: 'Generate cryptographic hashes in multiple formats for data verification and security.',
  },
  'password-generator': {
    title: 'Password Generator - Generate Secure Random Passwords Online',
    description: 'Generate strong, secure random passwords instantly. Customize length and character types. Free online password generator.',
    keywords: ['password generator', 'generate password', 'strong password', 'random password', 'password creator'],
    longDescription: 'Generate secure random passwords with customizable length and character options.',
  },
  'lorem-ipsum-generator': {
    title: 'Lorem Ipsum Generator - Generate Placeholder Text Online',
    description: 'Generate Lorem Ipsum placeholder text instantly. Create dummy content for designs. Free online text generator.',
    keywords: ['Lorem Ipsum', 'placeholder text', 'dummy text', 'Lorem Ipsum generator', 'text generator'],
    longDescription: 'Generate Lorem Ipsum placeholder text for mockups, designs, and content creation.',
  },
  'random-string-generator': {
    title: 'Random String Generator - Generate Random Alphanumeric Strings Online',
    description: 'Generate random strings instantly. Customize length and character set. Free online random generator for developers.',
    keywords: ['random string generator', 'generate random string', 'random alphanumeric', 'string generator', 'random character'],
    longDescription: 'Generate random strings with customizable length and character sets.',
  },
  'color-converter': {
    title: 'Color Converter - Convert Color Formats (HEX, RGB) Online',
    description: 'Convert between HEX and RGB color formats instantly. Color conversion tool for designers and developers.',
    keywords: ['color converter', 'hex to RGB', 'RGB to hex', 'color conversion', 'color format converter'],
    longDescription: 'Convert colors between HEX and RGB formats for web design and development.',
  },
  'unix-timestamp-converter': {
    title: 'Unix Timestamp Converter - Convert Timestamps to Dates Online',
    description: 'Convert Unix timestamps to dates and vice versa instantly. Timezone-aware conversion. Free online converter.',
    keywords: ['Unix timestamp', 'timestamp converter', 'epoch converter', 'timestamp to date', 'date to timestamp'],
    longDescription: 'Convert between Unix timestamps and human-readable dates with timezone support.',
  },
  'qr-code-generator': {
    title: 'QR Code Generator - Generate QR Codes Online Free',
    description: 'Generate QR codes from text and URLs instantly. Download QR codes as images. Free online QR code generator.',
    keywords: ['QR code generator', 'generate QR code', 'QR code maker', 'QR code creator', 'code generator'],
    longDescription: 'Generate QR codes from text, URLs, and data for mobile scanning.',
  },
};

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
  const canonicalUrl = `${baseUrl}/all-tools/code/${slug}`;
  
  // Get SEO data from database, fallback to tool data if not found
  const seoData = toolSEODatabase[slug] || {
    title: `${tool.title} - Free Code Tool | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'code tool', 'developer tool'],
  };

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: seoData.title.split(' - ')[0],
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
      title: seoData.title.split(' - ')[0],
      description: seoData.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function CodeSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
