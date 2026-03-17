'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dataTools, getDataToolById } from '@/app/lib/data-tools';
import { Download, AlertCircle, CheckCircle, Loader2, Upload, ChevronRight, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

interface FormData {
  [key: string]: string | number | boolean;
}

export default function DataToolPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const tool = getDataToolById(slug);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!tool) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 flex flex-col">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
              <p className="text-gray-600 mb-6">The requested tool "{slug}" does not exist.</p>
              <Link
                href="/tools/data"
                className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-0 font-medium"
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
      // Prepare form data
      const form = new FormData();
      form.append('tool', tool.id);
      form.append('file', selectedFile);
      form.append('options', JSON.stringify(formData));

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

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(true);

      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted.${tool.output}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-teal-600 to-emerald-700 overflow-hidden min-h-[280px] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-white text-sm mb-6"
        >
          <Link href="/" className="hover:opacity-80">Home</Link>
          <ChevronRight size={16} />
          <Link href="/tools/data" className="hover:opacity-80">Data Conversion</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
          <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-block text-white text-xs font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#0D9488' }}>
              {tool.engine}
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
                        Convert
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
                      if (downloadUrl) {
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = `converted.${tool.output}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
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

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
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
                description: 'Your files are never stored or shared with anyone',
              },
              {
                icon: CheckCircle,
                title: 'Multiple Formats',
                description: 'Support for wide range of file formats and conversions',
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
        </div>
      </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
