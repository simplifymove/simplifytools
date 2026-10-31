'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileText, X } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function VsdxToPdfPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const operationRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);

  const clearResult = () => {
    operationRef.current += 1;
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setResultFileName('');
    setError(null);
  };

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
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
    if (!file || processing || downloading) return;

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
          to_format: 'pdf',
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

      if (blob.type !== 'application/pdf') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult(url);
      setResultFileName(
        (file.name.replace(/\.[^.]+$/, '').trim() || 'diagram') + '.pdf'
      );
    } catch (caughtError) {
      if (operation === operationRef.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to convert this Visio file.'
        );
      }
    } finally {
      if (operation === operationRef.current) setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !resultFileName || downloading || processing) return;

    setDownloading(true);
    setError(null);
    const operation = operationRef.current;

    try {
      const blob = await fetch(result).then((response) => response.blob());
      if (operation !== operationRef.current) return;

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: 'vsdx-to-pdf',
        originalName: resultFileName,
        outputName: resultFileName,
      });

      if (operation === operationRef.current) {
        router.push(downloadResult.downloadPageUrl);
      }
    } catch (caughtError) {
      if (operation === operationRef.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to prepare the PDF download.'
        );
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>VSDX to PDF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">VSDX to PDF</h1>
                <p className="text-lg text-white/90">Convert Visio VSDX diagrams to PDF format with server-assisted document rendering for sharing, printing, and archiving.</p>
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
                      <FileText className="mb-3 text-orange-600" size={32} />
                      <p className="text-sm text-gray-600">Selected Visio diagram</p>
                      <p className="font-semibold text-gray-900 break-all">{file.name}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {error && (
                    <p role="alert" className="mt-4 text-sm text-red-700">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Settings</h3>

                    <p className="text-sm text-gray-600 mb-6">
                      Your VSDX diagram is rendered to PDF using server-assisted
                      document conversion.
                    </p>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      disabled={!file || processing || downloading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to PDF'
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Conversion Complete</h3>
                      <button
                        onClick={handleDownload}
                        disabled={processing || downloading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        {downloading ? 'Preparing Download...' : 'Download PDF File'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to convert VSDX to PDF online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a VSDX diagram, start the conversion, wait for the
                server-assisted document conversion to finish, and download
                the resulting PDF from the download page.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  VSDX vs PDF
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  VSDX is commonly used for editable Visio diagrams. PDF is
                  designed for consistent viewing and sharing across many
                  devices and applications. Converting is useful when the
                  recipient needs to view a diagram rather than edit its
                  original Visio structure.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Useful for sharing diagrams
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  PDF output can make flowcharts, process diagrams, network
                  diagrams, and other Visio documents easier to distribute,
                  review, print, or archive without requiring the recipient to
                  work directly with the VSDX source.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What should you check after conversion?
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Review page size and orientation.</li>
                <li>Check text, connectors, shapes, and diagram labels.</li>
                <li>Inspect fonts and spacing on important pages.</li>
                <li>Verify that large diagrams remain readable.</li>
                <li>Keep the original VSDX when future editing may be required.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                When should you keep the VSDX file?
              </h2>
              <p className="text-gray-600 leading-7">
                PDF is useful for viewing and distribution, but it is not a
                replacement for the editable source document. Keep the VSDX
                file when you may need to modify shapes, connectors, text,
                layers, or diagram structure later.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                VSDX to PDF FAQ
              </FAQHeading>
              <FAQList>
                {[
                  ['What does this tool convert?', 'It accepts a VSDX diagram and produces PDF output through server-assisted document conversion.'],
                  ['Why convert a Visio diagram to PDF?', 'PDF is convenient for sharing, reviewing, printing, and archiving diagrams when editing the original VSDX is not required.'],
                  ['Can the PDF replace my original VSDX?', 'Keep the VSDX if you need future diagram editing. PDF is primarily useful as a viewing and distribution format.'],
                  ['Should I inspect the converted PDF?', 'Yes. Review text, shapes, connectors, page layout, and other important diagram details after conversion.'],
                ].map(([q, a]) => (
                  <FAQCard key={q}>
                    <FAQStaticQuestion>{q}</FAQStaticQuestion>
                    <FAQAnswer>{a}</FAQAnswer>
                  </FAQCard>
                ))}
              </FAQList>
            </FAQPanel>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

