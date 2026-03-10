'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataTools, getDataToolById } from '@/app/lib/data-tools';
import { Download, AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
            <p className="text-gray-600 mb-6">The requested tool "{slug}" does not exist.</p>
            <button
              onClick={() => router.push('/tools')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Tools
            </button>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/tools')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Tools
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tool.title}</h1>
          <p className="text-gray-600 text-lg">{tool.description}</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select File to Convert
              </label>
              <div className="relative border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-400 transition cursor-pointer bg-blue-50">
                <input
                  type="file"
                  accept={tool.accepts.join(',')}
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-900 font-medium">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Supported formats: {tool.accepts.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Maximum file size: 100MB
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Options */}
            {tool.options && tool.options.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Options
                </h3>
                <div className="space-y-4">
                  {tool.options.map((option) => (
                    <div key={option.name}>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {option.label}
                        {option.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      {option.type === 'select' && (
                        <select
                          name={option.name}
                          value={String(formData[option.name] ?? option.default ?? '')}
                          onChange={handleFormChange}
                          disabled={loading}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      )}

                      {option.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          name={option.name}
                          checked={(formData[option.name] as boolean) || false}
                          onChange={handleFormChange}
                          disabled={loading}
                          className="w-4 h-4 text-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                      )}

                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800">
                  Conversion completed successfully! File download started.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting... Please wait
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Convert File
                </>
              )}
            </button>
          </form>

          {/* Download Link (if needed) */}
          {downloadUrl && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-blue-900">File ready for download</p>
              <a
                href={downloadUrl}
                download={`converted.${tool.output}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How to use {tool.title}?
          </h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Select a {tool.accepts.join(' or ')} file from your computer</li>
            <li>Configure any conversion options if needed</li>
            <li>Click "Convert File" to start the conversion</li>
            <li>Your file will automatically download when ready</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
