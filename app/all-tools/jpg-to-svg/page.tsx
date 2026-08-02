'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function JpgToSvgPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setConversionTip('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
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
    setConversionTip('Vectorizing your image... This may take a moment depending on image complexity.');
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'jpg',
        to_format: 'svg',
        options: {},
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

      if (blob.type !== 'image/svg+xml') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setConversionTip('✓ Vectorization complete! Your SVG is ready to download.');
    } catch (error) {
      setError((error as Error).message || 'Error converting image');
      setConversionTip('');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!downloadUrl) return;

      const blob = await fetch(downloadUrl).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "jpg-to-svg",
        originalName: "converted.svg",
        outputName: "converted.svg",
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Hero Header */}
      <div className="relative bg-blue-500 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>JPG to SVG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">JPG to SVG Converter</h1>
              <p className="text-lg text-white/90">Trace JPG artwork into SVG vector paths. High-contrast logos, icons, and simple graphics produce the clearest results.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload JPG</h2>
                <p className="text-gray-600 mb-6 text-sm">Works best with clear, high-contrast images. Logos and icons produce excellent results.</p>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                />
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
                <h3 className="text-lg font-bold text-gray-900 mb-6">Preview & Convert</h3>

                {/* Image Preview */}
                <div className="mb-6">
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="JPG Preview"
                        className="w-full rounded-lg border border-gray-200 object-cover max-h-64"
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>Format:</strong> JPG</p>
                        <p><strong>Size:</strong> {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">No image selected</p>
                        <p className="text-gray-400 text-xs mt-1">Upload a JPG to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Image size={18} />
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
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>💡 SVG Benefits:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• SVG vector-path output</li>
                    <li>• Smaller file sizes than raster formats</li>
                    <li>• Best suited to high-contrast logos, icons, and illustrations</li>
                    <li>• Vector paths can be edited in compatible SVG editors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for JPG to SVG Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">✓</span> What Works Best
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Simple logos with solid colors</li>
                  <li>• Icons and symbols</li>
                  <li>• High-contrast images</li>
                  <li>• Geometric designs</li>
                  <li>• Clean illustrations</li>
                  <li>• Simple line drawings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠</span> Less Suitable For
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Photographs and complex images</li>
                  <li>• Gradient-heavy designs</li>
                  <li>• Low-contrast images</li>
                  <li>• Noise and texture-rich images</li>
                  <li>• Very detailed illustrations</li>
                  <li>• Compressed JPEGs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What is SVG format?</h3>
                <p className="text-gray-600">SVG (Scalable Vector Graphics) represents graphics using vector geometry. This converter traces suitable raster artwork into SVG paths that can be scaled without raster pixelation.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Why convert JPG to SVG?</h3>
                <p className="text-gray-600">Traced SVG paths can scale without raster pixelation and are useful for logos, icons, and simple artwork. File size and trace quality depend on the source image.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between raster and vector?</h3>
                <p className="text-gray-600">Raster images are made of pixels. This converter traces visible shapes into SVG paths, which can be scaled without the pixelation of the original raster image.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I edit the SVG file after conversion?</h3>
                <p className="text-gray-600">The traced output contains SVG vector paths that can be edited in compatible vector software. Trace accuracy depends on the complexity and contrast of the source image.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What image types work best?</h3>
                <p className="text-gray-600">Simple logos, icons, and illustrations with solid colors and clear shapes produce the best results. Complex photographs and gradient-heavy images may not convert as cleanly.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How is JPG to SVG different from PNG to SVG?</h3>
                <p className="text-gray-600">Both formats use the same server-assisted tracing process. Trace quality depends mainly on the visible shapes, contrast, and complexity of the source artwork.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

