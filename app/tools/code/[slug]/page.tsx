'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getToolBySlug, CodeTool } from '@/app/lib/code-tools';
import { Copy, Download, RotateCcw, Play } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 ">
            {error || 'Loading...'}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-2xl">{tool.icon}</span>
            {tool.title}
          </h1>
          <p className="text-gray-600">{tool.description}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input & Options */}
          <div className="space-y-6">
            {/* Input */}
            {tool.inputMode !== 'none' && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Input
                </label>
                <textarea
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${tool.title.toLowerCase()} input...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            )}

            {/* Options */}
            {tool.options.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Options
                </label>
                <div className="space-y-4">
                  {tool.options.map((option) => (
                    <div key={option.name}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {option.label}
                      </label>

                      {option.type === 'select' && option.choices ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          checked={options[option.name] || false}
                          onChange={(e) =>
                            handleOptionChange(option.name, e.target.checked)
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={options[option.name] || ''}
                          onChange={(e) =>
                            handleOptionChange(option.name, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleExecute}
                disabled={loading}
              >
                <Play size={18} />
                {loading ? 'Processing...' : 'Execute'}
              </button>

              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                onClick={handleClear}
              >
                <RotateCcw size={18} />
                Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Output */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Output
              </label>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
                value={output}
                placeholder="Output will appear here..."
              />
            </div>

            {/* Output Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCopy}
                disabled={!output}
              >
                <Copy size={18} />
                Copy
              </button>

              <button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={!output}
              >
                <Download size={18} />
                Download
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold">{success}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
