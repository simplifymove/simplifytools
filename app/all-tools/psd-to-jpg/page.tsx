'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image as ImageIcon } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function PsdToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState<string>('');
  const [quality, setQuality] = useState(85);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('psd') && !selectedFile.name.toLowerCase().endsWith('.psd')) {
      setError('Please select a valid PSD file');
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
    setConversionTip('Converting PSD to JPG... This may take a moment depending on file complexity and layers.');
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'psd',
        to_format: 'jpg',
        options: {
          quality: quality,
          flatten: true,
          merge_layers: true,
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
      setPreview(url);
      setConversionTip('✓ Conversion complete! Your JPG preview is ready. Quality set to ' + quality + '%');
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
    link.download = 'converted.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-purple-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>PSD to JPG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <ImageIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PSD to JPG Converter</h1>
                <p className="text-lg text-white/90">Convert Photoshop PSD files to JPG format instantly. Flatten layers, merge all elements, and export in a universally compatible format.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload PSD File</h2>
                  <p className="text-gray-600 mb-6 text-sm">Select a Photoshop PSD file to convert. Supports files up to 500MB. All layers will be automatically flattened.</p>

                  {/* File Upload Area */}
                  <label className="block">
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                      <input
                        type="file"
                        accept=".psd,application/x-photoshop"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="text-center">
                        <ImageIcon size={48} className="mx-auto mb-3 text-purple-500" />
                        <p className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-600 text-sm">PSD files only, up to 500MB</p>
                      </div>
                    </div>
                  </label>

                  {file && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-gray-900">Selected file:</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Name:</strong> {file.name}</p>
                      <p className="text-sm text-gray-600"><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        onClick={handleClearPreview}
                        className="mt-3 text-sm text-purple-600 hover:text-purple-700"
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

                  {/* Preview Section */}
                  {preview && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <img
                          src={preview}
                          alt="Converted JPG preview"
                          className="max-w-full h-auto rounded-lg mx-auto"
                          style={{ maxHeight: '500px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion Settings</h3>

                  {/* Quality Slider */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      JPG Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {quality >= 90 ? 'High Quality (Larger file)' : quality >= 70 ? 'Balanced' : 'High Compression (Smaller file)'}
                    </p>
                  </div>

                  {/* File Info */}
                  {file && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-700"><strong>Status:</strong> Ready to convert</p>
                      <p className="text-xs text-gray-600 mt-2">All PSD layers will be flattened and merged into a single JPG image.</p>
                    </div>
                  )}

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={18} />
                        Convert to JPG
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
                      Download JPG
                    </button>
                  )}

                  {/* Info */}
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700 mb-2">
                      <strong>💡 Conversion Benefits:</strong>
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Universal compatibility</li>
                      <li>• Smaller file sizes</li>
                      <li>• Quick preview & sharing</li>
                      <li>• All layers merged</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices Section */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">PSD to JPG Conversion Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🎨</span> About PSD Files
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    PSD (Photoshop Document) is the native format for Adobe Photoshop. It supports layers, masks, adjustments, and other advanced editing features, making it ideal for professional design work.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Layered design documents</li>
                    <li>• Professional editing capabilities</li>
                    <li>• Full color depth and adjustments</li>
                    <li>• Large file sizes due to layers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">→</span> Why Convert to JPG
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    JPG is the most widely used image format. Converting PSD to JPG flattens all layers into a single image, making it smaller, faster to share, and viewable on any device without special software.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Compact file sizes</li>
                    <li>• Universal software support</li>
                    <li>• Perfect for web and sharing</li>
                    <li>• Fast loading times</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quality Guide Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quality Settings Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">High Quality (90-100%)</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Best for artwork, photography, and professional use. Larger file size but excellent quality.
                  </p>
                  <p className="text-xs text-green-700">Recommended for: Print, digital art, archives</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Balanced (70-85%)</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Good balance between quality and file size. Suitable for most web and sharing purposes.
                  </p>
                  <p className="text-xs text-blue-700">Recommended for: Web, social media, general use</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">Compressed (1-60%)</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Smallest file size with visible quality loss. Only use when file size is critical.
                  </p>
                  <p className="text-xs text-orange-700">Recommended for: Email attachments, thumbnails</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Will my PSD layers be preserved in the JPG?</h3>
                  <p className="text-gray-600">No. JPG format doesn't support layers, so all layers in your PSD will be automatically flattened and merged into a single image. The final result shows all visible layers combined.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What if my PSD has transparency?</h3>
                  <p className="text-gray-600">Transparent areas in your PSD will be converted to a white background in the JPG, since JPG format doesn't support transparency. If you need transparency, consider converting to PNG instead.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How does quality affect the file size?</h3>
                  <p className="text-gray-600">Higher quality percentages result in larger file sizes and better visual quality, while lower percentages create smaller files with more compression artifacts. Quality 85% is usually ideal for web use.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I convert back from JPG to PSD?</h3>
                  <p className="text-gray-600">Once converted to JPG, you cannot recover the original layers. JPG is a lossy format. Always keep your original PSD file if you need to edit it later.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What about fonts and effects in my PSD?</h3>
                  <p className="text-gray-600">All text, effects, and adjustments will be rendered and flattened into the image. However, font information will be lost since JPG stores only pixels, not editable text.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What's the maximum file size?</h3>
                  <p className="text-gray-600">You can convert PSD files up to 500MB in size. Larger files may take longer to process, but the conversion quality remains unchanged.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Is the conversion process secure?</h3>
                  <p className="text-gray-600">Yes! Your files are processed securely and deleted after conversion. We don't store or share your files with third parties.</p>
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

