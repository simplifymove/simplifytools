'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function SunburstPage() {
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

  const applySunburst = async () => {
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

          const centerX = (posX / 100) * canvas.width;
          const centerY = (posY / 100) * canvas.height;
          const scale = (intensity / 50) * 2;

          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const gradient = ctx.createLinearGradient(
              centerX,
              centerY,
              centerX + Math.cos(angle) * canvas.width * scale,
              centerY + Math.sin(angle) * canvas.height * scale
            );
            gradient.addColorStop(0, `rgba(255, 200, 0, ${0.3 * (intensity / 100)})`);
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * canvas.width * scale, centerY + Math.sin(angle) * canvas.height * scale);
            ctx.lineTo(centerX + Math.cos(angle + 0.3) * canvas.width * scale, centerY + Math.sin(angle + 0.3) * canvas.height * scale);
            ctx.closePath();
            ctx.fill();
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
      console.error('Error applying sunburst:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sunburst-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Sunburst Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">☀️ Sunburst Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Add radial sunburst and light ray effects. Create stunning sunburst lighting instantly.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Sunburst Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 transition"
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
                    <p className="text-sm text-gray-600 mt-2">0 = no rays, 100 = intense sunburst</p>
                  </div>

                  <button
                    onClick={applySunburst}
                    disabled={processing}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Sunburst'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Sunburst Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Add Sunburst</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Position Rays:</strong> Set X and Y coordinates for sunburst center.</li>
                <li><strong>3. Adjust Intensity:</strong> Control ray brightness (0-100).</li>
                <li><strong>4. Download:</strong> Save your sunburst image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sunburst Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-amber-600 mb-2">Light Rays</h3>
                  <p className="text-gray-700">Add beautiful radial light rays.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-600 mb-2">Custom Position</h3>
                  <p className="text-gray-700">Place sunburst anywhere on image.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-600 mb-2">Adjustable</h3>
                  <p className="text-gray-700">Control ray intensity and position.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Where should I place the sunburst?</summary>
                  <p className="text-gray-700 mt-2">Place in light areas. Top-left or top-right is typical.</p>
                </details>
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity works best?</summary>
                  <p className="text-gray-700 mt-2">Start at 50 for balanced. Higher for dramatic effect.</p>
                </details>
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo.</p>
                </details>
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, sunburst images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, local browser processing only.</p>
                </details>
                <details className="border-l-4 border-amber-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I add multiple sunbursts?</summary>
                  <p className="text-gray-700 mt-2">Download and upload again to add more.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/lens-flare" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Lens Flare</h3>
                  <p className="text-sm text-gray-600">Optical flare effects</p>
                </Link>
                <Link href="/all-tools/neon-glow" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Neon Glow</h3>
                  <p className="text-sm text-gray-600">Neon lighting effects</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous glow effects</p>
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
          name: 'Sunburst Effect',
          description: 'Free online sunburst and radial light rays photo effect tool',
          url: 'https://simplifyconvert.com/all-tools/sunburst',
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
