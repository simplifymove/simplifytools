'use client';
import { FAQAnswer, FAQCard, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion, FAQStaticQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function FilmNoirPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [contrast, setContrast] = useState(50);
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

  const applyFilmNoir = async () => {
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
          const factor = (contrast - 50) / 50;

          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

            let value = gray;
            if (factor > 0) {
              value = gray + (255 - gray) * factor * 0.5;
            } else {
              value = gray * (1 + factor * 0.5);
            }

            data[i] = Math.min(255, Math.max(0, value));
            data[i + 1] = Math.min(255, Math.max(0, value));
            data[i + 2] = Math.min(255, Math.max(0, value));
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
      console.error('Error applying film noir:', error);
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
            toolSlug: 'film-noir',
            originalName: `film-noir-${Date.now()}.jpg`,
            outputName: `film-noir-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Film Noir</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎬 Film Noir</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert to classic film noir style with high contrast. Create dramatic black and white images.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Film Noir Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-slate-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Contrast: {contrast}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = darker grayscale, 100 = lighter grayscale</p>
                  </div>

                  <button
                    onClick={applyFilmNoir}
                    disabled={processing}
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply Film Noir'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Noir Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Film Noir</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Contrast:</strong> Adjust the grayscale brightness (0-100).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Film Noir".</li>
                <li><strong>4. Download:</strong> Save your noir image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Film Noir Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Dramatic Style</h3>
                  <p className="text-gray-700">Create classic film noir atmosphere.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">High Contrast</h3>
                  <p className="text-gray-700">Dramatic blacks and whites effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust contrast level for desired look.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What contrast should I use?</FAQQuestion>
                  <FAQAnswer>Start at 50 for the original grayscale brightness. Lower settings darken the image; higher settings lighten it.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all photos?</FAQQuestion>
                  <FAQAnswer>Works with images your browser can decode, including common JPG, PNG, and WebP files. Results vary with the source photo.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Commercial use depends on your rights to the original image and any applicable licenses or permissions.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Output quality?</FAQQuestion>
                  <FAQAnswer>The result is exported as JPEG at a 95% quality setting. JPEG compression is lossy, so some detail may change.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>The effect is applied in your browser. When you request a download, the generated JPEG is uploaded to prepare the download page.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>True black and white?</FAQQuestion>
                  <FAQAnswer>Yes, grayscale conversion with contrast.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/grayscale-image" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Grayscale Image</h3>
                  <p className="text-sm text-gray-600">Black and white conversion</p>
                </Link>
                <Link href="/all-tools/sepia-filter" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Sepia Filter</h3>
                  <p className="text-sm text-gray-600">Vintage sepia tones</p>
                </Link>
                <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Image Enhancer</h3>
                  <p className="text-sm text-gray-600">Brightness & contrast</p>
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
                How the Film Noir effect works
              </h2>
              <p className="text-gray-600 leading-7">
Upload an image and apply the available film noir controls.
                The browser processes the image pixels to create a
                grayscale result with adjustable brightness. View the original
                image before processing, then download the generated JPEG.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The image effect is produced with browser image and Canvas
                  processing. The upload preview shows the original image before
                  processing; the download action saves the processed result.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect changes color and tonal values for a noir-inspired appearance; results depend on the lighting and contrast in the original image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and consider the lighting and detail in
                the original before processing. Extreme brightness settings can
                intentionally remove or alter visible detail, so choose the
                setting according to the result you need.
              </p>
            </div>

            <FAQPanel>
              <FAQHeading>
                Film Noir effect FAQs
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
                    Can I preview the result before downloading?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    The on-page preview shows the uploaded image. Apply the effect to
                    generate the JPEG; the current page does not display a processed-image preview.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>
          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Film Noir',
          description: 'Free online film noir and high contrast black and white photo converter',
          url: 'https://simplifyconvert.com/all-tools/film-noir',
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
