'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function BmpToJpgPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
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
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'bmp',
          to_format: 'jpg',
          options: { quality: 85 },
        }),
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Conversion failed');
      }

      const blob = await response.blob();

      if (blob.type !== 'image/jpeg') {
        throw new Error(
          `Unexpected output type: ${blob.type || 'unknown'}`,
        );
      }

      setResult(blob);
    } catch (err) {
      setError((err as Error).message || 'Error converting image');
    } finally {
      setProcessing(false);
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
        toolSlug: 'bmp-to-jpg',
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
            <span>BMP to JPG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">BMP to JPG Converter</h1>
              <p className="text-lg text-white/90">Convert BMP images to JPG format with efficient compression for web and everyday use.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload BMP Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/bmp"
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
                <h3 className="text-lg font-bold text-gray-900 mb-6">Conversion</h3>

                {/* Image Preview */}
                <div className="mb-6">
                  {result ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-3">✓ Conversion Complete!</p>
                        <button
                          onClick={handleDownload}
                          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      disabled={processing}>
                          <Download size={18} />
                          {processing ? 'Preparing Download...' : 'Continue to Download'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                      <Image size={32} className="mx-auto text-orange-400 mb-3" />
                      <p className="text-sm text-orange-800">Preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={!file || processing}
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

          {/* Supporting Content */}
          <section className="mt-12 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to convert BMP to JPG
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    1. Upload your BMP
                  </h3>
                  <p className="text-gray-600 leading-7">
                    Choose the BMP image you want to convert. The converter
                    accepts bitmap images and prepares them for JPG output.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2. Convert the image
                  </h3>
                  <p className="text-gray-600 leading-7">
                    Select Convert to JPG. The image is encoded as a JPEG with
                    balanced compression suitable for common sharing and web
                    use.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    3. Download the JPG
                  </h3>
                  <p className="text-gray-600 leading-7">
                    After conversion finishes, continue to the download page
                    and save the resulting JPG image.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why convert BMP to JPG?
                </h2>

                <p className="text-gray-600 leading-7 mb-4">
                  BMP is a bitmap image format commonly associated with
                  uncompressed or lightly compressed image data. BMP files can
                  therefore be much larger than formats designed for everyday
                  sharing.
                </p>

                <p className="text-gray-600 leading-7">
                  JPG uses lossy compression to reduce image size. Converting a
                  BMP to JPG can make photographs and other continuous-tone
                  images easier to upload, email, store, and use on websites.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  BMP vs JPG
                </h2>

                <div className="space-y-4 text-gray-600 leading-7">
                  <p>
                    <strong className="text-gray-900">BMP:</strong> Often
                    preserves image data with little or no compression, which
                    can result in comparatively large files.
                  </p>

                  <p>
                    <strong className="text-gray-900">JPG:</strong> Uses lossy
                    compression and is widely supported by browsers, phones,
                    photo applications, and online services.
                  </p>

                  <p>
                    JPG is generally a better choice when smaller file size and
                    broad compatibility matter more than preserving every
                    original pixel exactly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                When should you use JPG instead of BMP?
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Website images',
                    text: 'Reduce the size of bitmap photographs before using them on a website.',
                  },
                  {
                    title: 'Email attachments',
                    text: 'Create a more compact image that is easier to attach and share.',
                  },
                  {
                    title: 'Photo storage',
                    text: 'Use JPG when efficient storage is more important than lossless pixel preservation.',
                  },
                  {
                    title: 'Device compatibility',
                    text: 'JPG is broadly supported across modern browsers, phones, computers, and apps.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg bg-slate-50 border border-slate-200 p-5"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-6">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What happens to image quality?
              </h2>

              <p className="text-gray-600 leading-7 mb-4">
                JPG compression is lossy, so the converted file does not retain
                every bit of the original BMP image data. This converter uses a
                quality setting of 85 to provide a practical balance between
                visual quality and file size.
              </p>

              <p className="text-gray-600 leading-7">
                For photographs and typical web images, the difference may be
                difficult to notice at normal viewing sizes. For screenshots,
                diagrams, text-heavy graphics, or images that must remain
                lossless, PNG may be a better output format.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                BMP to JPG FAQ
              </h2>

              <div className="divide-y divide-gray-200">
                {[
                  {
                    q: 'Does converting BMP to JPG reduce file size?',
                    a: 'In many cases, yes. JPG compression is designed to create smaller files than typical bitmap images, although the exact reduction depends on the image.',
                  },
                  {
                    q: 'Will BMP to JPG conversion reduce image quality?',
                    a: 'JPG uses lossy compression, so some image information is discarded. The converter uses a quality setting of 85 to balance visual quality with a smaller output file.',
                  },
                  {
                    q: 'Should I use JPG or PNG for a BMP image?',
                    a: 'JPG is usually suitable for photographs and images where smaller files are important. PNG is often preferable for screenshots, graphics, sharp text, transparency, or situations where lossless compression is required.',
                  },
                  {
                    q: 'Can I open the converted JPG on phones and computers?',
                    a: 'Yes. JPG is one of the most widely supported image formats and can be opened by modern browsers, phones, computers, and common image applications.',
                  },
                ].map((item) => (
                  <div key={item.q} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.q}
                    </h3>
                    <p className="text-gray-600 leading-7">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Need lossless output instead?{' '}
              <Link
                href="/all-tools/bmp-to-png"
                className="font-semibold text-orange-600 hover:text-orange-700 underline"
              >
                Convert BMP to PNG
              </Link>
              .
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}







