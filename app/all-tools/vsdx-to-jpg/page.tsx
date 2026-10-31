'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, FileUp, X } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function VsdxToJpgPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const operationRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);

  const clearResult = () => {
    operationRef.current += 1;
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setResultPreview(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    clearResult();
    setFile(null);

    if (!selectedFile.name.toLowerCase().endsWith('.vsdx')) {
      setError('Please select a .vsdx Visio diagram file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleClearPreview = () => {
    clearResult();
    setFile(null);
  };

  const handleConvert = async () => {
    if (!file || processing) return;

    clearResult();
    const operation = operationRef.current;
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'vsdx',
          to_format: 'jpg',
          options: {},
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();

      if (operation !== operationRef.current) return;

      if (blob.type !== 'image/jpeg') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultPreview(url);
      setResult(blob);
    } catch (err) {
      if (operation === operationRef.current) {
        setError((err as Error).message || 'Error converting file');
      }
    } finally {
      if (operation === operationRef.current) {
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;

    setProcessing(true);
    setError(null);

    try {
      const baseName =
        file.name.replace(/\.[^.]+$/, '').trim() || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'vsdx-to-jpg',
        originalName: file.name,
        outputName: `${baseName}.jpg`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to prepare the download. Please try again.'
      );
    } finally {
      setProcessing(false);
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
              <span>VSDX to JPG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">VSDX to JPG Converter</h1>
                <p className="text-lg text-white/90">Convert Visio VSDX diagrams to JPG format for easy viewing, sharing, and embedding.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload VSDX File</h2>
                  {!file ? (
                    <ImageUploader
                      onFileSelect={handleFileSelect}
                      preview={null}
                      onClearPreview={handleClearPreview}
                      accept=".vsdx"
                    />
                  ) : (
                    <div className="relative rounded-lg border border-orange-200 bg-orange-50 p-6">
                      <button
                        type="button"
                        aria-label="Remove selected VSDX file"
                        onClick={handleClearPreview}
                        className="absolute right-3 top-3 rounded-full bg-white p-2 text-gray-700 hover:bg-orange-100"
                      >
                        <X size={18} />
                      </button>
                      <FileUp className="mb-3 text-orange-600" size={32} />
                      <p className="text-sm text-gray-600">Selected Visio diagram</p>
                      <p className="font-semibold text-gray-900 break-all">{file.name}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {resultPreview && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Converted JPG Preview
                      </h3>
                      <img
                        src={resultPreview}
                        alt="Converted Visio diagram as JPG"
                        className="w-full max-h-[500px] rounded-lg border border-gray-200 object-contain"
                      />
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
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      'Convert to JPG'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                      disabled={processing}>
                      <Download size={20} />
                      {processing ? 'Preparing Download...' : 'Continue to Download'}
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Server-assisted Visio conversion</li>
                      <li>• Standard JPG output</li>
                      <li>• Suitable for viewing and sharing diagram snapshots</li>
                      <li>• Availability depends on file complexity and server limits</li>
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
                How to convert VSDX to JPG online
              </h2>
              <p className="text-gray-600 leading-7 mb-5">
                Convert a VSDX diagram into a JPG image when you need a
                convenient raster version for viewing, sharing, or inserting
                into documents and other content.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  ['1', 'Upload VSDX', 'Select the Visio VSDX file you want to convert.'],
                  ['2', 'Convert to JPG', 'Start conversion and wait while the diagram is processed.'],
                  ['3', 'Download JPG', 'Continue to the download page when the JPEG output is ready.'],
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
                  Why convert VSDX to JPG?
                </h2>
                <p className="text-gray-600 leading-7">
                  A JPG snapshot is easier to open in many everyday image
                  viewers and can be inserted into documents, presentations,
                  messages, or web content without requiring Visio-compatible
                  software.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  VSDX vs JPG
                </h2>
                <p className="text-gray-600 leading-7">
                  VSDX stores structured diagram content. JPG stores a
                  flattened raster image. After conversion, the JPG is useful
                  as a visual snapshot but does not preserve editable Visio
                  shapes and connectors.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tips for converting Visio diagrams to JPG
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Keep the original VSDX if you need to edit shapes or connectors later.</li>
                <li>Review small labels and detailed diagram elements after conversion.</li>
                <li>Use JPG when you need a simple flattened image of the diagram.</li>
                <li>Conversion availability and processing time can depend on file complexity and server limits.</li>
              </ul>
            </div>

            <FAQPanel>
              <FAQHeading>
                VSDX to JPG FAQ
              </FAQHeading>
              <FAQList>
                {[
                  ['Can I edit Visio shapes in the resulting JPG?', 'No. JPG is a flattened raster image and does not retain editable Visio shapes, connectors, or diagram structure.'],
                  ['Why create a JPG from a VSDX file?', 'A JPG is convenient when you need a broadly supported visual snapshot for sharing or inserting into other content.'],
                  ['Should I keep the original VSDX file?', 'Yes. Keep the source VSDX whenever you may need to modify the original diagram later.'],
                  ['Will every complex diagram look identical after conversion?', 'Rendering can depend on the source file, diagram complexity, fonts, and conversion environment, so reviewing the output is recommended.'],
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
                Related diagram tools
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/all-tools/vsdx-to-pdf" className="text-orange-600 hover:underline">
                  VSDX to PDF
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







