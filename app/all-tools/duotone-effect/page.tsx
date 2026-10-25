'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';


import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function DuotoneEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [color1, setColor1] = useState('#ff00ff');
  const [color2, setColor2] = useState('#00ffff');
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const applyDuotoneEffect = async () => {
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

          const c1 = hexToRgb(color1);
          const c2 = hexToRgb(color2);

          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const intensity = gray / 255;

            data[i] = Math.round(c1.r * (1 - intensity) + c2.r * intensity);
            data[i + 1] = Math.round(c1.g * (1 - intensity) + c2.g * intensity);
            data[i + 2] = Math.round(c1.b * (1 - intensity) + c2.b * intensity);
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
      console.error('Error applying duotone effect:', error);
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
            toolSlug: 'duotone-effect',
            originalName: `duotone-${Date.now()}.jpg`,
            outputName: `duotone-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Duotone Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Duotone Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create stunning two-color artistic image conversions. Transform photos into beautiful duotone artwork.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Duotone Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Shadow Color</label>
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-full h-12 cursor-pointer rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Highlight Color</label>
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-full h-12 cursor-pointer rounded"
                      />
                    </div>
                  </div>

                  <button
                    onClick={applyDuotoneEffect}
                    disabled={processing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply Duotone Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Duotone Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Duotone Images</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Choose Colors:</strong> Select shadow and highlight colors.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Duotone Effect".</li>
                <li><strong>4. Download:</strong> Save your duotone artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Duotone Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Artistic Style</h3>
                  <p className="text-gray-700">Create stunning artistic duotone effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Custom Colors</h3>
                  <p className="text-gray-700">Choose any color combination you prefer.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Professional Look</h3>
                  <p className="text-gray-700">Create sophisticated color schemes.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What colors should I pick?</FAQQuestion>
                  <FAQAnswer>Choose contrasting colors for best effect. Dark for shadows, bright for highlights.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use any color combination?</FAQQuestion>
                  <FAQAnswer>Yes! Pick any two colors you like from the color picker.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all photos?</FAQQuestion>
                  <FAQAnswer>Yes, works on any photo. Results vary based on content.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>Yes, duotone images can be used for commercial purposes.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is data private?</FAQQuestion>
                  <FAQAnswer>Yes, all processing happens locally in your browser.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What output format?</FAQQuestion>
                  <FAQAnswer>High-quality JPEG with excellent color preservation.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/hue-saturation" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Hue Saturation</h3>
                  <p className="text-sm text-gray-600">Color adjustments</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Professional grading</p>
                </Link>
                <Link href="/all-tools/invert-colors" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Invert Colors</h3>
                  <p className="text-sm text-gray-600">Negative effects</p>
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
                How the Duotone Effect works
              </h2>
              <p className="text-gray-600 leading-7">
Upload an image and choose the available duotone controls.
                The browser processes the image pixels and maps tonal values
                into a two-color style. Preview the result before downloading
                the processed image.
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
                  Duotone processing remaps image tones for a stylized color treatment; it does not add detail that is missing from the source.
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

            <FAQPanel>
              <FAQHeading>
                the Duotone Effect works FAQ
              </FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>
                    Does the effect increase image resolution?
                  </FAQQuestion>
                  <FAQAnswer>
                    No. The tool changes the appearance of existing image
                    pixels; it does not reconstruct missing source detail.
                  </FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>
                    Can I preview the result before downloading?
                  </FAQQuestion>
                  <FAQAnswer>
                    Yes. Use the on-page preview and available controls to
                    inspect the processed image before downloading it.
                  </FAQAnswer>
                </FAQDisclosure>
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
          name: 'Duotone Effect',
          description: 'Free online duotone effect and two-color image converter',
          url: 'https://simplifyconvert.com/all-tools/duotone-effect',
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
