'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Footer } from '../../components/Footer';

export default function PsdToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.psd')) {
      setError('Please select a valid PSD file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setPreview(`PSD File: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    setResult(null);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const convertPsdToPng = async () => {
    if (!file) {
      setError('Please select a PSD file first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the conversion API
      const response = await fetch('/api/convert/psd-to-png', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert PSD file');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `converted-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-purple-500 to-blue-600 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>PSD to PNG</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PSD to PNG Converter</h1>
                <p className="text-lg text-white/90">Convert Photoshop files to PNG format instantly with transparency support.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left (2 cols) */}
              <div className="lg:col-span-2">
                {/* Upload Section */}
                {!preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload PSD File</h2>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-purple-50">
                      <FileText size={48} className="mx-auto mb-4 text-purple-500" />
                      <p className="text-gray-700 mb-4">Drag and drop your PSD file here, or click to select</p>
                      <input
                        type="file"
                        accept=".psd"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) handleFileSelect(selectedFile);
                        }}
                        className="hidden"
                        id="psd-input"
                      />
                      <label
                        htmlFor="psd-input"
                        className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg cursor-pointer transition"
                      >
                        Select PSD File
                      </label>
                      <p className="text-xs text-gray-600 mt-4">Maximum file size: 100 MB</p>
                    </div>
                  </div>
                )}

                {/* File Info */}
                {preview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">File Details</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-900 font-semibold">{preview}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your PSD file is ready to convert. Click the "Convert to PNG" button to start the process.
                    </p>
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Complete</h2>
                    <div className="flex justify-center bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="text-center">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-semibold">Your PNG file is ready!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                {!preview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <AlertCircle size={20} />
                      About PSD to PNG Conversion
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Convert your Adobe Photoshop PSD files to PNG format. Our converter supports:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4">
                      <li>✓ Full transparency/alpha channel preservation</li>
                      <li>✓ High-quality color conversion</li>
                      <li>✓ Support for various PSD versions</li>
                      <li>✓ Fast processing for files up to 100 MB</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {!preview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>✓ Instant conversion</li>
                        <li>✓ No installation needed</li>
                        <li>✓ Keep transparency</li>
                        <li>✓ Free and easy</li>
                        <li>✓ No registration</li>
                        <li>✓ 100% secure</li>
                      </ul>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-xs mt-1">{error}</p>
                    </div>
                  )}

                  {/* Convert Button */}
                  {preview && (
                    <button
                      onClick={convertPsdToPng}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <RotateCcw size={20} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <FileText size={20} />
                          Convert to PNG
                        </>
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download PNG
                    </button>
                  )}

                  {/* Reset Button */}
                  {preview && (
                    <button
                      onClick={handleClearPreview}
                      className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Start Over
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How to Use Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Convert PSD to PNG</h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-4">
              <span className="text-purple-500 font-bold min-w-8">1.</span>
              <span><strong>Upload PSD:</strong> Click "Select PSD File" or drag and drop your Photoshop file here.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-purple-500 font-bold min-w-8">2.</span>
              <span><strong>Verify Details:</strong> Check the file name and size displayed. Make sure it's the correct file.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-purple-500 font-bold min-w-8">3.</span>
              <span><strong>Start Conversion:</strong> Click the "Convert to PNG" button to begin the conversion process.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-purple-500 font-bold min-w-8">4.</span>
              <span><strong>Wait for Completion:</strong> The conversion typically takes a few seconds depending on file size.</span>
            </li>
            <li className="flex gap-4">
              <span className="text-purple-500 font-bold min-w-8">5.</span>
              <span><strong>Download:</strong> Once complete, click "Download PNG" to save your converted file.</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of PSD to PNG Conversion</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ Transparency Support</h3>
              <p className="text-gray-700">Full alpha channel preservation ensures transparent areas remain intact in the PNG output.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ Universal Compatibility</h3>
              <p className="text-gray-700">PNG files work on all platforms and devices. Use the converted images anywhere without restrictions.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ Instant Conversion</h3>
              <p className="text-gray-700">Fast processing means your files are converted in seconds, not minutes or hours.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ No Software Required</h3>
              <p className="text-gray-700">No need to own Adobe Photoshop or any expensive software. Convert online for free.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ High Quality</h3>
              <p className="text-gray-700">Lossless conversion preserves your image quality and color accuracy perfectly.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-500 mb-2">✓ 100% Private</h3>
              <p className="text-gray-700">Your files are processed securely and never stored on our servers. Your privacy is guaranteed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">What is a PSD file?</summary>
              <p className="text-gray-700 mt-2">A PSD (Photoshop Document) is Adobe's native file format for Photoshop. It contains layers, effects, and other editable elements. PNG is a universal image format that works everywhere.</p>
            </details>
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Will transparency be preserved?</summary>
              <p className="text-gray-700 mt-2">Yes! Our converter preserves the full alpha channel and transparency information. Any transparent areas in your PSD will remain transparent in the PNG output.</p>
            </details>
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Can I convert large PSD files?</summary>
              <p className="text-gray-700 mt-2">We support PSD files up to 100 MB. If your file is larger, consider reducing the image dimensions or exporting specific layers from Photoshop before converting.</p>
            </details>
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Is this tool free?</summary>
              <p className="text-gray-700 mt-2">Yes, completely free! No hidden fees, subscriptions, or charges. Convert as many files as you need without any limitations.</p>
            </details>
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Do I need Adobe Photoshop installed?</summary>
              <p className="text-gray-700 mt-2">No! Our online converter requires no software installation. Just upload your file and download the PNG. It works on any device with a web browser.</p>
            </details>
            <details className="border-l-4 border-purple-500 pl-4 py-2">
              <summary className="font-bold text-gray-800 cursor-pointer">Are my files safe?</summary>
              <p className="text-gray-700 mt-2">Absolutely. Files are processed securely and deleted immediately after conversion. We never store your files on our servers. Your privacy is our priority.</p>
            </details>
          </div>
        </div>
      </div>

      {/* Related Tools Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Conversion Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/all-tools/png-to-jpg" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">PNG to JPG</h3>
              <p className="text-sm text-gray-600">Convert PNG images to JPG format</p>
            </Link>
            <Link href="/all-tools/webp-to-png" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">WebP to PNG</h3>
              <p className="text-sm text-gray-600">Convert WebP images to PNG</p>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
              <h3 className="font-bold text-gray-800 mb-1">JPG to PNG</h3>
              <p className="text-sm text-gray-600">Convert JPG images to PNG format</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PSD to PNG Converter - Free Online Photoshop File Converter',
        description: 'Convert Photoshop PSD files to PNG format instantly with full transparency support. Free, fast, and secure online converter.',
        url: 'https://simplifyconvert.com/all-tools/psd-to-png',
        applicationCategory: 'Multimedia',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        author: { '@type': 'Organization', name: 'SimplifyConvert', url: 'https://simplifyconvert.com' },
        datePublished: '2024-01-01',
        image: 'https://simplifyconvert.com/og-image.jpg',
        featureList: [
          'Convert PSD files to PNG instantly',
          'Full transparency support',
          'No software installation required',
          'Support for files up to 100 MB',
          'Lossless high-quality conversion',
          'Fast processing',
          ' 100% secure and private',
          'No registration required',
          'Works on all devices',
        ],
      })}} />
    </>
  );
}







