'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, RefreshCw, Download, ArrowLeft, Loader } from 'lucide-react';
import { getToolById } from '@/app/lib/ai-tools';
import type { AIWriteTool } from '@/app/lib/ai-tools';

export default function AIWriteToolPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tool, setTool] = useState<AIWriteTool | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load tool configuration
  useEffect(() => {
    const loadedTool = getToolById(slug);
    if (loadedTool) {
      setTool(loadedTool);
      // Initialize inputs with default values
      const defaultInputs: Record<string, any> = {};
      loadedTool.fields.forEach(field => {
        if (field.type === 'select' && field.options) {
          defaultInputs[field.name] = field.options[0]?.value || '';
        } else {
          defaultInputs[field.name] = '';
        }
      });
      setInputs(defaultInputs);
    }
  }, [slug]);

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          inputs,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || 'Failed to generate content');
      } else {
        setResult(data.result);
        if (data.meta?.usingMock) {
          setError('Note: Using mock response. Add GROQ_API_KEY to .env.local to enable real AI generation.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
    element.setAttribute('download', `${tool?.id || 'result'}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/tools?category=AI%20Write" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Write Tools
          </Link>
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Tool not found</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/tools?category=AI%20Write" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Write Tools
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tool.title}</h1>
          <p className="text-lg text-gray-600">{tool.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Input</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {tool.fields.map(field => (
                <div key={field.name}>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${field.required ? 'after:content-["*"] after:text-red-600 after:ml-1' : ''}`}>
                    {field.label}
                  </label>

                  {field.type === 'textarea' && (
                    <textarea
                      name={field.name}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.validation?.maxLength}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      name={field.name}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.validation?.maxLength}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      name={field.name}
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.validation?.maxLength && (
                    <p className="text-xs text-gray-500 mt-1">
                      {inputs[field.name]?.length || 0} / {field.validation.maxLength}
                    </p>
                  )}
                </div>
              ))}

              {error && !error.includes('Note:') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </form>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Output</h2>

            {!result ? (
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-center">
                <p className="text-gray-500">
                  Fill in the form and click Generate to see the result here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && error.includes('Note:') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    {error}
                  </div>
                )}

                {tool.outputFormat === 'json' ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono text-gray-800">
                    {result}
                  </pre>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-auto whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {result}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={downloadResult}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>

                  <button
                    onClick={() => setResult('')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
