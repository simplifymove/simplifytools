'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Mountain } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function EmbossEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [strength, setStrength] = useState(50);
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

  const applyEmbossEffect = async () => {
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

          // Apply emboss filter
          const factor = strength / 50;
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const idx = (y * canvas.width + x) * 4;

              for (let c = 0; c < 3; c++) {
                const topLeft = data[((y - 1) * canvas.width + (x - 1)) * 4 + c];
                const topCenter = data[((y - 1) * canvas.width + x) * 4 + c];
                const topRight = data[((y - 1) * canvas.width + (x + 1)) * 4 + c];
                const middleLeft = data[(y * canvas.width + (x - 1)) * 4 + c];
                const middle = data[idx + c];
                const middleRight = data[(y * canvas.width + (x + 1)) * 4 + c];
                const bottomLeft = data[((y + 1) * canvas.width + (x - 1)) * 4 + c];
                const bottomCenter = data[((y + 1) * canvas.width + x) * 4 + c];
                const bottomRight = data[((y + 1) * canvas.width + (x + 1)) * 4 + c];

                const emboss = (topLeft * -2 + topCenter * -1 + middleLeft * -1 + middle * 1 +
                               middleRight * 1 + bottomCenter * 1 + bottomRight * 2) * factor + 128;

                data[idx + c] = Math.min(255, Math.max(0, emboss));
              }
            }
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
      console.error('Error applying emboss effect:', error);
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
            toolSlug: 'emboss-effect',
            originalName: `emboss-${Date.now()}.jpg`,
            outputName: `emboss-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Emboss Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">⛰️ Emboss Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply 3D embossing and relief effects to images. Create stunning embossed artwork with depth.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Emboss Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Strength: {strength}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">Lower = subtle, Higher = stronger emboss</p>
                  </div>

                  <button
                    onClick={applyEmbossEffect}
                    disabled={processing}
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Mountain size={20} />}
                    {processing ? 'Processing...' : 'Apply Emboss Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Embossed Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Emboss Effect</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Strength:</strong> Control emboss depth and intensity.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Emboss Effect".</li>
                <li><strong>4. Download:</strong> Save your embossed artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Emboss Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">3D Relief Effect</h3>
                  <p className="text-gray-700">Create stunning 3D embossed appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Depth Creation</h3>
                  <p className="text-gray-700">Add visual depth and dimension to images.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust emboss strength for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-700 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What strength should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 50 for balanced effect. Lower for subtle, higher for dramatic.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this work on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works best on detailed photos. Results vary by content.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, embossed images can be used for commercial purposes.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent effect preservation.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in your browser.</p>
                </details>
                <details className="border-l-4 border-gray-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I undo changes?</summary>
                  <p className="text-gray-700 mt-2">Upload again to start fresh with different settings.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style effects</p>
                </Link>
                <Link href="/all-tools/sharpen-image" className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Sharpen Image</h3>
                  <p className="text-sm text-gray-600">Enhance clarity</p>
                </Link>
                <Link href="/all-tools/sketch-effect" className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <h3 className="font-bold text-gray-800">Sketch Effect</h3>
                  <p className="text-sm text-gray-600">Pencil sketch filter</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Emboss Effect',
          description: 'Free online emboss effect and 3D relief filter',
          url: 'https://simplifyconvert.com/all-tools/emboss-effect',
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
