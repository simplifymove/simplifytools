'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function GlitchEffectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
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

  const applyGlitchEffect = async () => {
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

          for (let i = 0; i < intensity; i++) {
            const glitchY = Math.floor(Math.random() * canvas.height);
            const glitchHeight = Math.floor(Math.random() * 50) + 10;
            const glitchX = Math.floor(Math.random() * 30) - 15;
            const glitchAmount = Math.random() > 0.5 ? 1 : -1;

            for (let y = glitchY; y < glitchY + glitchHeight && y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const sourceX = Math.min(Math.max(x + glitchX * glitchAmount, 0), canvas.width - 1);
                const idx = (y * canvas.width + x) * 4;
                const sourceIdx = (y * canvas.width + sourceX) * 4;

                data[idx] = data[sourceIdx];
                data[idx + 1] = data[sourceIdx + 1];
                data[idx + 2] = data[sourceIdx + 2];
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
      console.error('Error applying glitch effect:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `glitch-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Glitch Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">⚡ Glitch Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create digital glitch and corruption effects. Transform photos with stunning glitch artifacts and distortions.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Glitch Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Glitch Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle glitch, 20 = severe corruption</p>
                  </div>

                  <button
                    onClick={applyGlitchEffect}
                    disabled={processing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Glitch Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Glitched Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Glitch Effect</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control glitch severity (1-20).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Glitch Effect".</li>
                <li><strong>4. Download:</strong> Save your glitched artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Glitch Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Digital Aesthetics</h3>
                  <p className="text-gray-700">Create trendy glitch art effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Creative Control</h3>
                  <p className="text-gray-700">Adjust intensity for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Instant Results</h3>
                  <p className="text-gray-700">Apply glitch effects in seconds.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5 for subtle. Higher for more corruption.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by content.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, glitch images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with glitch effects.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-red-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Different each time?</summary>
                  <p className="text-gray-700 mt-2">Yes, glitches are randomly generated.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/pixel ize-image" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Pixelate Image</h3>
                  <p className="text-sm text-gray-600">Pixel effects</p>
                </Link>
                <Link href="/all-tools/cartoon-effect" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Cartoon Effect</h3>
                  <p className="text-sm text-gray-600">Comic style</p>
                </Link>
                <Link href="/all-tools/neon-glow" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Neon Glow</h3>
                  <p className="text-sm text-gray-600">Neon effects</p>
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
          name: 'Glitch Effect',
          description: 'Free online glitch effect and digital corruption tool',
          url: 'https://simplifyconvert.com/all-tools/glitch-effect',
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
