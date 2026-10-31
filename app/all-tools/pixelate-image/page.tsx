'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Grid } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function PixelateImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setResult(null);
      setResultPreview(null);
      setPreview(null);
      setError(null);

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        setFile(null);
        setError('Please select a JPG, PNG, or WebP image.');
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.onerror = () => {
        setFile(null);
        setError('Unable to read the selected image. Please try another file.');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const applyPixelate = async () => {
    if (!file || !preview || processing) return;
    setResult(null);
    setResultPreview(null);
    setError(null);
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) {
            setProcessing(false);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < canvas.height; i += pixelSize) {
            for (let j = 0; j < canvas.width; j += pixelSize) {
              const pixelIndex = (i * canvas.width + j) * 4;
              const r = data[pixelIndex];
              const g = data[pixelIndex + 1];
              const b = data[pixelIndex + 2];
              const a = data[pixelIndex + 3];

              for (let pi = 0; pi < pixelSize && i + pi < canvas.height; pi++) {
                for (let pj = 0; pj < pixelSize && j + pj < canvas.width; pj++) {
                  const idx = ((i + pi) * canvas.width + (j + pj)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                  data[idx + 3] = a;
                }
              }
            }
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setError('Unable to create the processed image.');
              setProcessing(false);
              return;
            }
            const processedReader = new FileReader();
            processedReader.onload = () => {
              setResult(blob);
              setResultPreview(processedReader.result as string);
              setProcessing(false);
            };
            processedReader.onerror = () => {
              setError('Unable to preview the processed image.');
              setProcessing(false);
            };
            processedReader.readAsDataURL(blob);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          setError('Unable to process this image. Try another image.');
          setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        setError('The selected image could not be decoded by your browser.');
        setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying pixelate:', error);
      setError('Unable to apply the pixelation effect.');
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
      if (!result || processing) return;


      setProcessing(true);

      try {
        const downloadResult =
          await uploadBrowserDownloadResult({
            blob: result,
            toolSlug: 'pixelate-image',
            originalName: `pixelated-${Date.now()}.jpg`,
            outputName: `pixelated-${Date.now()}.jpg`,
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

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Pixelate Image</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Pixelate Image</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create adjustable pixelated and mosaic-style effects for creative images or for reducing visible fine detail.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pixelate Your Image</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition"
                />
              </div>

              {error && (
                <p role="alert" className="mb-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Pixel Size: {pixelSize}px
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={pixelSize}
                      onChange={(e) => {
                        setPixelSize(Number(e.target.value));
                        setResult(null);
                        setResultPreview(null);
                        setError(null);
                      }}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Smaller = more detailed pixelation, Larger = more blur</p>
                  </div>

                  <button
                    onClick={applyPixelate}
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Grid size={20} />}
                    {processing ? 'Processing...' : 'Apply Pixelate Effect'}
                  </button>
                </>
              )}

              {preview && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">Original image</p>
                    <img
                      src={preview}
                      alt="Original image before pixelation"
                      className="w-full max-h-72 rounded-lg border border-gray-200 object-contain"
                    />
                  </div>
                  {resultPreview && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-700">Pixelated result</p>
                      <img
                        src={resultPreview}
                        alt="Image after applying the pixelation effect"
                        className="w-full max-h-72 rounded-lg border border-gray-200 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Pixelated Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Pixelate an Image</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Image:</strong> Select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Pixel Size:</strong> Use the slider to control the pixelation level (2-50px).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Pixelate Effect" to process your image.</li>
                <li><strong>4. Download:</strong> Save the processed pixelated image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Benefits of Pixelation</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Privacy Protection</h3>
                  <p className="text-gray-700">Reduce visible detail in faces or other image areas, then review the result before sharing.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create retro, mosaic, and block-style visual effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">Mosaic Effects</h3>
                  <p className="text-gray-700">Transform photos into beautiful mosaic patterns.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment required, completely free.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What pixel sizes are available?</FAQQuestion>
                  <FAQAnswer>You can adjust pixel size from 2px to 50px. Smaller sizes create more detail, larger sizes create more blur.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is this good for hiding faces?</FAQQuestion>
                  <FAQAnswer>Pixelation can reduce visible detail, but it should not be treated as a guaranteed anonymization method. Use a strong enough setting and review the processed result before sharing.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I customize the effect?</FAQQuestion>
                  <FAQAnswer>Yes, the pixel size slider lets you adjust the effect from subtle to extreme.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my image kept private?</FAQQuestion>
                  <FAQAnswer>The pixelation effect itself is produced with browser-based image processing.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What formats are supported?</FAQQuestion>
                  <FAQAnswer>You can upload JPG, PNG, and WebP images. The processed image is exported as JPEG.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Does pixelation reduce file size?</FAQQuestion>
                  <FAQAnswer>File size can change after pixelation because the image pixels are modified and the result is encoded again. The final size depends on the source image, effect strength, dimensions, and output encoding.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Does the effect increase image resolution?</FAQQuestion>
                  <FAQAnswer>No. Pixelation changes the appearance of existing pixels; it does not reconstruct missing image detail or increase resolution.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I preview the result before downloading?</FAQQuestion>
                  <FAQAnswer>Yes. After applying the effect, compare the original image with the processed preview before downloading the JPEG result.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Image Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Blur effect with intensity</p>
                </Link>
                <Link href="/all-tools/black-white" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Convert to grayscale</p>
                </Link>
                <Link href="/all-tools/invert-colors" className="p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                  <h3 className="font-bold text-gray-800">Invert Colors</h3>
                  <p className="text-sm text-gray-600">Create negative effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to pixelate an image
              </h2>
              <p className="text-gray-600 leading-7">
Upload an image and adjust the pixel-size control to choose how
                coarse the effect should appear. The browser groups image
                detail into larger visual blocks. After applying the effect,
                compare the original with the processed preview before downloading.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The image effect is produced with browser image and Canvas
                  processing. The preview lets you inspect the result before
                  using the available download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Larger pixel blocks hide more fine detail, but pixelation should not be treated as a guaranteed method for permanently anonymizing sensitive information.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and compare the preview with
                the original before downloading. Stronger effect settings can
                intentionally remove or alter visible detail, so choose the
                setting according to the result you need.
              </p>
            </div>


          </div>
        </section>

        <Footer />

</main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Pixelate Image',
          description: 'Free online pixelate and mosaic image tool',
          url: 'https://simplifyconvert.com/all-tools/pixelate-image',
          applicationCategory: 'MultimediaApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
    </>
  );
}
