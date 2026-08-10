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
  'cron-expression-generator': 'Cron Expression Generator Online | Create Cron Jobs',
  'css-formatter': 'CSS Formatter Online | Beautify CSS Code',
  'css-minifier': 'CSS Minifier Online | Compress CSS Code Files',
  'csv-json-converter': 'CSV JSON Converter Online | Convert CSV and JSON',
  'csv-to-json': 'CSV to JSON Converter Online | Convert CSV Files',
  'escape-unescape': 'Escape Unescape Tool Online | Encode Special Characters',
  'hash-generator': 'Hash Generator Online | Generate MD5 SHA Hashes',
  'html-decode': 'HTML Decoder Online | Decode HTML Entities',
  'html-encode': 'HTML Encoder Online | Encode HTML Entities',
  'html-formatter': 'HTML Formatter Online | Beautify HTML Code',
  'html-minifier': 'HTML Minifier Online | Compress HTML Code',
  'html-validator': 'HTML Validator Online | Check HTML Markup',
  'json-formatter': 'JSON Formatter - Validate Syntax and Set Indentation',
  'json-schema-validator': 'JSON Schema Validator Online | Validate JSON Schema',
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
