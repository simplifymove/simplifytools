'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function PngToSvgPage() {
  const router = useRouter();
  const requestGeneration = useRef(0);
  const processingRef = useRef(false);
  const downloadRef = useRef(false);
  const conversionAbortRef = useRef<AbortController | null>(null);
  const previewReaderRef = useRef<FileReader | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [svgResult, setSvgResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversionTip, setConversionTip] = useState<string>('');

  const resetConversion = () => {
    requestGeneration.current += 1;
    conversionAbortRef.current?.abort();
    conversionAbortRef.current = null;
    previewReaderRef.current?.abort();
    previewReaderRef.current = null;
    processingRef.current = false;
    setProcessing(false);
    setSvgResult(null);
    setConversionTip('');
  };

  useEffect(() => {
    return () => {
      requestGeneration.current += 1;
      conversionAbortRef.current?.abort();
      previewReaderRef.current?.abort();
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (downloadRef.current) return;

    resetConversion();
    setFile(null);
    setPreview(null);
    setError(null);

    if (
      selectedFile.type !== 'image/png' ||
      !selectedFile.name.toLowerCase().endsWith('.png')
    ) {
      setError('Please select a valid PNG (.png) image.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('The selected PNG file is empty.');
      return;
    }

    const generation = requestGeneration.current;
    setFile(selectedFile);

    const reader = new FileReader();
    previewReaderRef.current = reader;

    reader.onload = () => {
      if (generation === requestGeneration.current) {
        setPreview(
          typeof reader.result === 'string' ? reader.result : null
        );
      }
    };

    reader.onerror = () => {
      if (generation === requestGeneration.current) {
        setError('Unable to preview the selected PNG.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    if (downloadRef.current) return;

    resetConversion();
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file || processingRef.current || downloadRef.current) return;

    const generation = ++requestGeneration.current;
    const controller = new AbortController();
    conversionAbortRef.current = controller;
    processingRef.current = true;

    setProcessing(true);
    setSvgResult(null);
    setError(null);
    setConversionTip(
      'Tracing visible shapes into SVG paths. Complex images may take longer.'
    );

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('config', JSON.stringify({
        from_format: 'png',
        to_format: 'svg',
        options: {},
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          typeof errorData?.error === 'string'
            ? errorData.error
            : 'PNG to SVG conversion failed.'
        );
      }

      const blob = await response.blob();

      if (blob.type.split(';')[0].trim() !== 'image/svg+xml') {
        throw new Error(
          'The conversion service did not return an SVG file.'
        );
      }

      if (blob.size === 0) {
        throw new Error('The generated SVG file is empty.');
      }

      if (generation === requestGeneration.current) {
        setSvgResult(blob);
        setConversionTip(
          '? SVG tracing completed. Review the result in an SVG editor.'
        );
      }
    } catch (caughtError) {
      if (generation === requestGeneration.current) {
        if (
          caughtError instanceof Error &&
          caughtError.name !== 'AbortError'
        ) {
          setError(caughtError.message || 'Unable to convert PNG to SVG.');
        }
        setConversionTip('');
      }
    } finally {
      if (generation === requestGeneration.current) {
        conversionAbortRef.current = null;
        processingRef.current = false;
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
    if (!svgResult || !file || processingRef.current) return;

    processingRef.current = true;
    downloadRef.current = true;
    setProcessing(true);
    setError(null);

    try {
      const baseName =
        file.name.replace(/\\.[^.]+$/, '').trim() || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: svgResult,
        toolSlug: 'png-to-svg',
        originalName: file.name,
        outputName: `${baseName}.svg`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the SVG download.'
      );
    } finally {
      downloadRef.current = false;
      processingRef.current = false;
      setProcessing(false);
    }
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
            <span>PNG to SVG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PNG to SVG Converter</h1>
              <p className="text-lg text-white/90">Convert clean PNG artwork into traced SVG vector paths. Simple icons, line drawings, and high-contrast shapes work best. Transparent areas and original colors may not be preserved.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Upload PNG</h2>
                <p className="text-gray-600 mb-6 text-sm">Choose a PNG with crisp edges and clear shapes. Transparent backgrounds do not guarantee transparent SVG output.</p>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept=".png,image/png"
                  toolId="png-to-svg"
                  onValidationError={(message) => {
                    if (message && !downloadRef.current) {
                      resetConversion();
                      setFile(null);
                      setPreview(null);
                      setError(message);
                    }
                  }}
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
                        alt="PNG Preview"
                        className="w-full rounded-lg border border-gray-200 object-cover max-h-64"
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>Format:</strong> PNG</p>
                        <p><strong>Size:</strong> {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">No image selected</p>
                        <p className="text-gray-400 text-xs mt-1">Upload a PNG to begin</p>
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
                {svgResult && (
                  <button
                    onClick={handleDownload}
                    disabled={processing}
                    className="w-full mt-3 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {processing ? 'Preparing download...' : 'Download SVG'}
                  </button>
                )}

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>💡 SVG Benefits:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• SVG vector-path output</li>
                    <li>• File size depends on image complexity and traced paths</li>
                    <li>• Best suited to high-contrast logos, icons, and illustrations</li>
                    <li>• Vector paths can be edited in compatible SVG editors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for PNG to SVG Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">✓</span> What Works Best
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Clean PNG logos with clearly defined shapes</li>
                  <li>• High-contrast PNG icons and symbols</li>
                  <li>• Artwork with clear separation between foreground and background</li>
                  <li>• Geometric artwork with crisp edges</li>
                  <li>• Simple illustrations without gradients</li>
                  <li>• Bold line drawings with minimal texture</li>
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
                  <li>• PNG artwork with intricate transparency or soft shadow effects</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <FAQPanel>
            <FAQHeading>Frequently Asked Questions</FAQHeading>
            <FAQList>
              <FAQCard>
                <FAQStaticQuestion>What is SVG format?</FAQStaticQuestion>
                <FAQAnswer>SVG (Scalable Vector Graphics) represents graphics using vector geometry. This converter traces suitable raster artwork into SVG paths that can be scaled without raster pixelation.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>Why convert PNG to SVG?</FAQStaticQuestion>
                <FAQAnswer>Converting a clean PNG logo or icon into traced SVG paths can make its resulting shapes scalable and editable. The process traces visible shapes rather than preserving every original pixel, color, or transparency effect.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>What's the difference between raster and vector?</FAQStaticQuestion>
                <FAQAnswer>Raster images are made of pixels. This converter traces visible shapes into SVG paths, which can be scaled without the pixelation of the original raster image.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>Can I edit the SVG file after conversion?</FAQStaticQuestion>
                <FAQAnswer>The traced output contains SVG vector paths that can be edited in compatible vector software. Trace accuracy depends on the complexity and contrast of the source image.</FAQAnswer>
              </FAQCard>
              <FAQCard>
                <FAQStaticQuestion>What image types work best?</FAQStaticQuestion>
                <FAQAnswer>Use PNG files containing clear silhouettes, bold line art, or simple icons. The tracing engine processes the image in grayscale, so original colors, gradients, and transparency effects are not reliably preserved. Inspect the SVG before using it in a design.</FAQAnswer>
              </FAQCard>
            </FAQList>
          </FAQPanel>
        </div>
      </div>
    </main>
  );
}

