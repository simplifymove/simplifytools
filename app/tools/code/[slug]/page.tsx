'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getToolBySlug, CodeTool } from '@/app/lib/code-tools';
import { Copy, Download, RotateCcw, Play, ChevronRight, Zap, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolOption {
  name: string;
  value: string | number | boolean;
}

export default function CodeToolPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tool, setTool] = useState<CodeTool | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});

  // Initialize tool
  useEffect(() => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Tool Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">The requested tool does not exist.</p>
          <Link
            href="/tools/code"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-0 font-medium"
          >
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Animated Gradient Header */}
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
          <Link href="/tools/code" className="hover:opacity-80">Code Tools</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            {tool.title}
          </h1>
          <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }}>
              Code Tool
            </span>
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
                        Execute
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
                  <span>Tool Type: {tool.category}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Real-time Processing</span>
                </div>
              </div>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Output</h2>
              </div>

              <textarea
                className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                readOnly
                value={output}
                placeholder="Output will appear here..."
              />

              {output && (
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
              )}
            </motion.div>

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

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
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
                description: 'Your code and data are never stored or logged',
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
  );
}
