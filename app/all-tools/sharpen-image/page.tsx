'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function SharpenImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharpenAmount, setSharpenAmount] = useState(5);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const operationId = useRef(0);
  const processingRef = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      operationId.current += 1;
    };
  }, []);

  const invalidateResult = () => {
    operationId.current += 1;
    setResult(null);
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    invalidateResult();
    setFile(null);
    setPreview(null);

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a supported image file.');
      return;
    }

    const currentId = operationId.current;
    const reader = new FileReader();

    reader.onload = () => {
      if (currentId !== operationId.current) return;

      if (typeof reader.result !== 'string') {
        setError('Unable to read the selected image.');
        return;
      }

      setFile(selectedFile);
      setPreview(reader.result);
    };

    reader.onerror = () => {
      if (currentId === operationId.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleSharpen = async () => {
    if (!file || !preview || processingRef.current) return;

    const currentId = ++operationId.current;
    processingRef.current = true;
    setProcessing(true);
    setResult(null);
    setError('');

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to load the image.'));
        img.src = preview;
      });

      if (currentId !== operationId.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Image canvas is unavailable.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to initialize image processing.');

      ctx.drawImage(img, 0, 0);

      const width = canvas.width;
      const height = canvas.height;
      const original = ctx.getImageData(0, 0, width, height);
      const output = ctx.createImageData(width, height);
      output.data.set(original.data);

      const source = original.data;
      const target = output.data;

      const strength = sharpenAmount / 20;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const index = (y * width + x) * 4;

          for (let channel = 0; channel < 3; channel++) {
            const center = source[index + channel];
            const top = source[index - width * 4 + channel];
            const bottom = source[index + width * 4 + channel];
            const left = source[index - 4 + channel];
            const right = source[index + 4 + channel];

            const sharpened =
              center * (1 + 4 * strength) -
              strength * (top + bottom + left + right);

            target[index + channel] = Math.max(
              0, Math.min(255, Math.round(sharpened))
            );
          }
        }
      }

      ctx.putImageData(output, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          value => {
            if (value) resolve(value);
            else reject(new Error('Unable to create the sharpened image.'));
          },
          'image/jpeg',
          0.9
        );
      });

      if (currentId !== operationId.current) return;

      setResult(blob);
    } catch (caughtError) {
      if (currentId !== operationId.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to sharpen the image.'
      );
    } finally {
      processingRef.current = false;
      if (currentId === operationId.current) {
        setProcessing(false);
      }
    }
  };

  const handleDownload = async () => {
      if (!result || processing || processingRef.current) return;
      processingRef.current = true;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'sharpen-image',
            originalName: 'sharpened.jpg',
            outputName: 'sharpened.jpg',
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
        processingRef.current = false;
        setProcessing(false);
      }
    };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sharpen Image</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Sharpen Image</h1>
                <p className="text-lg text-white/90">Apply adjustable edge sharpening to emphasize existing image details without increasing resolution.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-400 transition cursor-pointer mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Sparkles size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-semibold text-gray-700 mb-1">Click to select an image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, WebP and other formats</p>
                    </label>
                  </div>

                  {preview && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                      <img src={preview} alt="Preview" className="w-full rounded-lg mb-4" style={{ maxHeight: '400px' }} />
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Sharpen Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Sharpen Settings</h3>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Sharpness: {sharpenAmount}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={sharpenAmount}
                        onChange={(e) => {
                          invalidateResult();
                          setSharpenAmount(Number(e.target.value));
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Subtle</span>
                        <span>Moderate</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  </div>

                  {/* Sharpen Button */}
                  <button
                    onClick={handleSharpen}
                    disabled={!file || processing}
                    className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Sharpening...
                      </>
                    ) : (
                      'Sharpen Image'
                    )}
                  </button>

                  {error && (
                    <p role="alert" className="text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  {result && (
                    <button
                      onClick={handleDownload}
                      disabled={processing}
                      className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Increase apparent edge contrast</li>
                      <li>• Improve details</li>
                      <li>• Multiple levels available</li>
                      <li>• Browser-based processing</li>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Sharpen an Image</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div><p className="text-gray-700"><strong>Upload your image:</strong> Click upload or drag and drop your image file</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div><p className="text-gray-700"><strong>Adjust sharpness level:</strong> Use the slider to select sharpness intensity from subtle to strong</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div><p className="text-gray-700"><strong>Click Sharpen Image:</strong> Apply the sharpening adjustment in your browser</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div><p className="text-gray-700"><strong>Download sharpened image:</strong> Prepare the processed image for download</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits of Image Sharpening</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Adjust apparent clarity - increase contrast around visible image details</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Emphasize edges - make existing tonal differences appear stronger</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Adjustable appearance - compare different settings before choosing the result</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Social media ready - create sharp images for social platforms</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Adjustable intensity - control sharpening strength for different images</li>
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
                What sharpness level should I use?


              </FAQQuestion>
              <FAQAnswer>Start with level 5-7 for subtle enhancement. Use 10-15 for moderate sharpening. Use 15-20 for heavy sharpening. Adjust based on your image.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Can I reverse sharpening?


              </FAQQuestion>
              <FAQAnswer>No, sharpening is permanent in the output. Always keep your original image. You can always apply sharpening again with different settings.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Does sharpening increase file size?


              </FAQQuestion>
              <FAQAnswer>File size can change because the processed image is encoded again as JPG at 90% quality.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                What formats are supported?


              </FAQQuestion>
              <FAQAnswer>Supported browser-readable images can be processed by the tool. The generated result is encoded as JPG at 90% quality.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Will sharpening improve a very blurry image?


              </FAQQuestion>
              <FAQAnswer>This adjustment can make existing edges and tonal differences appear stronger, but it does not reconstruct detail that is missing from a heavily blurred source image.</FAQAnswer>
            </FAQDisclosure>

            <FAQDisclosure>
              <FAQQuestion>
                Is the sharpen tool really free?


              </FAQQuestion>
              <FAQAnswer>You can use the available sharpening controls without creating an account.</FAQAnswer>
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
            "name": "What sharpness level should I use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Start with level 5-7 for subtle enhancement. Use 10-15 for moderate sharpening. Use 15-20 for heavy sharpening."
            }
          },
          {
            "@type": "Question",
            "name": "Can I reverse sharpening?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, sharpening is permanent in the output. Always keep your original image."
            }
          },
          {
            "@type": "Question",
            "name": "Does sharpening increase file size?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "File size can change because the processed image is encoded again as JPG at 90% quality."
            }
          },
          {
            "@type": "Question",
            "name": "What formats are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Supported browser-readable images can be processed by the tool. The generated result is encoded as JPG at 90% quality."
            }
          },
          {
            "@type": "Question",
            "name": "Will sharpening improve a very blurry image?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The adjustment can make existing edges and tonal differences appear stronger, but it does not reconstruct detail missing from a heavily blurred source image."
            }
          },
          {
            "@type": "Question",
            "name": "Is the sharpen tool really free?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use the available sharpening controls without creating an account."
            }
          }
        ]
      })}</script>

      {/* Related Tools */}
      <div className="py-12 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/all-tools/blur-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Blur Image</p>
              <p className="text-sm text-gray-600">Add blur effects</p>
            </Link>
            <Link href="/all-tools/image-enhancer" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Image Enhancer</p>
              <p className="text-sm text-gray-600">Adjust brightness and contrast</p>
            </Link>
            <Link href="/all-tools/crop-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Crop Image</p>
              <p className="text-sm text-gray-600">Remove unwanted areas</p>
            </Link>
            <Link href="/all-tools/compress-image" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-400 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">Compress Image</p>
              <p className="text-sm text-gray-600">Reduce file size</p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
