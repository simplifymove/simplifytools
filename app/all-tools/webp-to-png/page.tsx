'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Loader, ChevronRight, Image } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { convertImageFormat } from '../../lib/imageTools';

import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';
export default function WebpToPngPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const conversionRef = useRef(0);
  const selectionRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);

  const invalidateResult = () => {
    conversionRef.current += 1;

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    setResult(null);
    setResultPreview(null);
  };

  useEffect(() => {
    return () => {
      conversionRef.current += 1;
      selectionRef.current += 1;

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    selectionRef.current += 1;
    const selection = selectionRef.current;

    invalidateResult();
    setFile(null);
    setPreview(null);
    setError(null);

    if (
      selectedFile.type !== 'image/webp' &&
      !/\.webp$/i.test(selectedFile.name)
    ) {
      setError('Please select a WebP image.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('The selected WebP file is empty.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (selection !== selectionRef.current) return;

      const value = event.target?.result;

      if (typeof value !== 'string') {
        setError('Unable to read the selected WebP image.');
        return;
      }

      setFile(selectedFile);
      setPreview(value);
    };

    reader.onerror = () => {
      if (selection === selectionRef.current) {
        setError('Unable to read the selected WebP image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    selectionRef.current += 1;
    invalidateResult();
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file || !preview || processing) return;

    invalidateResult();
    const conversion = conversionRef.current;

    setProcessing(true);
    setError(null);

    try {
      const converted = await convertImageFormat(file, 'image/png');

      if (conversion !== conversionRef.current) return;

      if (
        !converted.blob ||
        converted.blob.size === 0 ||
        converted.blob.type !== 'image/png'
      ) {
        throw new Error('Conversion did not produce a valid PNG image.');
      }

      const url = URL.createObjectURL(converted.blob);
      resultUrlRef.current = url;
      setResultPreview(url);
      setResult(converted.blob);
    } catch (err) {
      if (conversion !== conversionRef.current) return;

      setError(
        err instanceof Error ? err.message : 'Error converting image'
      );
    } finally {
      if (conversion === conversionRef.current) {
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing) return;

    setProcessing(true);
    setError(null);

    try {
      const baseName =
        file.name.replace(/\.[^.]+$/, '').trim() || 'converted-image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'webp-to-png',
        originalName: file.name,
        outputName: `${baseName}.png`,
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
            <span>WebP to PNG</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Image size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">WebP to PNG Converter</h1>
              <p className="text-lg text-white/90">Convert WebP images to PNG format with lossless PNG encoding and support for transparency present in the source image.</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload WebP Image</h2>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={preview}
                  onClearPreview={handleClearPreview}
                  accept="image/webp"
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
                        <p className="text-sm text-green-800 font-medium mb-3">
                            Conversion complete
                          </p>
                          {resultPreview && file && (
                            <div className="mb-4">
                              <img
                                src={resultPreview}
                                alt="Converted PNG image preview"
                                className="w-full max-h-64 object-contain rounded-lg bg-white border border-green-200"
                              />
                              <p className="text-xs text-green-900 mt-3">
                                Original WebP: {(file.size / 1024).toFixed(1)} KB
                                {' | '}
                                PNG: {(result.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          )}
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
                  disabled={!file || !preview || processing}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to PNG'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Helpful content */}
        <section className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How to convert WebP to PNG
              </h2>
              <ol className="space-y-3 text-gray-700 list-decimal pl-6">
                <li>Choose a WebP image from your device.</li>
                <li>Select <strong>Convert to PNG</strong> to process the image.</li>
                <li>Wait for the conversion to complete.</li>
                <li>Continue to the download page and save the PNG file.</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-orange-50 rounded-xl border border-orange-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Why convert WebP to PNG?
                </h2>
                <p className="text-gray-700 leading-7">
                  PNG is useful when you need a lossless image format with broad
                  support in image editors, presentations, design tools, and
                  other applications. Conversion can also help when software
                  does not accept WebP files.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  WebP vs PNG
                </h2>
                <p className="text-gray-700 leading-7">
                  Both formats can support transparency. WebP is designed for
                  efficient web delivery, while PNG is a widely supported
                  lossless format commonly used for graphics, screenshots,
                  interface assets, and transparent images.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What happens to transparency?
              </h2>
              <p className="text-gray-700 leading-7">
                If the source WebP contains transparent pixels, PNG can preserve
                that transparency. This is useful for logos, icons, overlays,
                interface graphics, and other images that require transparent
                areas.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                When should you use PNG instead of WebP?
              </h2>
              <p className="text-gray-700 leading-7 mb-4">
                PNG can be a better choice when compatibility with an editor,
                application, or workflow matters more than keeping the smaller
                file sizes often associated with WebP.
              </p>
              <p className="text-gray-700 leading-7">
                For website delivery, keeping the original WebP may be more
                efficient. For editing, sharing, or software compatibility, PNG
                may be more convenient.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Will converting WebP to PNG reduce quality?
              </h2>
              <p className="text-gray-700 leading-7">
                PNG uses lossless encoding, so the PNG conversion does not add
                JPEG-style lossy compression. However, conversion cannot restore
                image information that may already have been discarded when the
                original WebP was created.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                WebP to PNG FAQ
              </FAQHeading>

              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Does PNG support transparent backgrounds?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    Yes. PNG supports transparency, and transparent pixels in a
                    compatible WebP source can remain transparent in the output.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Why can the PNG file be larger than the WebP?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    PNG and WebP use different compression methods. WebP is
                    optimized for efficient image delivery, so a losslessly
                    encoded PNG version can require more storage.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Does converting to PNG improve the original image?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. Changing the file format does not recreate detail that
                    is missing from the source image or increase its original
                    resolution.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Do I need to install conversion software?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. The conversion runs through the browser, so separate
                    desktop conversion software is not required.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Related image tools
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/all-tools/webp-to-jpg"
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-sm transition"
                >
                  <h3 className="font-bold text-gray-900 mb-1">WebP to JPG</h3>
                  <p className="text-sm text-gray-600">
                    Convert WebP images to JPG for broad compatibility.
                  </p>
                </Link>

                <Link
                  href="/all-tools/png-to-jpg"
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-sm transition"
                >
                  <h3 className="font-bold text-gray-900 mb-1">PNG to JPG</h3>
                  <p className="text-sm text-gray-600">
                    Convert PNG images to JPG when transparency is not required.
                  </p>
                </Link>

                <Link
                  href="/all-tools/compress-image"
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-sm transition"
                >
                  <h3 className="font-bold text-gray-900 mb-1">Compress Image</h3>
                  <p className="text-sm text-gray-600">
                    Reduce image file size for storage and sharing.
                  </p>
                </Link>

                <Link
                  href="/all-tools/resize-image"
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-sm transition"
                >
                  <h3 className="font-bold text-gray-900 mb-1">Resize Image</h3>
                  <p className="text-sm text-gray-600">
                    Change image dimensions for different uses.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
</main>
  );
}







