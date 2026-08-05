'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileText } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function TiffToTextPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [language, setLanguage] = useState('eng');
  const [outputFormat, setOutputFormat] = useState('txt');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const formData = new FormData();

      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'tiff',
          to_format: outputFormat,
          options: {
            language,
          },
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

      const isExpectedOutput =
        outputFormat === 'pdf'
          ? blob.type === 'application/pdf'
          : blob.type.startsWith('text/plain');

      if (!isExpectedOutput) {
        throw new Error(
          `Unexpected ${outputFormat.toUpperCase()} output type: ${
            blob.type || 'unknown'
          }`,
        );
      }

      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultFileName(`extracted-text.${outputFormat}`);
    } catch (error) {
      alert('Error extracting text: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!result || !resultFileName) return;

      const blob = await fetch(result).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "tiff-to-text",
        originalName: resultFileName,
        outputName: resultFileName,
      });

      router.push(downloadResult.downloadPageUrl);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-violet-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>TIFF to Text</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">TIFF to Text</h1>
                <p className="text-lg text-white/90">Extract text from TIFF images using OCR. Supports multiple languages and TXT or searchable PDF output.</p>
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
                    accept=".tiff,.tif"
                  />
                  {file && (
                    <p className="mt-4 text-sm text-gray-600">
                      File: <span className="font-semibold text-gray-900">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Extraction Settings</h3>
                    
                    {/* Language Selection */}
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="eng">English</option>
                        <option value="spa">Spanish</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="chi_sim">Chinese (Simplified)</option>
                        <option value="jpn">Japanese</option>
                      </select>
                    </div>

                    {/* Output Format */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Output Format
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="txt">Plain Text</option>
                        <option value="pdf">Searchable PDF</option>
                      </select>
                    </div>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      disabled={!file || processing}
                      className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Extract Text'
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="bg-white rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Extraction Complete</h3>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download Result
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
                How to extract text from TIFF
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a TIFF image, choose the document language, select Plain
                Text or Searchable PDF, and start extraction. The tool uses OCR
                processing to recognize readable text in the image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What is OCR?
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Optical character recognition, or OCR, analyzes text visible
                  in an image and converts recognized characters into
                  machine-readable text. It is useful for scanned documents,
                  photographed pages, and TIFF files that do not already
                  contain selectable text.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Choose the correct language
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Selecting the language that matches the document can help OCR
                  interpret characters and words more accurately. The page
                  provides multiple language choices for extraction.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Plain Text vs Searchable PDF
              </h2>
              <p className="text-gray-600 leading-7">
                Choose Plain Text when you mainly need extracted text that can
                be copied or edited. Choose Searchable PDF when you need PDF
                output with searchable text produced from the OCR process.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What affects OCR accuracy?
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Clear, sharp source images are easier to recognize.</li>
                <li>Correct orientation helps OCR read lines in the expected direction.</li>
                <li>High contrast between text and background can improve recognition.</li>
                <li>Decorative fonts, handwriting, blur, and damaged scans may reduce accuracy.</li>
                <li>Always proofread extracted text when accuracy is important.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                TIFF to Text FAQ
              </h2>
              <div className="space-y-4">
                {[
                  ['What type of file can I upload?', 'This page accepts TIFF image files for OCR processing.'],
                  ['What output formats are available?', 'You can select Plain Text or Searchable PDF from the output settings.'],
                  ['Why do I need to choose a language?', 'The language selection gives the OCR process information about the characters and words it should expect.'],
                  ['Is OCR always perfectly accurate?', 'No. Accuracy depends on image quality, text clarity, layout, language, fonts, and other characteristics of the source.'],
                  ['Should I review the extracted text?', 'Yes. Proofread names, numbers, dates, addresses, and other important information before relying on OCR output.'],
                ].map(([q, a]) => (
                  <div key={q} className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                    <p className="text-sm text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}







