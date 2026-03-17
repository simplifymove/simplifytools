'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2, AlertCircle } from 'lucide-react';

interface ConverterPageProps {
  title: string;
  description: string;
  fromFormat: string;
  toFormat: string;
  defaultOptions?: Record<string, any>;
  optionInputs?: Array<{
    key: string;
    label: string;
    type: 'slider' | 'select' | 'number';
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ label: string; value: any }>;
    defaultValue?: any;
  }>;
  acceptFormats?: string;
}

export default function ConverterPage({
  title,
  description,
  fromFormat,
  toFormat,
  defaultOptions = {},
  optionInputs = [],
  acceptFormats,
}: ConverterPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, any>>(defaultOptions);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setError(null);
    setResult(null);

    // Store file for later processing
    setFile(uploadedFile);

    // Create preview (for images)
    if (uploadedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      setPreview(null);
    }
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a file first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create FormData for API
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: fromFormat,
          to_format: toFormat,
          options,
        })
      );

      // Call converter API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Conversion failed');
      }

      // Get converted file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setError(message);
      console.error('Conversion error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result;
    link.download = `converted.${toFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600">{description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {fromFormat.toUpperCase()} → {toFormat.toUpperCase()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <form onSubmit={handleProcess} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload {fromFormat.toUpperCase()} File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept={acceptFormats || `.${fromFormat}`}
                    onChange={handleFileUpload}
                    disabled={processing}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="block w-full p-4 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 transition text-center"
                  >
                    <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {file ? `${file.name}` : 'Click to upload file'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Dynamic Option Inputs */}
              {optionInputs.length > 0 && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
                  <h3 className="font-semibold text-gray-900">Options</h3>
                  
                  {optionInputs.map((input) => (
                    <div key={input.key}>
                      {input.type === 'slider' && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700">
                              {input.label}
                            </label>
                            <span className="text-lg font-bold text-indigo-600">
                              {options[input.key]?.toFixed?.(0) || options[input.key]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={input.min || 0}
                            max={input.max || 100}
                            step={input.step || 1}
                            value={options[input.key] ?? input.defaultValue}
                            onChange={(e) =>
                              setOptions({
                                ...options,
                                [input.key]: parseInt(e.target.value) || parseFloat(e.target.value),
                              })
                            }
                            disabled={processing}
                            className="w-full"
                          />
                        </>
                      )}

                      {input.type === 'number' && (
                        <>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {input.label}
                          </label>
                          <input
                            type="number"
                            min={input.min}
                            max={input.max}
                            step={input.step}
                            value={options[input.key] ?? input.defaultValue}
                            onChange={(e) =>
                              setOptions({
                                ...options,
                                [input.key]: parseInt(e.target.value) || parseFloat(e.target.value),
                              })
                            }
                            disabled={processing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </>
                      )}

                      {input.type === 'select' && (
                        <>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {input.label}
                          </label>
                          <select
                            value={options[input.key] ?? input.defaultValue}
                            onChange={(e) =>
                              setOptions({
                                ...options,
                                [input.key]: e.target.value,
                              })
                            }
                            disabled={processing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {input.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Convert Button */}
              <button
                type="submit"
                disabled={processing || !file}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </span>
                ) : (
                  `Convert to ${toFormat.toUpperCase()}`
                )}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>

            {/* Original Preview */}
            {preview && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Original</p>
                <img
                  src={preview}
                  alt="Original"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Result Preview */}
            {result && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Result</p>
                {preview && (
                  <img
                    src={preview}
                    alt="Converted"
                    className="w-full h-64 object-cover rounded-lg border border-indigo-300 shadow-md"
                  />
                )}
                <button
                  onClick={downloadResult}
                  className="w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download {toFormat.toUpperCase()}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!preview && !result && !error && (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-center">
                  Upload a file to see preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📝 Format Info</h3>
              <p className="text-sm text-gray-600">
                Converting from <strong>{fromFormat.toUpperCase()}</strong> to{' '}
                <strong>{toFormat.toUpperCase()}</strong> format.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">⚡ Processing</h3>
              <p className="text-sm text-gray-600">
                Conversion is performed server-side. Typical conversion time is 2-30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
