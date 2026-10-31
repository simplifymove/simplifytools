'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function TiffToJpgPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      requestRef.current?.abort();
      readerRef.current?.abort();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const clearResult = () => {
    generationRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setResult(null);
    setResultPreview(null);
    setProcessing(false);
    setError(null);

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    readerRef.current?.abort();
    clearResult();
    setFile(null);
    setPreview(null);

    if (!/\.(tif|tiff)$/i.test(selectedFile.name)) {
      setError('Please choose a TIFF image (.tif or .tiff).');
      return;
    }

    if (!selectedFile.size) {
      setError('The selected TIFF file is empty.');
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('The TIFF file must not exceed 500 MB.');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.size <= 20 * 1024 * 1024) {
      const reader = new FileReader();
      const id = generationRef.current;
      readerRef.current = reader;

      reader.onload = () => {
        if (
          mountedRef.current &&
          id === generationRef.current &&
          typeof reader.result === 'string'
        ) {
          setPreview(reader.result);
        }
      };

      reader.readAsDataURL(selectedFile);
    }
  };

  const handleClearPreview = () => {
    readerRef.current?.abort();
    clearResult();
    setFile(null);
    setPreview(null);
  };

  const handleConvert = async () => {
    if (!file || processing || downloading) return;

    clearResult();

    const id = generationRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'tiff',
          to_format: 'jpg',
          options: { quality }
        })
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'TIFF to JPG conversion failed.'
        );
      }

      const blob = await response.blob();

      if (blob.type !== 'image/jpeg' || blob.size === 0) {
        throw new Error('The converter did not return a valid JPG file.');
      }

      if (!mountedRef.current || id !== generationRef.current) return;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult(blob);
      setResultPreview(url);
    } catch (error) {
      if (!mountedRef.current || id !== generationRef.current) return;

      if (!(error instanceof Error && error.name === 'AbortError')) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to convert the TIFF image.'
        );
      }
    } finally {
      if (mountedRef.current && id === generationRef.current) {
        setProcessing(false);
        requestRef.current = null;
      }
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing || downloading) return;

    setDownloading(true);
    setError(null);

    try {
      const baseName =
        file.name
          .replace(/\.(tif|tiff)$/i, '')
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(0, 100) || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'tiff-to-jpg',
        originalName: file.name,
        outputName: `${baseName}.jpg`
      });

      if (mountedRef.current) {
        router.push(downloadResult.downloadPageUrl);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to prepare the JPG download.'
        );
      }
    } finally {
      if (mountedRef.current) setDownloading(false);
    }
  };
  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>TIFF to JPG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">TIFF to JPG Converter</h1>
              <p className="text-lg text-white/90">Convert TIFF images to JPG format. Adjust quality settings to balance file size and image clarity.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload TIFF Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept=".tif,.tiff,image/tiff"
                />
                {file && !preview && (
                   <p className="mt-4 text-sm text-gray-600">
                     TIFF previews may not work in every browser.
                     You can still convert the selected image.
                   </p>
                 )}
                 {file && (
                   <p className="mt-3 text-sm text-gray-600">
                     Selected: <strong>{file.name}</strong>
                   </p>
                 )}
                 {error && (
                   <div role="alert" className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                     <p className="text-sm text-red-700">{error}</p>
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
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Quality</label>
                    <span className="text-sm font-semibold text-orange-600">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => {
                       clearResult();
                       setQuality(Number(e.target.value));
                     }}
                    disabled={processing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">Higher quality = larger file size</p>
                </div>

                {/* Converted JPG Preview */}
                  {resultPreview && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Converted JPG Preview
                      </h4>
                      <img
                        src={resultPreview}
                        alt="Converted JPG preview"
                        className="w-full max-h-72 object-contain rounded-lg border border-gray-200"
                      />
                      {result && (
                        <p className="mt-2 text-xs text-gray-600">
                          Output size: {(result.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  )}
                  {/* Download Result */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-3">✓ Conversion Complete!</p>
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      disabled={processing || downloading}>
                          {downloading ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                          {downloading ? 'Preparing Download...' : 'Continue to Download'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <Image size={32} className="mx-auto text-orange-400 mb-3" />
                      <p className="text-sm text-orange-800">Your converted JPG preview will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing || downloading}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to JPG'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How To Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Convert TIFF to JPG</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">1</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Your TIFF Image</h3>
                <p className="text-gray-600 mt-2">Click the upload area or drag and drop your TIFF file to get started.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">2</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Adjust Quality Settings</h3>
                <p className="text-gray-600 mt-2">Use the quality slider to adjust JPEG compression, then compare the resulting file size and visible image quality.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">3</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Convert to JPG</h3>
                <p className="text-gray-600 mt-2">Click the "Convert to JPG" button to start the conversion process.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-500 text-white font-bold">4</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Download Your JPG</h3>
                <p className="text-gray-600 mt-2">Once conversion is complete, continue to download the generated JPG file. No signup is required for this converter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Convert TIFF to JPG?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Smaller File Size</h3>
                <p className="text-gray-600 text-sm">JPG compression significantly reduces file size compared to uncompressed TIFF, making files easier to share and store.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Universal Compatibility</h3>
                <p className="text-gray-600 text-sm">JPG is widely supported across browsers, devices, and applications. TIFF support is less common in typical web workflows.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-orange-500 pt-1">✓</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Web-Ready Format</h3>
                <p className="text-gray-600 text-sm">JPG is commonly used on websites, blogs, and social platforms because its lossy compression can reduce file size for photographic images.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="">
        <FAQPanel>
          <FAQHeading>Frequently Asked Questions</FAQHeading>
          <FAQList>
            <FAQCard>
              <FAQStaticQuestion>What is TIFF format?</FAQStaticQuestion>
              <FAQAnswer>TIFF (Tagged Image File Format) is used for scans, publishing, and archival images. It supports multiple compression methods and may contain multiple pages.</FAQAnswer>
            </FAQCard>
            <FAQCard>
              <FAQStaticQuestion>Why is JPG better for web use?</FAQStaticQuestion>
              <FAQAnswer>JPG is widely supported by browsers and applications. Its lossy compression often reduces photographic file sizes, depending on the source and quality setting.</FAQAnswer>
            </FAQCard>
            <FAQCard>
              <FAQStaticQuestion>Will I lose quality converting TIFF to JPG?</FAQStaticQuestion>
              <FAQAnswer>The quality setting controls JPEG compression. Higher settings generally retain more image detail but can create larger files; the visible difference depends on the source TIFF.</FAQAnswer>
            </FAQCard>
            <FAQCard>
              <FAQStaticQuestion>Can I batch convert multiple TIFF files?</FAQStaticQuestion>
              <FAQAnswer>This converter processes one TIFF file at a time. Conversion time depends on the image and server workload.</FAQAnswer>
            </FAQCard>
            <FAQCard>
              <FAQStaticQuestion>What TIFF compression types are supported?</FAQStaticQuestion>
              <FAQAnswer>TIFF compatibility depends on the image encoding and server conversion engine. Unusual compression and multi-page files may require specialized handling.</FAQAnswer>
            </FAQCard>
            <FAQCard>
              <FAQStaticQuestion>Is the conversion process secure?</FAQStaticQuestion>
              <FAQAnswer>Your TIFF file is uploaded for server-assisted conversion and processed only as needed to create the JPG output.</FAQAnswer>
            </FAQCard>
          </FAQList>
        </FAQPanel>
      </section>

      {/* JSON-LD FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is TIFF format?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "TIFF (Tagged Image File Format) is used for scans, publishing, and archival images. It supports multiple compression methods and may contain multiple pages."
              }
            },
            {
              "@type": "Question",
              "name": "Why is JPG better for web use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "JPG is widely supported by browsers and applications. Its lossy compression often reduces photographic file sizes, depending on the source and quality setting."
              }
            },
            {
              "@type": "Question",
              "name": "Will I lose quality converting TIFF to JPG?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The quality setting controls JPEG compression. Higher settings generally retain more image detail but can create larger files; the visible difference depends on the source TIFF."
              }
            },
            {
              "@type": "Question",
              "name": "Can I batch convert multiple TIFF files?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "This converter processes one TIFF file at a time. Conversion time depends on the image and server workload."
              }
            },
            {
              "@type": "Question",
              "name": "What TIFF compression types are supported?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "TIFF compatibility depends on the image encoding and server conversion engine. Unusual compression and multi-page files may require specialized handling."
              }
            },
            {
              "@type": "Question",
              "name": "Is the conversion process secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your TIFF file is uploaded for server-assisted conversion and processed only as needed to create the JPG output."
              }
            }
          ]
        })}
      </script>

      {/* Related Tools */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/all-tools/jpg-to-png" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">JPG to PNG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert JPG to PNG with transparency support</p>
            </Link>
            <Link href="/all-tools/png-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">PNG to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert PNG to JPG with quality control</p>
            </Link>
            <Link href="/all-tools/compress-image" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">Image Compressor</h3>
              <p className="text-gray-600 text-sm mt-2">Reduce image file size with adjustable JPG quality</p>
            </Link>
            <Link href="/all-tools/webp-to-jpg" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">WebP to JPG Converter</h3>
              <p className="text-gray-600 text-sm mt-2">Convert modern WebP to JPG</p>
            </Link>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}







