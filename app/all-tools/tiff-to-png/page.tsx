'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function TiffToPngPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
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
      setError('Please select a TIFF file (.tif or .tiff).');
      return;
    }

    if (!selectedFile.size) {
      setError('The selected TIFF file is empty.');
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
          to_format: 'png',
          options: {}
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
            : 'TIFF to PNG conversion failed.'
        );
      }

      const blob = await response.blob();

      if (blob.type !== 'image/png' || !blob.size) {
        throw new Error('The converter did not return a valid PNG file.');
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
            : 'Unable to convert the TIFF file.'
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
        toolSlug: 'tiff-to-png',
        originalName: file.name,
        outputName: `${baseName}.png`
      });

      if (mountedRef.current) {
        router.push(downloadResult.downloadPageUrl);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to prepare the PNG download.'
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
              <span>TIFF to PNG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">TIFF to PNG Converter</h1>
                <p className="text-lg text-white/90">Convert TIFF or TIF images to PNG format using server-assisted image conversion.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload TIFF File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".tiff,.tif"
                  />
                  {file && (
                    <p className="mt-3 text-sm text-gray-600">
                      Selected: <strong>{file.name}</strong>
                    </p>
                  )}
                  {file && !preview && (
                    <p className="mt-2 text-sm text-gray-600">
                      TIFF previews may not be supported by your browser.
                      You can still convert the selected file.
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
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing || downloading}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert to PNG'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                      disabled={processing || downloading}>
                      {downloading ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <Download size={20} />
                      )}
                      {downloading ? 'Preparing Download...' : 'Continue to Download'}
                    </button>
                  )}

                                    {/* Converted PNG Preview */}
                  {resultPreview && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Converted PNG Preview
                      </h3>
                      <img
                        src={resultPreview}
                        alt="Converted PNG image"
                        className="w-full max-h-72 object-contain rounded-lg"
                      />
                      {result && (
                        <p className="mt-3 text-sm text-gray-600">
                          PNG size: {(result.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted TIFF conversion</li>
                      <li>• Lossless compression</li>
                      <li>• Supports TIFF and TIF formats</li>
                      <li>• Files are processed only as needed for conversion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to convert TIFF to PNG online
              </h2>
              <p className="text-gray-600 leading-7 mb-5">
                Use this converter when you need a PNG version of a TIFF or TIF
                image for easier viewing, sharing, or use in applications that
                support PNG more widely.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['1', 'Upload TIFF', 'Select the TIFF or TIF image you want to convert.'],
                  ['2', 'Convert', 'Start the conversion and wait while the image is processed.'],
                  ['3', 'Download PNG', 'Continue to the download page when the PNG output is ready.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="font-bold text-orange-500 mb-2">{number}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  TIFF vs PNG
                </h2>
                <p className="text-gray-600 leading-7">
                  TIFF is commonly used for high-quality image storage,
                  scanning, publishing, and archival workflows. PNG is a
                  lossless raster format commonly supported by browsers,
                  image editors, documents, and web applications.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Why convert TIFF to PNG?
                </h2>
                <p className="text-gray-600 leading-7">
                  Converting to PNG can make an image easier to preview or use
                  in software that does not conveniently handle TIFF files.
                  PNG also uses lossless image encoding.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tips for TIFF to PNG conversion
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use the original TIFF file when possible rather than a previously compressed copy.</li>
                <li>Check the resulting PNG dimensions after conversion.</li>
                <li>Remember that converting formats does not improve the detail of the original image.</li>
                <li>For very large TIFF files, processing time can depend on file size and image complexity.</li>
              </ul>
            </div>

            <FAQPanel>
              <FAQHeading>
                TIFF to PNG FAQ
              </FAQHeading>
              <FAQList>
                {[
                  ['Does PNG use lossless compression?', 'Yes. PNG uses lossless image compression, so its encoding does not intentionally discard image information in the way lossy formats such as JPEG can.'],
                  ['Can I upload .tif files?', 'Yes. The converter is intended for TIFF images, including files that use the .tif extension.'],
                  ['Will converting increase image resolution?', 'No. Format conversion does not create additional detail or resolution that was not present in the source image.'],
                  ['Why use PNG instead of TIFF?', 'PNG is widely supported in browsers and many everyday image workflows, which can make it more convenient for viewing and sharing.'],
                ].map(([q, a]) => (
                  <FAQCard key={q}>
                    <FAQStaticQuestion>{q}</FAQStaticQuestion>
                    <FAQAnswer>{a}</FAQAnswer>
                  </FAQCard>
                ))}
              </FAQList>
            </FAQPanel>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Related image tools
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/all-tools/tiff-to-jpg" className="text-orange-600 hover:underline">
                  TIFF to JPG
                </Link>
                <Link href="/all-tools/tiff-to-avif" className="text-orange-600 hover:underline">
                  TIFF to AVIF
                </Link>
                <Link href="/all-tools/image-tools" className="text-orange-600 hover:underline">
                  More image tools
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}







