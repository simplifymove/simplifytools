'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, FileUp } from 'lucide-react';
import { ImageUploader } from '../../components/ImageUploader';
import { compressImage } from '../../lib/imageTools';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ImageCompressorPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
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
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const handleCompress = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const result = await compressImage(file, quality);
      setCompressedSize(result.blob.size);
      setResult(result.blob);
    } catch (error) {
      alert('Error compressing image: ' + (error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processing) return;


    setProcessing(true);

    try {
      const extension = result.type === 'image/jpeg' ? 'jpg'
        : result.type === 'image/png' ? 'png'
        : result.type === 'image/webp' ? 'webp'
        : null;
      if (!extension) throw new Error('Unsupported compressed image format');

      const downloadResult =
        await uploadBrowserDownloadResult({
          blob: result,
          toolSlug: 'image-compressor',
          originalName: file?.name || `compressed.${extension}`,
          outputName: `compressed.${extension}`,
        });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      console.error('Download preparation failed:', caughtError);
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    } finally {
      setProcessing(false);
    }
  };

  const reduction = originalSize > 0 ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) : 0;

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
              <span>Image Compressor</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileUp size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Compressor</h1>
                <p className="text-lg text-white/90">Re-encode an image in your browser with an adjustable quality setting. Compare the original and processed file sizes before downloading.</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                  <ImageUploader
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClearPreview={handleClearPreview}
                  />
                  {originalSize > 0 && (
                    <p className="mt-4 text-sm text-gray-600">
                      Original size: <span className="font-semibold text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Compression Settings</h3>

                    {/* Quality Slider */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Quality: {Math.round(quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Smallest</span>
                        <span>Balanced</span>
                        <span>Best</span>
                      </div>
                    </div>
                  </div>

                  {/* Compress Button */}
                  <button
                    onClick={handleCompress}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Compressing...
                      </>
                    ) : (
                      'Compress Image'
                    )}
                  </button>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Image
                    </button>
                  )}

                  {/* Result Box */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">✓ Compression Complete!</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Original:</span>
                          <span className="font-medium text-gray-900">{(originalSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Compressed:</span>
                          <span className="font-medium text-green-600">{(compressedSize / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${Math.max(20, ((originalSize - compressedSize) / originalSize) * 100)}%` }}
                          />
                        </div>
                        <div className="text-center font-semibold text-green-600 text-xs">
                          Reduced by {reduction}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Browser-based image compression</li>
                      <li>• Quality slider from 10% to 100%</li>
                      <li>• Actual size reduction depends on the image format and content</li>
                      <li>• Download preparation uploads the processed file to the server</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How To Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Compress Images</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Select any JPG, PNG, or WebP image</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust quality slider:</strong> Choose a quality setting from 10% to 100%. Lower settings can produce smaller JPEG or WebP files, but results vary. PNG encoding may not respond to this setting.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Compress Image:</strong> Apply the selected browser encoding settings</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download your result:</strong> Compare the original and processed sizes, then use Download Image to prepare the file for download</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Compression</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Prepare website images - smaller files may reduce transfer size and improve loading performance</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Compare storage needs - check whether the processed file is smaller before replacing an original</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Better for email - smaller files can be easier to attach and send</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Prepare social media images - compare file sizes and check each platform's format requirements</li>
            <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span> Reduce data transfer when possible - smaller image files may use less bandwidth</li>
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-t border-gray-200">
        <FAQPanel>
          <FAQHeading>Frequently Asked Questions</FAQHeading>
          <FAQList>
            <FAQDisclosure>
              <FAQQuestion>
                Will compression reduce image quality?


              </FAQQuestion>
              <FAQAnswer>Compression can reduce image quality. Lower settings generally reduce file size more, while higher settings usually retain more visible detail.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What quality setting should I use?


              </FAQQuestion>
              <FAQAnswer>Start around 70% to 75% for JPEG or WebP images, then compare the resulting file size and appearance. Higher settings generally retain more detail but may produce larger files. PNG output may not change noticeably with the quality slider.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What file formats are supported?


              </FAQQuestion>
              <FAQAnswer>The uploader accepts supported image extensions up to 50 MB. JPG, PNG, and WebP are common choices, but successful processing depends on browser decoding and encoding support. The output format can depend on the source MIME type and browser.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Can I compress multiple images at once?


              </FAQQuestion>
              <FAQAnswer>This tool processes one image at a time. For multiple files, use Batch Compress Images, which accepts up to 100 images per batch and processes them sequentially.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Are my images stored on your servers?


              </FAQQuestion>
              <FAQAnswer>Compression runs in your browser. When you click Download Image, the generated file is uploaded to our server to prepare its download page.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Is image compression really free?


              </FAQQuestion>
              <FAQAnswer>Yes. You can use the image compression controls without creating an account. The tool shows the original and processed file sizes so you can compare the result.</FAQAnswer>
            </FAQDisclosure>
          </FAQList>
        </FAQPanel>
      </div>

      {/* FAQ Schema */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Will compression reduce image quality?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Compression can reduce image quality. Lower settings generally reduce file size more, while higher settings usually retain more visible detail."
            }
          },
          {
            "@type": "Question",
            "name": "What quality setting should I use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Start around 70% to 75% for JPEG or WebP images, then compare the resulting file size and appearance. Higher settings generally retain more detail but may produce larger files. PNG output may not change noticeably with the quality slider."
            }
          },
          {
            "@type": "Question",
            "name": "What file formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The uploader accepts supported image extensions up to 50 MB. JPG, PNG, and WebP are common choices, but successful processing depends on browser decoding and encoding support. The output format can depend on the source MIME type and browser."
            }
          },
          {
            "@type": "Question",
            "name": "Can I compress multiple images at once?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This tool processes one image at a time. For multiple files, use Batch Compress Images, which accepts up to 100 images per batch and processes them sequentially."
            }
          },
          {
            "@type": "Question",
            "name": "Are my images stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Compression runs in your browser. When you click Download Image, the generated file is uploaded to our server to prepare its download page."
            }
          },
          {
            "@type": "Question",
            "name": "Is image compression really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can use the image compression controls without creating an account. The tool shows the original and processed file sizes so you can compare the result."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Image Tools</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/all-tools/resize-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Image Resizer</span><p className="text-xs text-gray-600">Change image dimensions</p></div>
            </Link>
            <Link href="/all-tools/jpg-to-png" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">JPG to PNG Converter</span><p className="text-xs text-gray-600">Convert image formats</p></div>
            </Link>
            <Link href="/all-tools/crop-image" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Crop Image</span><p className="text-xs text-gray-600">Remove unwanted areas</p></div>
            </Link>
            <Link href="/all-tools/batch-compress-images" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
              <span className="text-orange-600 font-bold">→</span>
              <div><span className="text-gray-900 font-medium hover:text-orange-600">Batch Compress Images</span><p className="text-xs text-gray-600">Compress multiple files</p></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
