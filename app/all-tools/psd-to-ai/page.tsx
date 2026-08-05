'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileIcon } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function PsdToAiPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState('high');
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
      formData.append('tool', 'psd-to-ai');
      formData.append('file', file);
      formData.append('options', JSON.stringify({ 
        quality
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultFileName(`converted.ai`);
    } catch (error) {
      alert('Error converting file: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {

      if (!result || !resultFileName) return;

      const blob = await fetch(result).then((response) => response.blob());

      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: "psd-to-ai",
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
              <span>PSD to AI</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">PSD to AI</h1>
                <p className="text-lg text-white/90">Convert Photoshop PSD files to AI output for use in compatible design workflows.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload PSD File</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept=".psd"
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
                    <h3 className="font-semibold text-gray-900 mb-4">Conversion Settings</h3>
                    
                    {/* Quality Selection */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Conversion Quality
                      </label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="low">Low (Faster)</option>
                        <option value="medium">Medium</option>
                        <option value="high">High (Best Quality)</option>
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
                          Converting...
                        </>
                      ) : (
                        'Convert to AI'
                      )}
                    </button>
                  </div>

                  {/* Result */}
                  {result && (
                    <div className="bg-white rounded-lg border border-green-200 bg-green-50 p-4">
                      <h3 className="font-semibold text-green-900 mb-3">✓ Conversion Complete</h3>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download AI File
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
                How to convert PSD to AI online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload a Photoshop PSD file, choose the available conversion
                quality, and start the conversion. When processing finishes,
                download the generated AI file from the download page.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  PSD and AI serve different workflows
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  PSD is commonly associated with Photoshop documents and
                  image-based design work, while AI files are associated with
                  Illustrator workflows. Conversion can be useful when you
                  need an AI-format output for another design application or
                  workflow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Check the converted design
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  PSD and AI use different document structures. After
                  conversion, review text, effects, transparency, positioning,
                  colors, and other important visual details in compatible
                  software before continuing production work.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What does the quality setting do?
              </h2>
              <p className="text-gray-600 leading-7">
                The converter provides Low, Medium, and High quality choices.
                Use the setting that best matches your workflow and review the
                resulting file after conversion. A higher setting may require
                more processing than a lower setting.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Before using the converted AI file
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Keep the original PSD as your source file.</li>
                <li>Open the AI output in compatible software and inspect it.</li>
                <li>Check fonts, colors, effects, transparency, and alignment.</li>
                <li>Do not assume every PSD-specific feature will translate identically.</li>
                <li>Verify the final design before printing or publishing it.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                PSD to AI FAQ
              </h2>
              <div className="space-y-4">
                {[
                  ['What file do I upload?', 'Upload a PSD file using the file selector on this page.'],
                  ['What output does the tool create?', 'The converter returns an AI file when conversion completes successfully.'],
                  ['Can I choose conversion quality?', 'Yes. Low, Medium, and High quality options are available on the page.'],
                  ['Will every PSD feature remain identical?', 'Not necessarily. PSD and AI use different document structures, so review the converted file in compatible software.'],
                  ['Should I keep my original PSD?', 'Yes. Keep the original source file so you can return to it if the converted result needs adjustment.'],
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

