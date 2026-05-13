import { Metadata } from 'next';
import { getDataToolById } from '@/app/lib/data-tools';

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
    description: 'Convert CSV files to Excel format online. Fast, free CSV to XLSX converter. Upload your CSV file and download as Excel spreadsheet instantly.',
    keywords: ['CSV to Excel', 'CSV to XLSX', 'convert CSV', 'Excel converter', 'spreadsheet converter']
  },
  'excel-to-csv': {
    title: 'Excel to CSV Converter - Export XLSX to CSV Online',
    description: 'Convert Excel files to CSV format instantly. Free Excel to CSV converter. Export spreadsheet data to comma-separated values without signup.',
    keywords: ['Excel to CSV', 'XLSX to CSV', 'convert Excel', 'CSV export', 'spreadsheet conversion']
  },
  'xml-to-excel': {
    title: 'XML to Excel Converter - Transform XML Data to XLSX',
    description: 'Convert XML files to Excel spreadsheet format. Free online XML to XLSX converter with automatic data flattening and formatting.',
    keywords: ['XML to Excel', 'XML to XLSX', 'XML converter', 'data conversion', 'spreadsheet']
  },
  'xml-to-csv': {
    title: 'XML to CSV Converter - Extract Data to CSV',
    description: 'Convert XML data to CSV format instantly. Free online XML to CSV converter. Perfect for data extraction and spreadsheet import.',
    keywords: ['XML to CSV', 'XML converter', 'CSV export', 'data extraction', 'format conversion']
  },
  'excel-to-xml': {
    title: 'Excel to XML Converter - Export XLSX to XML Format',
    description: 'Convert Excel spreadsheets to XML format online. Free XLSX to XML converter. Transform your data with automatic XML structure generation.',
    keywords: ['Excel to XML', 'XLSX to XML', 'XML export', 'data conversion', 'spreadsheet to XML']
  },
  'excel-to-pdf': {
    title: 'Excel to PDF Converter - Export XLSX to PDF',
    description: 'Convert Excel spreadsheets to PDF instantly. Free online XLSX to PDF converter with formatting preservation and batch conversion support.',
    keywords: ['Excel to PDF', 'XLSX to PDF', 'convert spreadsheet', 'PDF export', 'document conversion']
  },
  'csv-to-json': {
    title: 'CSV to JSON Converter - Transform CSV to JSON Online',
    description: 'Convert CSV data to JSON format instantly. Free online CSV to JSON converter. Perfect for APIs, databases, and web development.',
    keywords: ['CSV to JSON', 'JSON converter', 'data conversion', 'API data', 'developer tool']
  },
  'json-to-xml': {
    title: 'JSON to XML Converter - Convert JSON to XML Format',
    description: 'Convert JSON data to XML format instantly. Free online JSON to XML converter. Perfect for data integration and system compatibility.',
    keywords: ['JSON to XML', 'XML converter', 'data transformation', 'format conversion', 'developer tool']
  },
  'xml-to-json': {
    title: 'XML to JSON Converter - Parse XML to JSON',
    description: 'Convert XML to JSON format online. Free XML to JSON converter. Parse XML documents and transform to JSON for APIs and databases.',
    keywords: ['XML to JSON', 'JSON converter', 'XML parser', 'data conversion', 'web development']
  },
  'csv-to-xml': {
    title: 'CSV to XML Converter - Transform CSV to XML Online',
    description: 'Convert CSV files to XML format instantly. Free online CSV to XML converter with automatic XML structure and element mapping.',
    keywords: ['CSV to XML', 'XML converter', 'data conversion', 'CSV to XML', 'structured data']
  },
  'split-csv': {
    title: 'CSV Splitter - Split Large CSV Files Online',
    description: 'Split large CSV files into smaller chunks online. Free CSV splitter tool. Perfect for handling large datasets and batch processing.',
    keywords: ['CSV splitter', 'split CSV', 'file splitter', 'large files', 'data processing']
  },
  'split-excel': {
    title: 'Excel Splitter - Split Large Excel Files Online',
    description: 'Split large Excel spreadsheets into smaller files. Free Excel splitter tool. Divide XLSX files by rows or sheets instantly.',
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
    description: tool.description || `Free online ${tool.title.toLowerCase()} tool. Convert data formats instantly without signup.`,
    keywords: [tool.title, 'converter', 'data tool', 'format conversion', 'free tool']
  };

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/data-converter/${slug}`;

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

export default function DataConverterSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
