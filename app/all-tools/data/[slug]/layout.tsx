import { Metadata } from 'next';
import { getDataViewToolById } from '@/app/lib/data-view-tools';

interface Params {
  slug: string;
}

// Comprehensive SEO metadata database for all data view tools
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  'csv-to-json': {
    title: 'CSV to JSON Converter - Transform CSV to JSON Online',
    description: 'Convert CSV files to JSON format instantly. Free online CSV to JSON converter perfect for APIs and database imports. No signup required.',
    keywords: ['CSV to JSON', 'CSV converter', 'JSON converter', 'data conversion', 'format converter']
  },
  'json-to-csv': {
    title: 'JSON to CSV Converter - Export JSON to CSV Online',
    description: 'Transform JSON data to CSV spreadsheet format. Free JSON to CSV converter for Excel and data analysis. Fast and secure.',
    keywords: ['JSON to CSV', 'export JSON', 'CSV export', 'data conversion', 'spreadsheet']
  },
  'json-to-xml': {
    title: 'JSON to XML Converter - Convert JSON to XML Online',
    description: 'Convert JSON data to XML format. Free online JSON to XML converter for APIs and data integration.',
    keywords: ['JSON to XML', 'XML converter', 'JSON converter', 'data transformation', 'format conversion']
  },
  'xml-to-json': {
    title: 'XML to JSON Converter - Parse XML to JSON Online',
    description: 'Parse XML and convert to JSON instantly. Free XML to JSON converter for API integration and data transformation.',
    keywords: ['XML to JSON', 'JSON converter', 'XML parser', 'data conversion', 'API data']
  },
  'yaml-to-json': {
    title: 'YAML to JSON Converter - Convert YAML to JSON Online',
    description: 'Convert YAML configuration files to JSON format. Free YAML to JSON converter for DevOps and data management.',
    keywords: ['YAML to JSON', 'YAML converter', 'JSON converter', 'config conversion', 'DevOps tools']
  },
  'json-to-yaml': {
    title: 'JSON to YAML Converter - Transform JSON to YAML Online',
    description: 'Convert JSON to human-readable YAML format. Free JSON to YAML converter for configuration files.',
    keywords: ['JSON to YAML', 'YAML converter', 'config files', 'data conversion', 'YAML format']
  },
  'tsv-to-csv': {
    title: 'TSV to CSV Converter - Convert Tab-Separated Values Online',
    description: 'Convert TSV (tab-separated values) to CSV format instantly. Free TSV to CSV converter for spreadsheet data.',
    keywords: ['TSV to CSV', 'TSV converter', 'CSV converter', 'data conversion', 'spreadsheet']
  },
  'sql-to-json': {
    title: 'SQL to JSON Converter - Generate JSON from SQL Online',
    description: 'Convert SQL CREATE TABLE statements to JSON schema. Free SQL to JSON converter for documentation and migration.',
    keywords: ['SQL to JSON', 'JSON converter', 'schema conversion', 'database', 'SQL tools']
  },
  'json-to-sql': {
    title: 'JSON to SQL Converter - Generate SQL Inserts from JSON',
    description: 'Generate SQL INSERT statements from JSON data. Free JSON to SQL converter for database population.',
    keywords: ['JSON to SQL', 'SQL generator', 'database', 'INSERT statements', 'data import']
  },

  'csv-viewer': {
    title: 'CSV Viewer - View CSV Files in Table Format',
    description: 'View and inspect CSV files in a formatted table. Free online CSV viewer for data analysis and inspection.',
    keywords: ['CSV viewer', 'view CSV', 'data viewer', 'table viewer', 'CSV tool']
  },
  'json-viewer': {
    title: 'JSON Viewer - Visualize JSON with Tree Structure',
    description: 'View JSON with an interactive collapsible tree. Free JSON viewer for navigating complex data structures.',
    keywords: ['JSON viewer', 'JSON tree', 'visualize JSON', 'data viewer', 'developer tool']
  },
  'xml-viewer': {
    title: 'XML Viewer - Visualize XML Tree Structure',
    description: 'View XML with a collapsible tree structure. Free online XML viewer for complex document navigation.',
    keywords: ['XML viewer', 'XML tree', 'visualize XML', 'data viewer', 'XML tool']
  },
  'yaml-viewer': {
    title: 'YAML Viewer - View YAML with Syntax Highlighting',
    description: 'View YAML configuration files with syntax highlighting. Free online YAML viewer for DevOps and config files.',
    keywords: ['YAML viewer', 'view YAML', 'syntax highlight', 'configuration viewer', 'DevOps']
  },
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getDataViewToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  // Get tool-specific SEO data or use intelligent fallback
  const seoData = toolSEODatabase[slug] || {
    title: `${tool.title} - Free Data Tool | SimplifyConvert`,
    description: tool.description || `Free online ${tool.title.toLowerCase()}. Transform, format, and validate data instantly.`,
    keywords: [tool.title, 'data tool', 'converter', 'formatter', 'free tool']
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

export default function DataViewToolSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
