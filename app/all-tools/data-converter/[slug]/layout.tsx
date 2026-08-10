import { Metadata } from 'next';
import { getDataToolById } from '@/app/lib/data-tools';
import { generateSoftwareApplicationSchema } from '@/app/lib/seo';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

// Comprehensive SEO metadata database for all 12 data conversion tools
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  'csv-to-excel': {
    title: 'CSV to Excel Converter - Convert CSV Files to XLSX',
    description: 'Convert CSV files to XLSX using selectable delimiters, character encoding, sheet naming, and optional column auto-sizing. Review the generated spreadsheet before using it.',
    keywords: ['CSV to Excel', 'CSV to XLSX', 'convert CSV', 'Excel converter', 'spreadsheet converter']
  },
  'excel-to-csv': {
    title: 'Excel to CSV - Export One Sheet or All Sheets as ZIP',
    description: 'Export the first Excel worksheet as CSV or package every worksheet as a separate UTF-8 CSV in a ZIP, with selectable delimiters.',
    keywords: ['Excel to CSV', 'XLSX to CSV', 'convert Excel', 'CSV export', 'spreadsheet conversion']
  },
  'xml-to-excel': {
    title: 'XML to Excel Converter - Transform XML Data to XLSX',
    description: 'Convert repeating XML records to an XLSX worksheet using the specified item tag. Nested XML data is flattened for spreadsheet output, so review the generated structure.',
    keywords: ['XML to Excel', 'XML to XLSX', 'XML converter', 'data conversion', 'spreadsheet']
  },
  'xml-to-csv': {
    title: 'XML to CSV Converter - Extract Data to CSV',
    description: 'Convert repeating XML records to CSV using the specified item tag and selected delimiter. Review flattened fields and generated column values before using the result.',
    keywords: ['XML to CSV', 'XML converter', 'CSV export', 'data extraction', 'format conversion']
  },
  'excel-to-xml': {
    title: 'Excel to XML Converter - Export XLSX to XML Format',
    description: 'Convert supported Excel spreadsheets to XML using configurable root and item tag names. Review the generated XML structure and values before using the result.',
    keywords: ['Excel to XML', 'XLSX to XML', 'XML export', 'data conversion', 'spreadsheet to XML']
  },
  'excel-to-pdf': {
    title: 'Excel to PDF Converter - Export XLSX to PDF',
    description: 'Convert supported Excel spreadsheets to PDF using first-sheet or all-sheet export, page orientation, and fit-to-width options. PDF layout can differ from the source workbook.',
    keywords: ['Excel to PDF', 'XLSX to PDF', 'convert spreadsheet', 'PDF export', 'document conversion']
  },
  'csv-to-json': {
    title: 'CSV to JSON Converter - Headers, Delimiters & Types',
    description: 'Convert a comma, semicolon, tab, or pipe-delimited CSV into an array of JSON row objects, with guidance for headers, inferred types, malformed rows, and encoding.',
    keywords: ['CSV to JSON', 'JSON converter', 'data conversion', 'API data', 'developer tool']
  },
  'json-to-xml': {
    title: 'JSON to XML with Custom Root and Item Elements',
    description: 'Convert JSON objects and arrays to element-based XML using validated custom root and top-level item names, with explicit type and attribute limitations.',
    keywords: ['JSON to XML', 'XML converter', 'data transformation', 'format conversion', 'developer tool']
  },
  'xml-to-json': {
    title: 'XML to JSON Converter - Parse XML to JSON',
    description: 'Parse supported XML documents and convert their structure to JSON. Review arrays, attributes, nested elements, and generated value types before using the result.',
    keywords: ['XML to JSON', 'JSON converter', 'XML parser', 'data conversion', 'web development']
  },
  'csv-to-xml': {
    title: 'CSV to XML Converter - Transform CSV to XML Online',
    description: 'Convert CSV rows to XML using the available delimiter and structure options. Review generated element names, values, and document structure before using the result.',
    keywords: ['CSV to XML', 'XML converter', 'data conversion', 'CSV to XML', 'structured data']
  },
  'split-csv': {
    title: 'CSV Splitter - Split Large CSV Files Online',
    description: 'Split supported CSV files into smaller chunks using the available row-based splitting options. Output size and processing time depend on the source file and selected settings.',
    keywords: ['CSV splitter', 'split CSV', 'file splitter', 'large files', 'data processing']
  },
  'split-excel': {
    title: 'Excel Splitter - Split Large Excel Files Online',
    description: 'Split supported Excel workbooks into smaller files using the available row or sheet options. Output structure depends on the workbook and selected split settings.',
    keywords: ['Excel splitter', 'split Excel', 'XLSX splitter', 'spreadsheet tool', 'file splitting']
  },
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getDataToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  // Get tool-specific SEO data or use intelligent fallback
  const seoData = toolSEODatabase[slug] || {
    title: `${tool.title} - Free Data Conversion Tool | SimplifyConvert`,
    description: tool.description || `Use the ${tool.title.toLowerCase()} tool for its supported data-processing workflow. Review the generated result before using it.`,
    keywords: [tool.title, 'converter', 'data tool', 'format conversion', 'free tool']
  };

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/data/${slug}`;

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
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
          alt: tool.title,
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

export default async function DataConverterSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = getDataToolById(slug);

  if (!tool) {
    notFound();
  }

  const softwareSchema = generateSoftwareApplicationSchema({
    name: tool.title,
    description: tool.description,
    url: `https://simplifyconvert.com/all-tools/data/${slug}`,
    applicationCategory: 'UtilitiesApplication',
  });

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
