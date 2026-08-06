'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function LensFlarePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [intensity, setIntensity] = useState(50);
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

  const applyLensFlare = async () => {
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

          const flareX = (posX / 100) * canvas.width;
          const flareY = (posY / 100) * canvas.height;
          const scale = (intensity / 50) * 2;

          // Main flare glow
          const mainGradient = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 150 * scale);
          mainGradient.addColorStop(0, `rgba(255, 255, 200, ${0.6 * (intensity / 100)})`);
          mainGradient.addColorStop(0.5, `rgba(255, 200, 100, ${0.3 * (intensity / 100)})`);
          mainGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

          ctx.fillStyle = mainGradient;
          ctx.fillRect(flareX - 150 * scale, flareY - 150 * scale, 300 * scale, 300 * scale);

          // Secondary lens glow
          const secondaryGradient = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 100 * scale);
          secondaryGradient.addColorStop(0, `rgba(200, 220, 255, ${0.4 * (intensity / 100)})`);
          secondaryGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

          ctx.fillStyle = secondaryGradient;
          ctx.fillRect(flareX - 100 * scale, flareY - 100 * scale, 200 * scale, 200 * scale);

          // Center bright spot
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (intensity / 100)})`;
          ctx.beginPath();
          ctx.arc(flareX, flareY, 20 * scale, 0, Math.PI * 2);
          ctx.fill();

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
      console.error('Error applying lens flare:', error);
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
            toolSlug: 'lens-flare',
            originalName: `lens-flare-${Date.now()}.jpg`,
            outputName: `lens-flare-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Lens Flare</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">✨ Lens Flare</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Add a stylized lens-flare effect with customizable positioning.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Lens Flare Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Position X: {posX}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={posX}
                        onChange={(e) => setPosX(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">
                        Position Y: {posY}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={posY}
                        onChange={(e) => setPosY(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = no flare, 100 = intense flare</p>
                  </div>

                  <button
                    onClick={applyLensFlare}
                    disabled={processing}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Lens Flare'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Flare Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Add Lens Flare</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Position Flare:</strong> Set X and Y coordinates for flare location.</li>
                <li><strong>3. Adjust Intensity:</strong> Control flare brightness (0-100).</li>
                <li><strong>4. Download:</strong> Save your flare-enhanced image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lens Flare Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Optical Effects</h3>
                  <p className="text-gray-700">Create customizable lens-flare-style overlays.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Custom Position</h3>
                  <p className="text-gray-700">Place flare exactly where you want.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Adjustable Intensity</h3>
                  <p className="text-gray-700">Control flare brightness and size.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Where should I place the flare?</summary>
                  <p className="text-gray-700 mt-2">Place in light areas for natural effect. Top-left or top-right is typical.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity looks best?</summary>
                  <p className="text-gray-700 mt-2">Start at 50 for balanced. Higher for dramatic, lower for subtle.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by image.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, flare images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in browser.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I add multiple flares?</summary>
                  <p className="text-gray-700 mt-2">Download and upload again to add more flares.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/neon-glow" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Neon Glow</h3>
                  <p className="text-sm text-gray-600">Neon lighting effects</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous effects</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro effects</p>
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
                How the Lens Flare effect works
              </h2>
              <p className="text-gray-600 leading-7">
The tool draws stylized flare elements over the uploaded image
                using browser Canvas graphics. Position and other available
                controls determine where the simulated light artifacts appear.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The effect is generated with browser image and Canvas
                  processing. No separate server conversion step is used for
                  the visual effect itself.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the effect changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The flare is a visual overlay effect; it does not analyze the camera lens or recreate optical flare from real scene data.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with a clear source image and use moderate settings
                before increasing the effect. Compare the preview with the
                original because stronger processing can intentionally reduce
                or exaggerate visible detail.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                the Lens Flare effect works FAQ
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. The tool changes or overlays existing image pixels and
                    does not reconstruct missing source detail.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview the effect before downloading?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Use the available controls and preview to inspect the
                    result before downloading it.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

</main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Lens Flare',
          description: 'Free online lens flare effect and optical artifact tool',
          url: 'https://simplifyconvert.com/all-tools/lens-flare',
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
