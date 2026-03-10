'use client';

import React, { useState, useRef, use } from 'react';
import { getToolById } from '@/app/lib/video-tools';
import { validateToolInput } from '@/app/lib/media-validation';
import type { VideoTool } from '@/app/lib/video-tools';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function VideoToolPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tool = getToolById(resolvedParams.slug);
  const [file, setFile] = useState<File | null>(null);
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
          <p className="text-gray-600">The requested tool could not be found.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
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
    const validation = validateToolInput(tool, { file: file || undefined, url });
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('tool', resolvedParams.slug);

      if (file) {
        formData.append('file', file);
      }

      if (url) {
        formData.append('url', url);
      }

      // Add options
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setResult(data);
      } else if (contentType?.includes('text')) {
        const text = await response.text();
        setResult({ content: text, type: 'text' });
      } else {
        // Binary file
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `output${getFileExtension(tool.outputType)}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        setResult({ type: 'file', message: 'File downloaded successfully' });
      }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tool.title}</h1>
          <p className="text-lg text-gray-600">{tool.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
              {tool.category}
            </span>
            <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded">
              Engine: {tool.engine}
            </span>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* File/URL Input */}
          <div className="mb-6">
            {(tool.inputMethod === 'file' || tool.inputMethod === 'both') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload {tool.inputMethod === 'both' ? 'File (or use URL below)' : 'File'}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
                >
                  <div className="text-gray-600">
                    <p className="text-lg font-medium mb-1">
                      {file ? file.name : 'Click to upload'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported: {tool.accepts.join(', ')}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={tool.accepts.join(',')}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {(tool.inputMethod === 'url' || tool.inputMethod === 'both') && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  {tool.inputMethod === 'both' ? 'Or enter URL' : 'Enter URL'}
                </label>
                <input
                  id="url"
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Tool Options */}
          {tool.options.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.options.map((option) => (
                  <div key={option.id}>
                    <label htmlFor={option.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {option.label}
                      {option.required && <span className="text-red-500">*</span>}
                    </label>

                    {option.type === 'select' && (
                      <select
                        id={option.id}
                        value={options[option.id] ?? option.default ?? ''}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {option.type === 'number' && (
                      <input
                        id={option.id}
                        type="number"
                        min={option.min}
                        max={option.max}
                        step={option.step}
                        placeholder={option.placeholder}
                        value={options[option.id] ?? option.default ?? ''}
                        onChange={(e) =>
                          handleOptionChange(option.id, parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {option.type === 'text' && (
                      <input
                        id={option.id}
                        type="text"
                        placeholder={option.placeholder}
                        value={options[option.id] ?? option.default ?? ''}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {option.type === 'checkbox' && (
                      <input
                        id={option.id}
                        type="checkbox"
                        checked={options[option.id] ?? option.default ?? false}
                        onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : `Process with ${tool.title}`}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Result</h2>

            {result.type === 'text' && (
              <div className="mb-4">
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {result.content}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    element.setAttribute(
                      'href',
                      'data:text/plain;charset=utf-8,' + encodeURIComponent(result.content)
                    );
                    element.setAttribute('download', `output.txt`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download Text
                </button>
              </div>
            )}

            {result.type === 'file' && (
              <p className="text-green-700">{result.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getFileExtension(outputType: string): string {
  if (outputType === 'text' || outputType === 'multiple') {
    return '.txt';
  }
  return outputType.startsWith('.') ? outputType : '.' + outputType;
}
