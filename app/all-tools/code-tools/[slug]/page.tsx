'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getToolBySlug, CodeTool } from '@/app/lib/code-tools';
import { Copy, Download, RotateCcw, Play, ChevronRight, Zap, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

interface ToolOption {
  name: string;
  value: string | number | boolean;
}

// Map tool IDs to action-specific CTA text
const getActionText = (toolId: string): string => {
  const actionMap: Record<string, string> = {
    // Formatters
    'code-minifier': 'Minify Code',
    'code-beautifier': 'Beautify Code',
    'json-formatter': 'Format JSON',
    'html-formatter': 'Format HTML',
    'html-minifier': 'Minify HTML',
    'css-formatter': 'Format CSS',
    'css-minifier': 'Minify CSS',
    'xml-formatter': 'Format XML',
    'xml-minifier': 'Minify XML',
    'sql-formatter': 'Format SQL',
    // Converters
    'base64-encode': 'Encode to Base64',
    'base64-decode': 'Decode Base64',
    'url-encode': 'Encode URL',
    'url-decode': 'Decode URL',
    'case-converter': 'Convert Case',
    'json-to-csv': 'Convert to CSV',
    'csv-to-json': 'Convert to JSON',
    'json-to-xml': 'Convert to XML',
    'xml-to-json': 'Convert to JSON',
    'json-to-yaml': 'Convert to YAML',
    'yaml-to-json': 'Convert to JSON',
    'html-encode': 'Encode to HTML',
    'html-decode': 'Decode HTML',
    'slug-generator': 'Generate Slug',
    'base32-encode': 'Encode to Base32',
    'base32-decode': 'Decode Base32',
    'markdown-to-html': 'Convert to HTML',
    'escape-unescape': 'Escape/Unescape',
    'number-base-converter': 'Convert Base',
    'temperature-converter': 'Convert Temperature',
    'csv-json-converter': 'Convert Format',
    // Validators
    'json-validator': 'Validate JSON',
    'html-validator': 'Validate HTML',
    'xml-validator': 'Validate XML',
    'yaml-validator': 'Validate YAML',
    'markdown-validator': 'Validate Markdown',
    'jwt-decoder': 'Decode JWT',
    'regex-tester': 'Test Regex',
    'text-diff': 'Compare Text',
    'cron-expression-generator': 'Validate Cron',
    'json-schema-validator': 'Validate Schema',
    // Generators
    'uuid-generator': 'Generate UUID',
    'hash-generator': 'Generate Hash',
    'password-generator': 'Generate Password',
    'lorem-ipsum-generator': 'Generate Text',
    'random-string-generator': 'Generate String',
    'color-converter': 'Convert Color',
    'unix-timestamp-converter': 'Convert Timestamp',
    'qr-code-generator': 'Generate QR Code',
  };
  return actionMap[toolId] || 'Process';
};

// Get related tools for a given tool ID
const getRelatedTools = (toolId: string): { id: string; title: string; description: string }[] => {
  const relatedMap: Record<string, Array<{ id: string; title: string; description: string }>> = {
    // Formatters
    'code-minifier': [
      { id: 'code-beautifier', title: 'Code Beautifier', description: 'Beautify and format code' },
      { id: 'html-minifier', title: 'HTML Minifier', description: 'Minify HTML code' },
      { id: 'css-minifier', title: 'CSS Minifier', description: 'Minify CSS code' },
    ],
    'code-beautifier': [
      { id: 'code-minifier', title: 'Code Minifier', description: 'Minify code for production' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON code' },
    ],
    'json-formatter': [
      { id: 'json-validator', title: 'JSON Validator', description: 'Validate JSON syntax' },
      { id: 'json-to-csv', title: 'JSON to CSV', description: 'Convert JSON arrays to CSV' },
      { id: 'json-to-xml', title: 'JSON to XML', description: 'Convert JSON to XML format' },
    ],
    'html-formatter': [
      { id: 'html-validator', title: 'HTML Validator', description: 'Validate HTML code' },
      { id: 'html-minifier', title: 'HTML Minifier', description: 'Minify HTML code' },
    ],
    'html-minifier': [
      { id: 'html-formatter', title: 'HTML Formatter', description: 'Format HTML code' },
      { id: 'html-validator', title: 'HTML Validator', description: 'Validate HTML code' },
    ],
    'css-formatter': [
      { id: 'css-minifier', title: 'CSS Minifier', description: 'Minify CSS code' },
      { id: 'code-beautifier', title: 'Code Beautifier', description: 'Beautify code' },
    ],
    'css-minifier': [
      { id: 'css-formatter', title: 'CSS Formatter', description: 'Format CSS code' },
      { id: 'code-minifier', title: 'Code Minifier', description: 'Minify code' },
    ],
    'xml-formatter': [
      { id: 'xml-validator', title: 'XML Validator', description: 'Validate XML code' },
      { id: 'xml-minifier', title: 'XML Minifier', description: 'Minify XML code' },
      { id: 'xml-to-json', title: 'XML to JSON', description: 'Convert XML to JSON' },
    ],
    'xml-minifier': [
      { id: 'xml-formatter', title: 'XML Formatter', description: 'Format XML code' },
      { id: 'xml-validator', title: 'XML Validator', description: 'Validate XML code' },
    ],
    'sql-formatter': [
      { id: 'code-beautifier', title: 'Code Beautifier', description: 'Beautify code' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate hashes for data' },
    ],
    // Converters
    'base64-encode': [
      { id: 'base64-decode', title: 'Base64 Decoder', description: 'Decode Base64 to text' },
      { id: 'url-encode', title: 'URL Encoder', description: 'Encode text for URLs' },
      { id: 'html-encode', title: 'HTML Encoder', description: 'Encode HTML entities' },
    ],
    'base64-decode': [
      { id: 'base64-encode', title: 'Base64 Encoder', description: 'Encode text to Base64' },
      { id: 'jwt-decoder', title: 'JWT Decoder', description: 'Decode JWT tokens' },
      { id: 'url-decode', title: 'URL Decoder', description: 'Decode URL-encoded text' },
    ],
    'url-encode': [
      { id: 'url-decode', title: 'URL Decoder', description: 'Decode URL-encoded text' },
      { id: 'slug-generator', title: 'Slug Generator', description: 'Generate URL-friendly slugs' },
      { id: 'base64-encode', title: 'Base64 Encoder', description: 'Encode text to Base64' },
    ],
    'url-decode': [
      { id: 'url-encode', title: 'URL Encoder', description: 'Encode text for URLs' },
      { id: 'base64-decode', title: 'Base64 Decoder', description: 'Decode Base64 to text' },
    ],
    'case-converter': [
      { id: 'slug-generator', title: 'Slug Generator', description: 'Generate URL-friendly slugs' },
      { id: 'escape-unescape', title: 'Escape/Unescape', description: 'Escape special characters' },
    ],
    'json-to-csv': [
      { id: 'csv-to-json', title: 'CSV to JSON', description: 'Convert CSV to JSON format' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
      { id: 'csv-json-converter', title: 'CSV ↔ JSON Converter', description: 'Bidirectional conversion' },
    ],
    'csv-to-json': [
      { id: 'json-to-csv', title: 'JSON to CSV', description: 'Convert JSON arrays to CSV' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
      { id: 'csv-json-converter', title: 'CSV ↔ JSON Converter', description: 'Bidirectional conversion' },
    ],
    'json-to-xml': [
      { id: 'xml-to-json', title: 'XML to JSON', description: 'Convert XML to JSON format' },
      { id: 'xml-formatter', title: 'XML Formatter', description: 'Format XML code' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
    ],
    'xml-to-json': [
      { id: 'json-to-xml', title: 'JSON to XML', description: 'Convert JSON to XML format' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
      { id: 'xml-formatter', title: 'XML Formatter', description: 'Format XML code' },
    ],
    'json-to-yaml': [
      { id: 'yaml-to-json', title: 'YAML to JSON', description: 'Convert YAML to JSON format' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
    ],
    'yaml-to-json': [
      { id: 'json-to-yaml', title: 'JSON to YAML', description: 'Convert JSON to YAML format' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
      { id: 'yaml-validator', title: 'YAML Validator', description: 'Validate YAML syntax' },
    ],
    'html-encode': [
      { id: 'html-decode', title: 'HTML Decoder', description: 'Decode HTML entities' },
      { id: 'base64-encode', title: 'Base64 Encoder', description: 'Encode text to Base64' },
      { id: 'url-encode', title: 'URL Encoder', description: 'Encode text for URLs' },
    ],
    'html-decode': [
      { id: 'html-encode', title: 'HTML Encoder', description: 'Encode HTML entities' },
      { id: 'base64-decode', title: 'Base64 Decoder', description: 'Decode Base64 to text' },
    ],
    'slug-generator': [
      { id: 'url-encode', title: 'URL Encoder', description: 'Encode text for URLs' },
      { id: 'case-converter', title: 'Case Converter', description: 'Convert text case' },
    ],
    'base32-encode': [
      { id: 'base32-decode', title: 'Base32 Decoder', description: 'Decode Base32 to text' },
      { id: 'base64-encode', title: 'Base64 Encoder', description: 'Encode text to Base64' },
    ],
    'base32-decode': [
      { id: 'base32-encode', title: 'Base32 Encoder', description: 'Encode text to Base32' },
      { id: 'base64-decode', title: 'Base64 Decoder', description: 'Decode Base64 to text' },
    ],
    'markdown-to-html': [
      { id: 'html-formatter', title: 'HTML Formatter', description: 'Format HTML code' },
      { id: 'markdown-validator', title: 'Markdown Validator', description: 'Validate Markdown syntax' },
    ],
    'escape-unescape': [
      { id: 'case-converter', title: 'Case Converter', description: 'Convert text case' },
      { id: 'regex-tester', title: 'Regex Tester', description: 'Test regex patterns' },
    ],
    'number-base-converter': [
      { id: 'color-converter', title: 'Color Converter', description: 'Convert color formats' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate hashes' },
    ],
    'temperature-converter': [
      { id: 'number-base-converter', title: 'Number Base Converter', description: 'Convert number bases' },
      { id: 'unix-timestamp-converter', title: 'Timestamp Converter', description: 'Convert timestamps' },
    ],
    'csv-json-converter': [
      { id: 'json-to-csv', title: 'JSON to CSV', description: 'Convert JSON to CSV' },
      { id: 'csv-to-json', title: 'CSV to JSON', description: 'Convert CSV to JSON' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
    ],
    // Validators
    'json-validator': [
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
      { id: 'json-schema-validator', title: 'JSON Schema Validator', description: 'Validate JSON schema' },
      { id: 'json-to-csv', title: 'JSON to CSV', description: 'Convert valid JSON to CSV' },
    ],
    'html-validator': [
      { id: 'html-formatter', title: 'HTML Formatter', description: 'Format HTML code' },
      { id: 'html-minifier', title: 'HTML Minifier', description: 'Minify HTML code' },
    ],
    'xml-validator': [
      { id: 'xml-formatter', title: 'XML Formatter', description: 'Format XML code' },
      { id: 'xml-minifier', title: 'XML Minifier', description: 'Minify XML code' },
      { id: 'xml-to-json', title: 'XML to JSON', description: 'Convert XML to JSON' },
    ],
    'yaml-validator': [
      { id: 'yaml-to-json', title: 'YAML to JSON', description: 'Convert YAML to JSON' },
      { id: 'json-to-yaml', title: 'JSON to YAML', description: 'Convert JSON to YAML' },
    ],
    'markdown-validator': [
      { id: 'markdown-to-html', title: 'Markdown to HTML', description: 'Convert Markdown to HTML' },
      { id: 'code-beautifier', title: 'Code Beautifier', description: 'Format code blocks' },
    ],
    'jwt-decoder': [
      { id: 'base64-decode', title: 'Base64 Decoder', description: 'Decode Base64 to text' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate hashes' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format decoded payload' },
    ],
    'regex-tester': [
      { id: 'text-diff', title: 'Text Diff Checker', description: 'Compare matched text' },
      { id: 'escape-unescape', title: 'Escape/Unescape', description: 'Escape regex characters' },
    ],
    'text-diff': [
      { id: 'regex-tester', title: 'Regex Tester', description: 'Test patterns on text' },
      { id: 'escape-unescape', title: 'Escape/Unescape', description: 'Escape special chars' },
    ],
    'cron-expression-generator': [
      { id: 'unix-timestamp-converter', title: 'Unix Timestamp Converter', description: 'Convert time formats' },
    ],
    'json-schema-validator': [
      { id: 'json-validator', title: 'JSON Validator', description: 'Validate JSON data' },
      { id: 'json-formatter', title: 'JSON Formatter', description: 'Format JSON data' },
    ],
    // Generators
    'uuid-generator': [
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate cryptographic hashes' },
      { id: 'random-string-generator', title: 'Random String Generator', description: 'Generate random strings' },
      { id: 'password-generator', title: 'Password Generator', description: 'Generate secure passwords' },
    ],
    'hash-generator': [
      { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate unique IDs' },
      { id: 'password-generator', title: 'Password Generator', description: 'Generate secure passwords' },
      { id: 'random-string-generator', title: 'Random String Generator', description: 'Generate random strings' },
    ],
    'password-generator': [
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate hashes' },
      { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate unique IDs' },
      { id: 'random-string-generator', title: 'Random String Generator', description: 'Generate random strings' },
    ],
    'lorem-ipsum-generator': [
      { id: 'random-string-generator', title: 'Random String Generator', description: 'Generate random strings' },
      { id: 'case-converter', title: 'Case Converter', description: 'Convert text case' },
    ],
    'random-string-generator': [
      { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate unique IDs' },
      { id: 'password-generator', title: 'Password Generator', description: 'Generate secure passwords' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate hashes' },
    ],
    'color-converter': [
      { id: 'number-base-converter', title: 'Number Base Converter', description: 'Convert between bases' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate color hashes' },
    ],
    'unix-timestamp-converter': [
      { id: 'cron-expression-generator', title: 'Cron Expression Generator', description: 'Generate cron expressions' },
      { id: 'temperature-converter', title: 'Temperature Converter', description: 'Convert measurements' },
    ],
    'qr-code-generator': [
      { id: 'uuid-generator', title: 'UUID Generator', description: 'Generate unique data' },
      { id: 'url-encode', title: 'URL Encoder', description: 'Encode URLs for QR codes' },
      { id: 'hash-generator', title: 'Hash Generator', description: 'Generate data hashes' },
    ],
  };
  return relatedMap[toolId] || [];
};

export default function CodeToolPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [tool, setTool] = useState<CodeTool | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});

  // Initialize tool
  useEffect(() => {
    if (!slug) return;
    
    const foundTool = getToolBySlug(slug);
    if (!foundTool) {
      setError('Tool not found');
      return;
    }
    setTool(foundTool);

    // Initialize options with defaults
    const initialOptions: Record<string, any> = {};
    foundTool.options.forEach((opt) => {
      initialOptions[opt.name] = opt.default ?? '';
    });
    setOptions(initialOptions);
  }, [slug]);

  // Handle option change
  const handleOptionChange = (name: string, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Execute tool
  const handleExecute = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: slug,
          input: tool?.inputMode === 'none' ? undefined : input,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tool execution failed');
        setOutput('');
        return;
      }

      // Handle different output types
      if (tool?.outputMode === 'validation') {
        // Validation result
        const result = data.result;
        if (result.valid) {
          setSuccess('✓ ' + result.message);
        } else {
          setError('✗ ' + result.message);
        }
        setOutput(JSON.stringify(result, null, 2));
      } else if (typeof data.result === 'string') {
        setOutput(data.result);
        setSuccess('✓ Done');
      } else {
        setOutput(JSON.stringify(data.result, null, 2));
        setSuccess('✓ Done');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setSuccess('');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setSuccess('✓ Copied to clipboard');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to copy');
    }
  };

  // Download result
  const handleDownload = () => {
    try {
      const element = document.createElement('a');
      const file = new Blob([output], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${slug}-result.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setSuccess('✓ Downloaded');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to download');
    }
  };

  if (!tool) {
    return (
      <>
        <HomeHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Tool Not Found
              </h1>
              <p className="text-gray-600 mb-6">The requested tool does not exist.</p>
              <Link
                href="/all-tools/code-tools"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-0 font-medium"
              >
                Back to Tools
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const relatedTools = slug ? getRelatedTools(slug) : [];
  const actionText = slug ? getActionText(slug) : 'Process';

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
            >
              <Link href="/" className="hover:opacity-80">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools/code-tools" className="hover:opacity-80">Code Tools</Link>
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
                  <span className="text-2xl">{tool.icon}</span>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    {tool.title}
                  </h1>
                  <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }}>
                      Code Tool
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
            >
              {/* Left Column - Input & Options (Sticky) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-1"
              >
                <div className="sticky top-4 space-y-6">
                  {/* Input Card */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Input */}
                      {tool.inputMode !== 'none' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Input
                          </label>
                          <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder={`Enter ${tool.title.toLowerCase()} input...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Options */}
                      {tool.options.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900">Options</h3>
                      {tool.options.map((option) => (
                        <div key={option.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {option.label}
                          </label>

                          {option.type === 'select' && option.choices ? (
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                              value={options[option.name] || option.default || ''}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.value)
                              }
                            >
                              {option.choices.map((choice) => (
                                <option key={choice.value} value={choice.value}>
                                  {choice.label}
                                </option>
                              ))}
                            </select>
                          ) : option.type === 'number' ? (
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              value={options[option.name] || option.default || 0}
                              onChange={(e) =>
                                handleOptionChange(
                                  option.name,
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          ) : option.type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              checked={options[option.name] || false}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.checked)
                              }
                            />
                          ) : (
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                              value={options[option.name] || ''}
                              onChange={(e) =>
                                handleOptionChange(option.name, e.target.value)
                              }
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

                      {/* Execute Button */}
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                        onClick={handleExecute}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            {actionText}
                          </>
                        )}
                      </button>

                      <button
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 duration-0"
                        onClick={handleClear}
                      >
                        <RotateCcw size={16} />
                        Clear All
                      </button>
                    </div>
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
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>Engine: {tool.engine}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />
                      <span>Real-time Processing</span>
                    </div>
                  </div>
                </motion.div>

                {/* Output Box */}
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Output</h2>
                    </div>

                    <div className="p-6">
                      <textarea
                        readOnly
                        className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
                        value={output}
                      />
                      <div className="mt-4 flex gap-3">
                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium duration-0 flex items-center justify-center gap-2"
                          onClick={handleCopy}
                        >
                          <Copy size={16} />
                          Copy
                        </button>

                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium duration-0 flex items-center justify-center gap-2"
                          onClick={handleDownload}
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Status Messages */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-800 font-semibold text-sm">{success}</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Related Tools Section */}
            {relatedTools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-6xl mx-auto mt-20 bg-white rounded-xl shadow-lg border border-gray-200 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tools</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedTools.map((relTool) => (
                    <Link key={relTool.id} href={`/all-tools/code-tools/${relTool.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 shadow border border-gray-200 hover:shadow-lg transition h-full flex flex-col cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{relTool.title}</h3>
                        <p className="text-gray-600 text-sm flex-grow">{relTool.description}</p>
                        <div className="mt-3 text-green-600 text-sm font-medium flex items-center gap-1">
                          Open →
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Content Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="max-w-6xl mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8"
            >
              {/* How To Use Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to {actionText}</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">1</span>
                    <p className="text-gray-700">Enter or paste your content in the input field above</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">2</span>
                    <p className="text-gray-700">Adjust any available options to customize the output</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">3</span>
                    <p className="text-gray-700">Click the <strong>"{actionText}"</strong> button to process</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">4</span>
                    <p className="text-gray-700">View the result in the output section</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">5</span>
                    <p className="text-gray-700">Copy the result or download it as a file</p>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use This Tool</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      No Installation Required
                    </h3>
                    <p className="text-gray-600 text-sm">Use directly in your browser - no downloads or setup needed</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Free Forever
                    </h3>
                    <p className="text-gray-600 text-sm">Completely free with no hidden charges or premium plans</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Privacy First
                    </h3>
                    <p className="text-gray-600 text-sm">Your data is processed locally - nothing is stored on our servers</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Fast & Reliable
                    </h3>
                    <p className="text-gray-600 text-sm">Instant processing with consistent, accurate results</p>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  <details className="p-4 border border-gray-200 rounded-lg group cursor-pointer">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Is my data secure and private?
                      <span className="text-gray-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">Yes. All processing happens in your browser using client-side JavaScript. Your data is never sent to our servers and is not stored anywhere.</p>
                  </details>
                  <details className="p-4 border border-gray-200 rounded-lg group cursor-pointer">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Can I use this tool offline?
                      <span className="text-gray-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">Yes. If you've loaded the page once, you can use it offline. All computation happens in your browser without any server connection.</p>
                  </details>
                  <details className="p-4 border border-gray-200 rounded-lg group cursor-pointer">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      What browsers are supported?
                      <span className="text-gray-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">This tool works on all modern browsers including Chrome, Firefox, Safari, and Edge. It requires JavaScript to be enabled.</p>
                  </details>
                  <details className="p-4 border border-gray-200 rounded-lg group cursor-pointer">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Is there a limit on input size?
                      <span className="text-gray-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">Input is limited only by your browser's available memory. Most browsers can handle files up to several MB without issues.</p>
                  </details>
                  <details className="p-4 border border-gray-200 rounded-lg group cursor-pointer">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Can I use this for commercial purposes?
                      <span className="text-gray-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">Yes. Feel free to use this tool for any purpose, including commercial projects. No attribution is required.</p>
                  </details>
                </div>
              </div>

              {/* Best Practices Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Always verify the output before using it in production or important work</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Test with small samples first before processing large files</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Keep backups of original files in case you need to revert changes</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Understand the options available to customize the output to your needs</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Footer Feature Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20 mb-12">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: 'Instant Execution',
                    description: 'Execute and get results instantly with real-time processing',
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Safe',
                    description: 'Code is processed securely and automatically deleted after a short period. We do not permanently store your code or data',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Many Languages',
                    description: 'Support for multiple programming languages and operations',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
                  >
                    <div className="mb-4 flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <feature.icon size={24} className="text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
