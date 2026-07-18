'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
import Link from 'next/link';
import { getToolBySlug, CodeTool } from '@/app/lib/code-tools';
import {
  Binary,
  Braces,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Database,
  Dice1,
  Download,
  FileText,
  GitCompare,
  Hash,
  Link2,
  Loader2,
  Lock,
  Palette,
  Play,
  QrCode,
  RotateCcw,
  RotateCw,
  SearchCheck,
  Shield,
  Shuffle,
  Slash,
  Sparkles,
  Table,
  Thermometer,
  Type,
  Unlock,
  Watch,
  Zap,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';

interface ToolOption {
  name: string;
  value: string | number | boolean;
}

interface ToolSEOContent {
  whatItDoes: string;
  whenToUse: string[];
  example?: {
    inputLabel: string;
    input: string;
    outputLabel: string;
    output: string;
  };
  tips: string[];
  privacyNote: string;
}

const faqItems = [
  {
    question: 'Is my data secure and private?',
    answer: 'Yes. All processing happens in your browser using client-side JavaScript. Your data is never sent to our servers and is not stored anywhere.',
  },
  {
    question: 'Can I use this tool offline?',
    answer: "Yes. If you've loaded the page once, you can use it offline. All computation happens in your browser without any server connection.",
  },
  {
    question: 'What browsers are supported?',
    answer: 'This tool works on all modern browsers including Chrome, Firefox, Safari, and Edge. It requires JavaScript to be enabled.',
  },
  {
    question: 'Is there a limit on input size?',
    answer: "Input is limited only by your browser's available memory. Most browsers can handle files up to several MB without issues.",
  },
  {
    question: 'Can I use this for commercial purposes?',
    answer: 'Yes. Feel free to use this tool for any purpose, including commercial projects. No attribution is required.',
  },
];

const codeToolIcons: Record<string, LucideIcon> = {
  Binary,
  Braces,
  CheckCircle,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Dice1,
  FileText,
  GitCompare,
  Hash,
  Link: Link2,
  Link2,
  Lock,
  Palette,
  QrCode,
  RotateCw,
  SearchCheck,
  Shuffle,
  Slash,
  Sparkles,
  Table,
  Thermometer,
  Type,
  Unlock,
  Watch,
  Zap,
};

function getCleanToolTitle(title: string) {
  return title.replace(/^[^A-Za-z0-9]+/, '').trim();
}

const toolSeoContent: Record<string, ToolSEOContent> = {
  'json-validator': {
    whatItDoes: 'The JSON Validator checks whether pasted JSON is valid, highlights syntax problems, and helps you confirm that objects, arrays, strings, numbers, booleans, and null values are structured correctly before you use the data in an API, configuration file, or application.',
    whenToUse: [
      'Before sending JSON payloads to an API endpoint.',
      'When debugging malformed responses from a backend service.',
      'Before saving JSON in application configuration or environment files.',
      'When you need to confirm commas, quotes, brackets, and nesting are correct.',
    ],
    example: {
      inputLabel: 'Example JSON input',
      input: '{\n  "name": "SimplifyConvert",\n  "active": true,\n  "tools": ["validator", "formatter"]\n}',
      outputLabel: 'Example validation result',
      output: 'Valid JSON. The object contains a string, a boolean, and an array with two string values.',
    },
    tips: [
      'Use double quotes around JSON object keys and string values.',
      'Remove trailing commas after the final item in an object or array.',
      'Check that every opening brace or bracket has a matching closing character.',
      'Validate copied API responses before pasting them into production code.',
    ],
    privacyNote: 'JSON validation runs in your browser, so pasted JSON is not uploaded to a server by this page. Avoid sharing secrets, tokens, or private customer data in screenshots or copied examples.',
  },
  'xml-to-json': {
    whatItDoes: 'The XML to JSON converter transforms XML markup into a JSON-style structure so it is easier to inspect, pass into JavaScript code, or adapt for modern API workflows. It is useful when moving data from document-style XML into object-based formats.',
    whenToUse: [
      'When integrating legacy XML feeds with JavaScript or JSON-based APIs.',
      'When you need to inspect XML data as nested objects and arrays.',
      'Before migrating configuration, export, or partner data from XML to JSON.',
      'When comparing XML fields with JSON payloads during debugging.',
    ],
    example: {
      inputLabel: 'Example XML input',
      input: '<user>\n  <name>Ada</name>\n  <role>developer</role>\n</user>',
      outputLabel: 'Example JSON output',
      output: '{\n  "user": {\n    "name": "Ada",\n    "role": "developer"\n  }\n}',
    },
    tips: [
      'Make sure the XML is well formed before converting it.',
      'Watch for repeated XML elements because they may become arrays in JSON.',
      'Review attributes and namespaces after conversion since different tools represent them differently.',
      'Validate the converted JSON before using it in an API request.',
    ],
    privacyNote: 'XML conversion happens in the browser for this tool page. Still, remove passwords, API keys, access tokens, or sensitive customer records before using sample data.',
  },
  'jwt-decoder': {
    whatItDoes: 'The JWT Decoder splits a JSON Web Token into its header and payload so you can inspect claims such as issuer, subject, audience, expiration time, and custom application fields. Decoding makes the token readable, but it does not prove the signature is valid.',
    whenToUse: [
      'When debugging authentication or authorization flows.',
      'When checking token claims such as exp, iss, aud, sub, or roles.',
      'When confirming whether a JWT is expired or contains the expected user context.',
      'When comparing tokens returned by staging, local, and production identity providers.',
    ],
    example: {
      inputLabel: 'Example JWT input',
      input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJyb2xlIjoiYWRtaW4ifQ.signature',
      outputLabel: 'Example decoded payload',
      output: '{\n  "sub": "123",\n  "role": "admin"\n}',
    },
    tips: [
      'Decoding a JWT is not the same as verifying its signature.',
      'Check exp and nbf claims when troubleshooting login or session issues.',
      'Do not trust decoded claims until your backend verifies the token signature.',
      'Use sample or redacted tokens when documenting authentication bugs.',
    ],
    privacyNote: 'JWT decoding is intended for inspection in your browser. Real tokens can grant access to accounts or APIs, so avoid pasting live production tokens unless you understand the risk.',
  },
  'password-generator': {
    whatItDoes: 'The Password Generator creates random passwords using the selected length and character options. It is designed for quickly producing stronger credentials than human-chosen passwords, especially when combined with a password manager.',
    whenToUse: [
      'When creating a new account password.',
      'When rotating credentials after a security review.',
      'When generating temporary passwords for development or testing.',
      'When you need multiple random passwords with consistent character rules.',
    ],
    example: {
      inputLabel: 'Example options',
      input: 'Length: 16\nUppercase: yes\nLowercase: yes\nNumbers: yes\nSymbols: yes',
      outputLabel: 'Example generated password',
      output: 'N7q!vR2#sL9@pX4z',
    },
    tips: [
      'Use longer passwords when a service allows them.',
      'Include multiple character types unless a site has specific restrictions.',
      'Store generated passwords in a trusted password manager.',
      'Do not reuse generated passwords across different accounts.',
    ],
    privacyNote: 'Password generation runs locally in the browser on this page. After generating a password, save it securely and avoid sending it through chat, email, logs, or screenshots.',
  },
};

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

export default function CodeToolPage() {
  const router = useRouter();
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
  const handleDownload = async () => {
    try {
      if (!slug) {
        setError('Unable to prepare download');
        return;
      }

      const outputName = `${slug}-result.txt`;
      const blob = new Blob([output], { type: 'text/plain' });

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: slug,
        originalName: outputName,
        outputName,
      });

      router.push(downloadResult.downloadPageUrl);
      setSuccess('✓ Ready to download');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to prepare download');
    }
  };

  if (!tool) {
    return (
      <>
        <HomeHeader />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
        </main>
        <Footer />
      </>
    );
  }

  const actionText = slug ? getActionText(slug) : 'Process';
  const ToolIcon = codeToolIcons[tool.icon] || Code2;
  const displayTitle = getCleanToolTitle(tool.title);
  const seoContent = slug ? toolSeoContent[slug] : undefined;
  const baseUrl = 'https://simplifyconvert.com';
  const toolUrl = `${baseUrl}/all-tools/code-tools/${slug}`;
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    url: toolUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools',
        item: `${baseUrl}/all-tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Code Tools',
        item: `${baseUrl}/all-tools/code-tools`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.title,
        item: toolUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <HomeHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden min-h-[280px] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-2 text-white text-sm mb-6"
              >
                <Link href="/" className="hover:opacity-80">Home</Link>
                <ChevronRight size={16} />
                <Link href="/all-tools/code-tools" className="hover:opacity-80">Code Tools</Link>
                <ChevronRight size={16} />
                <span className="opacity-90">{displayTitle}</span>
              </motion.div>

              {/* Header Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ToolIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                      {displayTitle}
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
            {slug && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-6xl mx-auto mt-20"
              >
                <RelatedToolsSection
                  family="code"
                  toolId={slug}
                  limit={8}
                  title="Related Tools"
                  description="Explore related developer tools that can help with the same workflow."
                />
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

              {seoContent && (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What this tool does</h2>
                    <p className="text-gray-700 leading-relaxed">{seoContent.whatItDoes}</p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">When to use it</h2>
                    <ul className="space-y-3 text-gray-700">
                      {seoContent.whenToUse.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="text-green-600 font-bold">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {seoContent.example && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Example input and output</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <h3 className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                            {seoContent.example.inputLabel}
                          </h3>
                          <pre className="p-4 text-sm text-gray-800 overflow-auto whitespace-pre-wrap font-mono">
                            {seoContent.example.input}
                          </pre>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <h3 className="bg-gray-50 border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                            {seoContent.example.outputLabel}
                          </h3>
                          <pre className="p-4 text-sm text-gray-800 overflow-auto whitespace-pre-wrap font-mono">
                            {seoContent.example.output}
                          </pre>
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Common errors or tips</h2>
                    <ul className="space-y-3 text-gray-700">
                      {seoContent.tips.map((tip) => (
                        <li key={tip} className="flex gap-3">
                          <span className="text-green-600 font-bold">-</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and security note</h2>
                    <p className="text-gray-700 leading-relaxed">{seoContent.privacyNote}</p>
                  </section>
                </div>
              )}

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
