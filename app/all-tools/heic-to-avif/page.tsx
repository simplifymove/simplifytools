'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from "@/app/lib/download-result-client";
import { useRouter } from "next/navigation";

export default function HeicToAvifPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState('80');
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
      formData.append('config', JSON.stringify({ 
        from_format: 'heic',
        to_format: 'avif',
        options: {
          quality: parseInt(quality)
        }
      }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();

      if (blob.type !== 'image/avif') {
        throw new Error(
          `Unexpected AVIF output type: ${blob.type || 'unknown'}`,
        );
      }

      const url = URL.createObjectURL(blob);
      setResult(url);
      setResultFileName(`converted.avif`);
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
        toolSlug: "heic-to-avif",
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
        <div className="relative bg-emerald-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>HEIC to AVIF</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Image size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">HEIC to AVIF</h1>
                <p className="text-lg text-white/90">Convert HEIC images to modern AVIF format. Reduce file size significantly while maintaining excellent quality.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload HEIC Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                    accept="image/heic,image/heif"
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
                    
                    {/* Quality */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher quality = larger file size</p>
                    </div>

                    {/* Convert Button */}
                    <button
                      onClick={handleConvert}
                      disabled={!file || processing}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Converting...
                        </>
                      ) : (
                        'Convert to AVIF'
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
                        Download AVIF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to convert HEIC to AVIF online
              </h2>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  ['1', 'Upload image', 'Choose a HEIC or HEIF image from your device.'],
                  ['2', 'Set quality', 'Use the quality slider to choose the balance you want between image quality and output size.'],
                  ['3', 'Convert', 'Start the conversion and wait for the AVIF image to be generated.'],
                  ['4', 'Download AVIF', 'Download the converted AVIF file after reviewing the result.'],
                ].map(([number, title, text]) => (
                  <div key={number} className="border border-gray-200 rounded-xl p-5">
                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-3">
                      {number}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 leading-6">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Why convert HEIC to AVIF?
                </h2>
                <p className="text-gray-600 leading-7">
                  HEIC is commonly produced by modern phones and Apple devices. AVIF is another modern compressed image format intended for efficient image storage and delivery. Conversion can be useful when an AVIF file is specifically required by your workflow.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  HEIC vs AVIF
                </h2>
                <p className="text-gray-600 leading-7">
                  HEIC and AVIF are both modern compressed image formats, but they are used in different ecosystems. HEIC is especially common for photos captured on Apple devices, while AVIF is increasingly used for modern web and application image delivery. Format support can vary between software and devices.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How does the AVIF quality setting work?
              </h2>

              <p className="text-gray-600 leading-7 mb-4">
                This converter lets you select a quality value from 1 to 100.
                Higher settings generally preserve more image detail but can
                produce larger output files. Lower settings can reduce the
                resulting file size more aggressively but may introduce more
                visible compression.
              </p>

              <p className="text-gray-600 leading-7">
                The best setting depends on the image itself and how you plan to
                use it. Photographs, screenshots, graphics, and detailed scans
                can respond differently to compression, so review the converted
                result rather than relying only on a particular quality number.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Will AVIF always be smaller?
              </h2>

              <p className="text-gray-600 leading-7">
                Not necessarily. AVIF is designed for efficient image
                compression, but the final file size depends on the original
                image, dimensions, visual complexity, source compression, and
                the quality setting you choose. Compare the converted result
                with the original when file size is important.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Tips for converting HEIC images to AVIF
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Keep the original source image when you may need it for editing or another format later.',
                  'Start with a higher quality setting when preserving fine detail is important.',
                  'Try a lower quality setting when reducing output size is the main goal.',
                  'Review detailed areas of the converted image for visible compression artifacts.',
                  'Check whether the application, browser, or platform where you will use the image supports AVIF.',
                  'Compare the final file size and visual quality before replacing an existing image asset.',
                ].map((tip) => (
                  <div key={tip} className="flex gap-3 border border-gray-200 rounded-lg p-4">
                    <span className="text-sky-600 font-bold">✓</span>
                    <p className="text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                HEIC to AVIF FAQ
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: 'What output format does this converter create?',
                    a: 'The converted image is generated and downloaded in AVIF format.',
                  },
                  {
                    q: 'Can I control AVIF quality?',
                    a: 'Yes. The quality slider lets you select a value from 1 to 100 before starting the conversion.',
                  },
                  {
                    q: 'Does higher quality create a larger file?',
                    a: 'Higher quality settings can produce larger files because more image detail is preserved, although the exact result depends on the image.',
                  },
                  {
                    q: 'Is AVIF supported everywhere?',
                    a: 'AVIF support has expanded across modern browsers and software, but compatibility can still vary. Check the requirements of the application or platform where you plan to use the file.',
                  },
                  {
                    q: 'Should I delete the original HEIC file after conversion?',
                    a: 'Keeping the original is recommended when it is your source, archival, or highest-quality copy. Conversion creates a file for a different format and use case.',
                  },
                ].map((item) => (
                  <div key={item.q} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.q}
                    </h3>
                    <p className="text-gray-600 leading-7">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Related image converters
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <Link
                href="/all-tools/heic-to-jpg"
                className="border border-gray-200 rounded-xl p-5 hover:border-sky-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">HEIC to JPG</h3>
                <p className="text-sm text-gray-600">Convert HEIC photos to widely supported JPG files.</p>
              </Link>

              <Link
                href="/all-tools/heic-to-png"
                className="border border-gray-200 rounded-xl p-5 hover:border-sky-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">HEIC to PNG</h3>
                <p className="text-sm text-gray-600">Convert HEIC images to PNG format.</p>
              </Link>

              <Link
                href="/all-tools/jpg-to-avif"
                className="border border-gray-200 rounded-xl p-5 hover:border-sky-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">JPG to AVIF</h3>
                <p className="text-sm text-gray-600">Create AVIF images from JPG files.</p>
              </Link>

              <Link
                href="/all-tools/webp-to-avif"
                className="border border-gray-200 rounded-xl p-5 hover:border-sky-400 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">WebP to AVIF</h3>
                <p className="text-sm text-gray-600">Convert WebP images to AVIF format.</p>
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







