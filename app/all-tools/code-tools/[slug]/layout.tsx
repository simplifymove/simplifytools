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
  'base32-decode': 'Base32 Decoder Online Free | Decode Base32 to Text',
  'base32-encode': 'Base32 Encoder Online Free | Encode Text to Base32',
  'base64-decode': 'Base64 Decoder Online Free | Decode Base64 to Text',
  'base64-encode': 'Base64 Encoder Online Free | Encode Text to Base64',
  'case-converter': 'Case Converter Online Free | Convert Text Case Formats',
  'code-beautifier': 'Code Beautifier Online Free | Format Code Instantly',
  'code-minifier': 'Code Minifier Online Free | Compress JS CSS HTML Files',
  'color-converter': 'Color Converter Online Free | Convert HEX and RGB Codes',
  'cron-expression-generator': 'Cron Expression Generator Online | Create Cron Jobs',
  'css-formatter': 'CSS Formatter Online Free | Beautify CSS Code Fast',
  'css-minifier': 'CSS Minifier Online Free | Compress CSS Code Files Fast',
  'csv-json-converter': 'CSV JSON Converter Online Free | Convert CSV and JSON',
  'csv-to-json': 'CSV to JSON Converter Online Free | Convert CSV Files',
  'escape-unescape': 'Escape Unescape Tool Online | Encode Special Characters',
  'hash-generator': 'Hash Generator Online Free | Generate MD5 SHA Hashes',
  'html-decode': 'HTML Decoder Online Free | Decode HTML Entities Fast',
  'html-encode': 'HTML Encoder Online Free | Encode HTML Entities Fast',
  'html-formatter': 'HTML Formatter Online Free | Beautify HTML Code Fast',
  'html-minifier': 'HTML Minifier Online Free | Compress HTML Code Fast',
  'html-validator': 'HTML Validator Online Free | Check HTML Markup Fast',
  'json-formatter': 'JSON Formatter Online Free | Format and Beautify JSON',
  'json-schema-validator': 'JSON Schema Validator Online | Validate JSON Schema',
  'json-to-csv': 'JSON to CSV Converter Online Free | Export JSON to CSV',
  'json-to-xml': 'JSON to XML Converter Online Free | Convert JSON Data',
  'json-to-yaml': 'JSON to YAML Converter Online Free | Convert JSON Data',
  'json-validator': 'JSON Validator Online Free | Validate and Format JSON',
  'jwt-decoder': 'JWT Decoder Online Free | Decode JWT Tokens Securely',
  'lorem-ipsum-generator': 'Lorem Ipsum Generator Online Free | Create Dummy Text',
  'markdown-to-html': 'Markdown to HTML Converter Online | Convert Markdown',
  'markdown-validator': 'Markdown Validator Online Free | Check Markdown Syntax',
  'number-base-converter': 'Number Base Converter Online | Binary Decimal Hex Tool',
  'password-generator': 'Password Generator Online | Generate Secure Passwords',
  'qr-code-generator': 'QR Code Generator Online Free | Create QR Codes Fast',
  'random-string-generator': 'Random String Generator Online | Create Random Text',
  'regex-tester': 'Regex Tester Online Free | Test Regular Expressions',
  'slug-generator': 'Slug Generator Online Free | Create URL Friendly Slugs',
  'sql-formatter': 'SQL Formatter Online Free | Format SQL Queries Fast',
  'temperature-converter': 'Temperature Converter Online | Celsius Fahrenheit Kelvin',
  'text-diff': 'Text Diff Checker Online Free | Compare Text Differences',
  'unix-timestamp-converter': 'Unix Timestamp Converter Online | Convert Epoch Time',
  'url-decode': 'URL Decoder Online Free | Decode URL Encoded Text Fast',
  'url-encode': 'URL Encoder Online Free | Encode Text for URLs Fast',
  'uuid-generator': 'UUID Generator Online Free | Generate UUID v4 IDs Fast',
  'xml-formatter': 'XML Formatter Online Free | Beautify XML Documents',
  'xml-minifier': 'XML Minifier Online Free | Compress XML Documents Fast',
  'xml-to-json': 'XML to JSON Converter Online Free | Convert XML Data',
  'xml-validator': 'XML Validator Online Free | Check XML Syntax Errors Fast',
  'yaml-to-json': 'YAML to JSON Converter Online Free | Convert YAML Data',
  'yaml-validator': 'YAML Validator Online Free | Check YAML Syntax Fast',
};

const descriptionOverrides: Record<string, string> = {
  'json-validator': 'Validate, format, and check JSON syntax instantly online. Free browser-based JSON validator with no uploads, signup, or installation required.',
  'jwt-decoder': 'Decode JWT tokens instantly in your browser. View headers, payloads, and claims securely without sending token data to servers.',
  'password-generator': 'Generate strong random passwords instantly online. Customize length, symbols, numbers, and letter options securely in your browser.',
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
    return `Validate ${label.replace(/ Validator$/, '')} syntax instantly online. Find formatting errors, check structure, and debug code securely in your browser.`;
  }

  if (slug.includes('formatter') || slug.includes('beautifier')) {
    return `Format and beautify ${label.replace(/ Formatter$| Beautifier$/, '')} code instantly online. Improve readability, indentation, and structure in your browser.`;
  }

  if (slug.includes('minifier')) {
    return `Minify ${label.replace(/ Minifier$/, '')} code instantly online. Remove extra whitespace and reduce file size for faster web performance.`;
  }

  if (slug.includes('decoder') || slug.includes('decode')) {
    return `Decode ${label.replace(/ Decoder$| Decode$/, '')} data instantly online. Convert encoded text back to readable output securely in your browser.`;
  }

  if (slug.includes('encoder') || slug.includes('encode')) {
    return `Encode ${label.replace(/ Encoder$| Encode$/, '')} data instantly online. Convert text into safe encoded output securely in your browser.`;
  }

  if (slug.includes('converter') || slug.includes('-to-')) {
    return `Convert ${label.replace(/ Converter$/, '')} instantly online. Transform developer data formats securely in your browser with no uploads required.`;
  }

  if (slug.includes('generator')) {
    return `Generate ${label.replace(/ Generator$/, '')} instantly online. Create developer-ready output securely in your browser with no signup required.`;
  }

  if (slug.includes('regex')) {
    return 'Test regular expressions instantly online. Check matches, debug patterns, and validate regex behavior securely in your browser.';
  }

  if (slug.includes('diff')) {
    return 'Compare text instantly online and highlight differences side by side. Free browser-based text diff checker with no uploads required.';
  }

  return `${tool.description}. Use this free online developer tool instantly in your browser with no uploads, signup, or installation required.`;
}

function buildSEOData(slug: string, tool: CodeTool): ToolSEOData {
  const label = formatToolName(slug);
  const title = titleOverrides[slug] || `${label} Online Free | ${tool.engine.charAt(0).toUpperCase() + tool.engine.slice(1)} Developer Tool`;
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
