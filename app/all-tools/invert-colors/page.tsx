'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function InvertColorsPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const applyInvertColors = async () => {
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

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // Alpha channel (i+3) remains unchanged
          }

          ctx.putImageData(imageData, 0, 0);
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
      console.error('Error applying invert colors:', error);
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
            toolSlug: 'invert-colors',
            originalName: `inverted-${Date.now()}.jpg`,
            outputName: `inverted-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Invert Colors</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Invert Colors</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create a negative-style image by reversing the red, green, and blue pixel values. The processed result is exported as a JPG file.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Invert Image Colors</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 transition"
                />
              </div>

              {preview && (
                <>
                  <button
                    onClick={applyInvertColors}
                    disabled={processing}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Invert Colors'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Inverted Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Invert Image Colors</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Image:</strong> Select a JPG, PNG, or WebP image file.</li>
                <li><strong>2. Click Invert:</strong> Press "Invert Colors" to process your image.</li>
                <li><strong>3. Process the Image:</strong> Wait for the tool to create the inverted JPG and enable the download button.</li>
                <li><strong>4. Download:</strong> Save your inverted image as JPG.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Creative Uses for Color Inversion</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create unique and surreal visual styles for creative projects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Photo Negatives</h3>
                  <p className="text-gray-700">Replicate the classic film negative look digitally.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">Design Experimentation</h3>
                  <p className="text-gray-700">Explore color palettes and visual compositions.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-600 mb-2">100% Free Tool</h3>
                  <p className="text-gray-700">No subscription, registration, or hidden fees required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What does inverting colors mean?</FAQQuestion>
                  <FAQAnswer>It converts each RGB color value to 255 minus that value, creating a negative image effect.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is this like photo negative?</FAQQuestion>
                  <FAQAnswer>Yes! It simulates the classic film negative appearance you'd see on old film slides.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I invert twice to restore original?</FAQQuestion>
                  <FAQAnswer>Applying RGB inversion twice can approximately restore the original colors, but JPEG compression may introduce changes. Keep the original file if exact restoration matters.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What formats are supported?</FAQQuestion>
                  <FAQAnswer>The upload accepts image files that your browser can decode. JPG, PNG, and WebP are common choices; support for formats such as TIFF varies by browser. The output is JPG.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my image private?</FAQQuestion>
                  <FAQAnswer>The color inversion is performed in your browser using Canvas. When you choose to download, the generated JPG is uploaded to prepare the download page. Review the Privacy Policy before processing sensitive images.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Does it preserve image quality?</FAQQuestion>
                  <FAQAnswer>The output is encoded as JPG at a quality setting of 95%. JPEG compression is lossy, and transparent areas are not preserved as transparency. Keep your original image.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Image Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/black-white" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Black & White</h3>
                  <p className="text-sm text-gray-600">Convert to grayscale</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Professional color adjustment</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-rose-200 rounded-lg hover:bg-rose-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro color effects</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the Invert Colors tool works
              </h2>
              <p className="text-gray-600 leading-7">
The tool reads the image pixels in your browser and reverses
                each red, green, and blue channel value. Dark areas become
                light, light areas become dark, and colors shift to their
                inverse values. The processed image can then be downloaded.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The image effect is produced with browser image and Canvas
                  processing. The generated JPG is prepared for the download action;
                  this page does not display a separate processed-image preview.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect changes pixel colors rather than changing the dimensions of the source image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and keep the original file.
                The inversion changes RGB colors without offering an effect-strength
                control. The JPG export may introduce compression artifacts or
                remove transparency, so inspect the downloaded result before use.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                More About Inverting Image Colors
              </FAQHeading>
              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Does the effect increase image resolution?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. The tool changes the appearance of existing image
                    pixels; it does not reconstruct missing source detail.
                  </FAQAnswer>
                </FAQCard>
                <FAQCard>
                  <FAQStaticQuestion>
                    Why is the inverted image downloaded as JPG?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    The tool exports the processed Canvas image as JPG at a
                    quality setting of 95%. JPG is a lossy format and does
                    not preserve transparency. The download button becomes
                    available after processing.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>
          </div>
        </section>

</main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Invert Colors',
          description: 'Free online color inversion tool for creative effects',
          url: 'https://simplifyconvert.com/all-tools/invert-colors',
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
