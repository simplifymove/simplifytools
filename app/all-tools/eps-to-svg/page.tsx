'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function EpsToSvgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('eps') && !selectedFile.name.toLowerCase().endsWith('.eps')) {
      setError('Please select a valid EPS file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setConversionTip('');
    setPreview(null);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setDownloadUrl(null);
    setError(null);
    setConversionTip('');
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setConversionTip('Converting EPS to SVG... This may take a moment depending on file complexity.');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'eps',
        to_format: 'svg',
        options: {
          quality: 100,
        },
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConversionTip('✓ Conversion complete! Your SVG is ready to download.');
    } catch (error) {
      setError((error as Error).message || 'Error converting file');
      setConversionTip('');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'converted.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-indigo-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>EPS to SVG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">EPS to SVG Converter</h1>
                <p className="text-lg text-white/90">Convert EPS vector files to scalable SVG format. Perfect for logos, illustrations, and professional graphics that need universal compatibility.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload EPS File</h2>
                  <p className="text-gray-600 mb-6 text-sm">Select an EPS (Encapsulated PostScript) file to convert. Supports files up to 500MB.</p>

                  {/* File Upload Area */}
                  <label className="block">
                    <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer">
                      <input
                        type="file"
                        accept=".eps,application/postscript"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="text-center">
                        <FileUp size={48} className="mx-auto mb-3 text-indigo-500" />
                        <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-600 text-sm">EPS files only, up to 500MB</p>
                      </div>
                    </div>
                  </label>

                  {file && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm font-medium text-gray-900">Selected file:</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Name:</strong> {file.name}</p>
                      <p className="text-sm text-gray-600"><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        onClick={handleClearPreview}
                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        ← Clear and upload different file
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Settings</h3>

                  {/* File Info */}
                  {file && (
                    <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm text-gray-700"><strong>Status:</strong> Ready to convert</p>
                      <p className="text-xs text-gray-600 mt-2">Your EPS file will be converted to SVG format with full quality preservation.</p>
                    </div>
                  )}

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileUp size={18} />
                        Convert to SVG
                      </>
                    )}
                  </button>

                  {/* Conversion Status */}
                  {conversionTip && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      conversionTip.includes('✓')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {conversionTip}
                    </div>
                  )}

                  {/* Download Button */}
                  {downloadUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full mt-3 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download SVG
                    </button>
                  )}

                  {/* Info */}
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs text-indigo-700 mb-2">
                      <strong>💡 SVG Benefits:</strong>
                    </p>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      <li>• Infinitely scalable without quality loss</li>
                      <li>• Smaller file sizes than EPS</li>
                      <li>• Compatible with all modern browsers</li>
                      <li>• Easy to edit and customize</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices Section */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About EPS to SVG Conversion</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">✓</span> EPS Format
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    EPS (Encapsulated PostScript) is a vector graphics format widely used by professional designers and printers. It's the standard format for logos, illustrations, and high-quality graphics.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Professional design files</li>
                    <li>• Print-ready graphics</li>
                    <li>• Vector-based artwork</li>
                    <li>• Large file compatibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">→</span> Why Convert to SVG
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    SVG is the modern standard for web graphics. Converting EPS to SVG makes your designs compatible with all browsers and digital platforms while maintaining quality.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Web and digital use</li>
                    <li>• Universal browser support</li>
                    <li>• Smaller file sizes</li>
                    <li>• Easy to embed and animate</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What is EPS format?</h3>
                  <p className="text-gray-600">EPS (Encapsulated PostScript) is a vector graphics format used primarily in professional design and printing. It's created by programs like Adobe Illustrator and contains scalable vector graphics.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Why convert EPS to SVG?</h3>
                  <p className="text-gray-600">SVG is the standard for web graphics and is supported by all modern browsers without plugins. Converting EPS to SVG allows you to use professional vector artwork on websites and digital platforms.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Will the conversion preserve the quality?</h3>
                  <p className="text-gray-600">Yes! Both EPS and SVG are vector formats, so the conversion maintains 100% quality. Your artwork will scale infinitely without any loss of detail or precision.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What size files can I convert?</h3>
                  <p className="text-gray-600">You can convert EPS files up to 500MB in size. Larger files may take longer to process, but there's no quality compromise.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I edit the SVG after conversion?</h3>
                  <p className="text-gray-600">Yes! SVG files are fully editable in any vector design tool like Adobe Illustrator, Inkscape, Figma, or Adobe XD. You can modify colors, shapes, and other properties as needed.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Is the conversion lossless?</h3>
                  <p className="text-gray-600">Yes! Since both EPS and SVG are vector-based formats, the conversion is completely lossless. All vector data, paths, and design elements are preserved exactly as they were in the original EPS file.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
