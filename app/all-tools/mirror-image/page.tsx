'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function MirrorImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [flipMode, setFlipMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const mirrorImage = async () => {
    if (!file || !preview) return;
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

          if (flipMode === 'horizontal') {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -img.width, 0);
          } else {
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, -img.height);
          }

          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setProcessing(false);
              return;
            }
            setResult(blob);
            setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          setProcessing(false);
        }
      };
      img.onerror = () => {
        console.error('Error loading image');
        setProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      console.error('Error mirroring image:', error);
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
            toolSlug: 'mirror-image',
            originalName: `mirror-${Date.now()}.jpg`,
            outputName: `mirror-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Mirror Image</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🔄 Mirror Image</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Flip images horizontally or vertically to create mirrored or reversed versions using browser-based processing.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Flip & Mirror Image</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Flip Mode</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="horizontal"
                          checked={flipMode === 'horizontal'}
                          onChange={(e) => setFlipMode(e.target.value as 'horizontal' | 'vertical')}
                          className="cursor-pointer"
                        />
                        <span className="text-gray-700">Horizontal Flip</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="vertical"
                          checked={flipMode === 'vertical'}
                          onChange={(e) => setFlipMode(e.target.value as 'horizontal' | 'vertical')}
                          className="cursor-pointer"
                        />
                        <span className="text-gray-700">Vertical Flip</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={mirrorImage}
                    disabled={processing}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Mirror Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Mirrored Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Mirror Images</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Image:</strong> Select a JPG, PNG, or WebP photo.</li>
                <li><strong>2. Choose Mode:</strong> Select horizontal or vertical flip.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Mirror Effect".</li>
                <li><strong>4. Download:</strong> Save your mirrored image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mirror Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Flexible Flipping</h3>
                  <p className="text-gray-700">Horizontal or vertical flip options for any orientation.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Mirror Layouts</h3>
                  <p className="text-gray-700">Create mirror images and symmetric artwork.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">Browser-Based Processing</h3>
                  <p className="text-gray-700">Apply horizontal or vertical mirroring in your browser.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-teal-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or subscription required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the difference between horizontal and vertical flip?</summary>
                  <p className="text-gray-700 mt-2">Horizontal flips left-to-right. Vertical flips top-to-bottom.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use flipped images commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, all flipped images can be used for any purpose.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does quality change when flipping?</summary>
                  <p className="text-gray-700 mt-2">The image dimensions are retained during the flip, and the downloaded result is encoded as a JPEG.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What formats are supported?</summary>
                  <p className="text-gray-700 mt-2">The upload control supports JPG, PNG, and WebP images.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image stored?</summary>
                  <p className="text-gray-700 mt-2">The image flip itself happens in your browser. When you choose Download, the processed JPEG is sent through the download-result service so the download page can be prepared.</p>
                </details>
                <details className="border-l-4 border-teal-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I flip multiple times?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and upload again to apply more flips.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Image Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/rotate-image" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Rotate Image</h3>
                  <p className="text-sm text-gray-600">Rotate images any angle</p>
                </Link>
                <Link href="/all-tools/crop-image" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Crop Image</h3>
                  <p className="text-sm text-gray-600">Crop and resize photos</p>
                </Link>
                <Link href="/all-tools/sharpen-image" className="p-4 border-2 border-teal-200 rounded-lg hover:bg-teal-50 transition">
                  <h3 className="font-bold text-gray-800">Sharpen Image</h3>
                  <p className="text-sm text-gray-600">Adjust apparent edge contrast</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Batch supporting content: mirror-image */}
        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Horizontal and vertical image mirroring
              </h2>
              <p className="text-gray-600 leading-7">
                Horizontal mirroring reverses the image from left to right, while vertical mirroring reverses it from top to bottom. The tool performs the transformation on a browser canvas while keeping the canvas dimensions equal to the loaded image dimensions. The downloaded result is encoded as JPEG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Browser-based image processing
                </h3>
                <p className="text-gray-600 leading-7">
                  The visual transformation is performed with browser canvas
                  processing. The uploaded image is drawn to a canvas and the
                  selected effect is applied before the result is prepared for
                  download.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  JPEG output
                </h3>
                <p className="text-gray-600 leading-7">
                  The processed canvas is encoded as a JPEG for download.
                  The downloaded file is JPEG encoded, so its compression
                  characteristics can differ from those of the original
                  uploaded image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Choosing an image for this effect
              </h2>
              <p className="text-gray-600 leading-7">
                JPG, PNG, and WebP images are supported by the upload control.
                The appearance of the effect depends on the colors, contrast,
                details, and composition of the source image. Try different
                settings when available to find a result that suits the image.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What happens to image dimensions?
              </h2>
              <p className="text-gray-600 leading-7">
                The processing canvas uses the loaded image width and height.
                The effect changes the visual pixel content rather than acting
                as an image resizing tool.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better effect results
              </h2>
              <ul className="text-gray-600 leading-7 list-disc pl-6 space-y-2">
                <li>Start with a clear source image at a useful resolution.</li>
                <li>Use the available control gradually instead of assuming the maximum setting will look best.</li>
                <li>Compare the processed preview with the source before downloading.</li>
                <li>Remember that the final downloaded file is JPEG output.</li>
              </ul>
            </div>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Mirror Image',
          description: 'Free online mirror image and flip tool',
          url: 'https://simplifyconvert.com/all-tools/mirror-image',
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
