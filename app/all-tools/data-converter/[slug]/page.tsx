'use client';

import { use, useState, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dataTools, getDataToolById } from '@/app/lib/data-tools';
import { Download, AlertCircle, CheckCircle, Loader2, Upload, ChevronRight, Zap, Shield, FileJson, FileText, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { createConvertedFilename } from '@/app/lib/data-validation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { PriorityToolGuide } from '@/app/components/PriorityToolGuide';

interface FormData {
  [key: string]: string | number | boolean;
}

// Action-specific CTA text for each data conversion tool
function getActionText(toolId: string): string {
  const actionMap: Record<string, string> = {
    'csv-to-excel': 'Convert to Excel',
    'excel-to-csv': 'Convert to CSV',
    'xml-to-excel': 'Convert to Excel',
    'xml-to-csv': 'Convert to CSV',
    'excel-to-xml': 'Convert to XML',
    'excel-to-pdf': 'Export to PDF',
    'csv-to-json': 'Convert to JSON',
    'json-to-xml': 'Convert to XML',
    'xml-to-json': 'Convert to JSON',
    'csv-to-xml': 'Convert to XML',
    'split-csv': 'Split CSV File',
    'split-excel': 'Split Excel File',
  };

  return actionMap[toolId] || 'Convert File';
}

// Related data conversion tools by category and type
function getRelatedTools(toolId: string): Array<{ id: string; title: string; description: string }> {
  const relatedMap: Record<string, Array<{ id: string; title: string; description: string }>> = {
    'csv-to-excel': [
      { id: 'excel-to-csv', title: 'Excel to CSV', description: 'Convert Excel back to CSV' },
      { id: 'csv-to-json', title: 'CSV to JSON', description: 'Transform CSV to JSON' },
      { id: 'csv-to-xml', title: 'CSV to XML', description: 'Convert CSV to XML format' },
      { id: 'split-csv', title: 'Split CSV', description: 'Divide large CSV files' },
    ],
    'excel-to-csv': [
      { id: 'csv-to-excel', title: 'CSV to Excel', description: 'Convert CSV to Excel' },
      { id: 'excel-to-xml', title: 'Excel to XML', description: 'Export Excel as XML' },
      { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert spreadsheet to PDF' },
      { id: 'split-excel', title: 'Split Excel', description: 'Split large Excel files' },
    ],
    'csv-to-json': [
      { id: 'json-to-xml', title: 'JSON to XML', description: 'Convert JSON to XML' },
      { id: 'csv-to-xml', title: 'CSV to XML', description: 'CSV to XML converter' },
      { id: 'xml-to-json', title: 'XML to JSON', description: 'Parse XML to JSON' },
      { id: 'csv-to-excel', title: 'CSV to Excel', description: 'Convert CSV to Excel' },
    ],
    'xml-to-json': [
      { id: 'json-to-xml', title: 'JSON to XML', description: 'Convert JSON to XML' },
      { id: 'xml-to-csv', title: 'XML to CSV', description: 'Extract XML to CSV' },
      { id: 'csv-to-json', title: 'CSV to JSON', description: 'CSV to JSON converter' },
      { id: 'xml-to-excel', title: 'XML to Excel', description: 'Convert XML to Excel' },
    ],
    'default': [
      { id: 'csv-to-json', title: 'CSV to JSON', description: 'Popular data format conversion' },
      { id: 'xml-to-json', title: 'XML to JSON', description: 'Structured data conversion' },
      { id: 'json-to-xml', title: 'JSON to XML', description: 'Reverse JSON conversion' },
      { id: 'csv-to-excel', title: 'CSV to Excel', description: 'Spreadsheet conversion' },
    ]
  };

  return relatedMap[toolId] || relatedMap['default'];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DataToolPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const tool = getDataToolById(slug);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [downloadPageUrl, setDownloadPageUrl] = useState<string | null>(null);

  // Generate FAQ schema for JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is the conversion accurate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our conversion engines maintain data integrity and formatting. However, we recommend reviewing the output before using it in production."
        }
      },
      {
        "@type": "Question",
        "name": "What file size limits do you have?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Files up to 100MB can be converted. For larger files, please split them first using our file splitting tools or process them in batches."
        }
      },
      {
        "@type": "Question",
        "name": "Is my data stored after conversion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Files are sent to our server for conversion. Temporary conversion files are cleaned up after the request, and the generated result may be retained briefly to provide your download link. Avoid uploading sensitive data."
        }
      },
      {
        "@type": "Question",
        "name": "Which encoding formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support UTF-8, Latin-1, ISO-8859-1, and Windows-1252 encodings. Your file encoding is automatically detected when possible."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert multiple files at once?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently you can convert one file at a time. For batch conversions, you can repeat the process or use our split/merge tools to organize data."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if conversion fails?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If an error occurs, you'll see a detailed message. Common issues: unsupported file format, corrupted data, or encoding problems. Try checking your file structure."
        }
      }
    ]
  };

  // Generate Breadcrumb schema for JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://simplifyconvert.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Data Tools",
        "item": "https://simplifyconvert.com/all-tools/data"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool?.title || "Tool",
        "item": `https://simplifyconvert.com/all-tools/data/${slug}`
      }
    ]
  };

  if (!tool) {
    notFound();
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
  }, []);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
        const inputElement = e.target as HTMLInputElement;
        setFormData((prev) => ({
          ...prev,
          [name]: inputElement.checked,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to convert');
      return;
    }

    // Validate file type
    const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExt || fileExt === '.' || !tool.accepts.includes(fileExt)) {
      setError(
        `Invalid file type. Accepted formats: ${tool.accepts.join(', ')}`
      );
      return;
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 100MB limit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build options with defaults applied
      const optionsWithDefaults: Record<string, any> = {};
      
      if (tool.options && tool.options.length > 0) {
        for (const option of tool.options) {
          // Use formData value if set, otherwise use default
          optionsWithDefaults[option.name] = 
            formData[option.name] !== undefined 
              ? formData[option.name] 
              : option.default;
        }
      }
      
      // Merge with any user-set formData values
      let finalOptions = { ...optionsWithDefaults, ...formData };

      // Convert camelCase option names to snake_case for Python backend
      const camelToSnakeMap: Record<string, string> = {
        rowsPerFile: 'rows_per_file',
        columnName: 'column_name',
        parts: 'num_parts',
        numParts: 'num_parts',
      };
      
      const snakeCaseOptions: Record<string, any> = {};
      for (const [key, value] of Object.entries(finalOptions)) {
        const snakeKey = camelToSnakeMap[key] || key;
        snakeCaseOptions[snakeKey] = value;
      }
      finalOptions = snakeCaseOptions;

      // Debug logging
      console.log(`[${tool.id}] final options (snake_case):`, finalOptions);

      // Prepare form data
      const form = new FormData();
      form.append('tool', tool.id);
      form.append('file', selectedFile);
      form.append('options', JSON.stringify(finalOptions));

      // Send to API
      const response = await fetch('/api/data-convert', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Conversion failed with status ${response.status}`
        );
      }

      // Get converted file
      const blob = await response.blob();
      const outputName = createConvertedFilename(tool.output);

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: tool.id,
        originalName: selectedFile.name,
        outputName,
      });

      setDownloadPageUrl(downloadResult.downloadPageUrl);
      setSuccess(true);
      router.push(downloadResult.downloadPageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      
      {/* JSON-LD Schema Markup */}
      {tool.id !== 'csv-to-json' && <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-teal-600 to-emerald-700 overflow-hidden min-h-[280px] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
        >
          <Link href="/" className="hover:opacity-80">Home</Link>
          <ChevronRight size={16} />
            <Link href="/all-tools/data" className="hover:opacity-80">Data Tools</Link>
          <ChevronRight size={16} />
          <span className="opacity-90">{tool.title}</span>
        </motion.div>

        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
              <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }}>
                  {tool.engine}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8"
        >
          {/* Left Column - Convert Form (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1"
          >
            <div className="sticky top-4 space-y-6">
              {/* Input Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Convert</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File
                    </label>
                    <div className="relative border-2 border-dashed border-teal-300 rounded-lg p-6 hover:border-teal-400 transition cursor-pointer bg-teal-50">
                      <input
                        type="file"
                        accept={tool.accepts.join(',')}
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                        <p className="text-gray-900 font-medium text-sm">
                          {selectedFile ? selectedFile.name : 'Click to select'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {tool.accepts.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tool Options */}
                  {tool.options && tool.options.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Options</h3>
                      {tool.options.map((option) => (
                        <div key={option.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {option.label}
                            {option.required && <span className="text-red-500">*</span>}
                          </label>

                          {option.type === 'select' && (
                            <select
                              name={option.name}
                              value={String(formData[option.name] ?? option.default ?? '')}
                              onChange={handleFormChange}
                              disabled={loading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                            >
                              {option.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {option.type === 'text' && (
                            <input
                              type="text"
                              name={option.name}
                              value={String(formData[option.name] ?? option.default ?? '')}
                              onChange={handleFormChange}
                              placeholder={option.placeholder}
                              disabled={loading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          )}

                          {option.type === 'number' && (
                            <input
                              type="number"
                              name={option.name}
                              value={String(formData[option.name] ?? option.default ?? '')}
                              onChange={handleFormChange}
                              min={option.min}
                              max={option.max}
                              disabled={loading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          )}

                          {option.type === 'checkbox' && (
                            <input
                              type="checkbox"
                              name={option.name}
                              checked={(formData[option.name] as boolean) || false}
                              onChange={handleFormChange}
                              disabled={loading}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        {tool ? getActionText(tool.id) : 'Convert'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Output & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Info Box */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {tool.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
                  <span>Input: {tool.accepts.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
                  <span>Output: .{tool.output}</span>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-teal-600" />
                  <h2 className="text-xl font-bold text-gray-900">Conversion Complete</h2>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-green-800 text-sm">
                    Your file has been converted successfully and is ready to download!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (downloadPageUrl) {
                        router.push(downloadPageUrl);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium duration-0 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </motion.div>
            )}

            {!success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <Upload size={32} className="text-teal-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to convert</h3>
                <p className="text-gray-600">Select a file and click Convert to get started</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {tool.id === 'csv-to-json' && <PriorityToolGuide toolId="csv-to-json" />}
        {tool.id !== 'csv-to-json' && (<>
        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-7xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Fast Conversion',
                description: 'Convert files instantly with our optimized processing engine',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Files are sent to our server for conversion. Temporary conversion files are cleaned up after the request, and the result may be retained briefly for download.'
              },
              {
                icon: CheckCircle,
                title: 'Multiple Formats',
                description: 'Support for CSV, Excel, JSON, XML and more. Convert between common data formats with configurable options.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <feature.icon size={24} className="text-teal-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SEO Content Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="max-w-4xl mx-auto mt-24 space-y-16">
          {/* How-To Guide Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to {getActionText(tool.id)}</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>Select your file:</strong> Click the upload area and choose the {tool.accepts.join(' or ')} file you want to convert.
              </li>
              <li className="text-gray-700">
                <strong>Configure options (if needed):</strong> Adjust conversion settings like delimiter, encoding, or format preferences.
              </li>
              <li className="text-gray-700">
                <strong>Click {getActionText(tool.id)}:</strong> Hit the button to start processing your file conversion.
              </li>
              <li className="text-gray-700">
                <strong>Download your file:</strong> Once ready, download your converted .{tool.output} file directly to your computer.
              </li>
            </ol>
          </section>

          {/* Why Use This Tool Section */}
          <section className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use {tool.title}?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Lightning Fast',
                  description: 'Process your files instantly without slow uploads or complex software.'
                },
                {
                  title: 'No Sign-Up Required',
                  description: 'Use immediately without account creation, email verification, or payment information.'
                },
                {
                  title: 'Secure Processing',
                  description: 'Files are sent to our server for conversion, and temporary conversion files are cleaned up after the request.'
                },
                {
                  title: 'Batch Ready',
                  description: 'Handle large files efficiently with support for files up to 100MB in size.'
                }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-700 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Is the conversion accurate?',
                  a: 'Yes, our conversion engines maintain data integrity and formatting. However, we recommend reviewing the output before using it in production.'
                },
                {
                  q: 'What file size limits do you have?',
                  a: 'Files up to 100MB can be converted. For larger files, please split them first using our file splitting tools or process them in batches.'
                },
                {
                  q: 'Is my data stored after conversion?',
                  a: 'Files are sent to our server for conversion. Temporary conversion files are cleaned up after the request, and the generated result may be retained briefly to provide your download link. Avoid uploading sensitive data.'
                },
                {
                  q: 'Which encoding formats are supported?',
                  a: 'We support UTF-8, Latin-1, ISO-8859-1, and Windows-1252 encodings. Your file encoding is automatically detected when possible.'
                },
                {
                  q: 'Can I convert multiple files at once?',
                  a: 'Currently you can convert one file at a time. For batch conversions, you can repeat the process or use our split/merge tools to organize data.'
                },
                {
                  q: 'What happens if conversion fails?',
                  a: 'If an error occurs, you\'ll see a detailed message. Common issues: unsupported file format, corrupted data, or encoding problems. Try checking your file structure.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedToolsSection
            family="data"
            toolId={tool.id}
            description="Explore other data conversion tools that might be useful for your workflow."
            limit={8}
          />

          {/* Data Safety & Best Practices Section */}
          <section className="bg-blue-50 rounded-xl border border-blue-200 p-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Data Conversion Best Practices</h3>
                <ul className="text-blue-900 text-sm space-y-2 list-disc list-inside">
                  <li>Always keep backups of your original files before conversion</li>
                  <li>Review converted data for completeness before using in production</li>
                  <li>Test conversions with sample files before processing large datasets</li>
                  <li>Verify data integrity after complex multi-step conversions</li>
                  <li>Check for special characters or formatting that may not convert perfectly</li>
                  <li>Document your conversion settings if you need to repeat the process</li>
                </ul>
              </div>
            </div>
          </section>
        </motion.div>
        </>)}
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
