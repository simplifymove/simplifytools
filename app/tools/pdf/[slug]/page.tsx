'use client';

import React, { useState, useRef } from 'react';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import { validatePdfInput } from '@/app/lib/pdf-validation';
import type { PdfToolConfig } from '@/app/lib/pdf-tools';
import { Upload, Download, AlertCircle, Loader } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PdfToolPage({ params }: PageProps) {
  // Unwrap params promise
  const resolvedParams = React.use(params);
  const tool = getPdfToolById(resolvedParams.slug);

  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
          <p className="text-gray-600">The requested PDF tool could not be found.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError('');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions({ ...options, [optionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate input
    const validation = validatePdfInput(tool, files, url);
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tool', tool.id);
      formData.append('options', JSON.stringify(options));

      // Add files or URL
      if (tool.inputMode === 'url') {
        formData.append('url', url);
      } else {
        for (const file of files) {
          formData.append('file', file);
        }
      }

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      // Get the output file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${tool.id}_output${tool.output}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setResult({ type: 'file', message: 'File downloaded successfully' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <tool.icon className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">{tool.title}</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">{tool.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
              {tool.category}
            </span>
            <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded">
              Input: {tool.inputMode}
            </span>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded">
              Output: {tool.output}
            </span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* File/URL Input */}
          <div className="mb-6">
            {tool.inputMode === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tool.inputMode === 'multi-file' ? 'Upload Files' : 'Upload File'}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {files.length > 0
                      ? `${files.length} file(s) selected`
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted: {tool.accepts.join(', ')}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={tool.inputMode === 'multi-file'}
                  accept={tool.accepts.join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Tool Options */}
          {tool.options && tool.options.length > 0 && (
            <div className="mb-6 space-y-4">
              <h3 className="font-medium text-gray-900">Options</h3>
              {tool.options.map((option) => (
                <div key={option.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {option.label}
                    {option.required && <span className="text-red-500">*</span>}
                  </label>
                  {option.type === 'select' && option.options ? (
                    <select
                      value={options[option.id] ?? option.default ?? ''}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {option.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : option.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={options[option.id] ?? option.default ?? false}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  ) : option.type === 'number' ? (
                    <input
                      type="number"
                      value={options[option.id] ?? option.default ?? ''}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      placeholder={option.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={option.type}
                      value={options[option.id] ?? option.default ?? ''}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder={option.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900">{result.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (tool.inputMode !== 'url' && files.length === 0)}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
              loading || (tool.inputMode !== 'url' && files.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Process PDF
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
