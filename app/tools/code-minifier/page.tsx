'use client';

import React, { useState } from 'react';
import { Download, Copy, Zap } from 'lucide-react';

export default function CodeMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);

  const minifyCode = (code: string, lang: string) => {
    try {
      if (lang === 'javascript') {
        // Simple JS minification - remove comments, extra whitespace
        let minified = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
          .replace(/\/\/.*$/gm, '') // Remove // comments
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}()\[\];:,=])\s*/g, '$1')
          .trim();
        return minified;
      } else if (lang === 'css') {
        // Simple CSS minification
        let minified = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\n/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,])\s*/g, '$1')
          .trim();
        return minified;
      } else if (lang === 'html') {
        // Simple HTML minification
        let minified = code
          .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
          .replace(/>\s+</g, '><')
          .replace(/\s+/g, ' ')
          .trim();
        return minified;
      }
      return code;
    } catch (error) {
      return 'Error minifying code';
    }
  };

  const handleMinify = () => {
    const minified = minifyCode(input, language);
    setOutput(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const ext = language === 'html' ? 'html' : language === 'css' ? 'css' : 'js';
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `minified.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sizeReduction = input.length > 0 ? Math.round(((input.length - output.length) / input.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Code Minifier</h1>
          <p className="text-gray-600 mb-8">Minify JavaScript, CSS, and HTML code to reduce file size</p>

          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex gap-4">
              {['javascript', 'css', 'html'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    language === lang
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Code</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none resize-none"
              />
              <div className="mt-2 text-sm text-gray-600">
                Size: <span className="font-semibold">{input.length.toLocaleString()}</span> bytes
              </div>
            </div>

            {/* Output */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minified Code</label>
              <textarea
                value={output}
                readOnly
                placeholder="Minified code will appear here..."
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm bg-gray-50 resize-none"
              />
              <div className="mt-2 flex justify-between text-sm text-gray-600">
                <div>
                  Size: <span className="font-semibold">{output.length.toLocaleString()}</span> bytes
                </div>
                {sizeReduction > 0 && (
                  <div className="text-green-600 font-semibold">
                    Reduced: {sizeReduction}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleMinify}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Zap size={20} /> Minify Code
            </button>
            {output && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Copy size={20} /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                  <Download size={20} /> Download
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">What does this do?</h3>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• Removes comments and unnecessary whitespace</li>
              <li>• Reduces file size for faster loading</li>
              <li>• Maintains code functionality</li>
              <li>• Supports JavaScript, CSS, and HTML</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
