'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Eye } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';

export default function AddOpacityPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(100);
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

  const applyOpacity = async () => {
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

          ctx.globalAlpha = opacity / 100;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Failed to create blob');
              setProcessing(false);
              return;
            }
            setResult(blob);
            setProcessing(false);
          }, 'image/png', 1.0);
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
      console.error('Error applying opacity:', error);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opacity-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Add Opacity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">👁️ Add Opacity</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Control transparency and opacity in images. Create transparent PNG files with custom opacity levels.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Control Image Opacity</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Opacity: {opacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0% = fully transparent, 100% = fully opaque</p>
                  </div>

                  <button
                    onClick={applyOpacity}
                    disabled={processing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Eye size={20} />}
                    {processing ? 'Processing...' : 'Apply Opacity'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Transparent PNG
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Add Opacity</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Image:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Set Opacity:</strong> Use slider to adjust transparency (0-100%).</li>
                <li><strong>3. Apply:</strong> Click "Apply Opacity" to process.</li>
                <li><strong>4. Download:</strong> Save as transparent PNG file.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Opacity Control Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Transparency Control</h3>
                  <p className="text-gray-700">Precisely adjust image transparency levels.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">PNG Export</h3>
                  <p className="text-gray-700">Save as transparent PNG format.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Watermark Creation</h3>
                  <p className="text-gray-700">Create semi-transparent watermarks.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No cost, no registration required.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What format is the output?</summary>
                  <p className="text-gray-700 mt-2">Output is transparent PNG format for best transparency support.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use for watermarks?</summary>
                  <p className="text-gray-700 mt-2">Yes! Perfect for creating semi-transparent watermarks.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the difference between 0% and 100%?</summary>
                  <p className="text-gray-700 mt-2">0% is completely transparent, 100% is fully visible/opaque.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this support all image types?</summary>
                  <p className="text-gray-700 mt-2">Yes, supports JPG, PNG, WebP, BMP, TIFF, and standard formats.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image stored?</summary>
                  <p className="text-gray-700 mt-2">No, all processing happens locally in your browser.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I adjust opacity of specific areas?</summary>
                  <p className="text-gray-700 mt-2">This tool adjusts the entire image. Use an editor for selective opacity.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Transparency Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/watermark-image" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
                  <h3 className="font-bold text-gray-800">Watermark Image</h3>
                  <p className="text-sm text-gray-600">Add text watermarks</p>
                </Link>
                <Link href="/all-tools/remove-background" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
                  <h3 className="font-bold text-gray-800">Remove Background</h3>
                  <p className="text-sm text-gray-600">Auto background removal</p>
                </Link>
                <Link href="/all-tools/make-background-transparent" className="p-4 border-2 border-cyan-200 rounded-lg hover:bg-cyan-50 transition">
                  <h3 className="font-bold text-gray-800">Transparent Background</h3>
                  <p className="text-sm text-gray-600">Create transparent backgrounds</p>
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
          name: 'Add Opacity',
          description: 'Free online image opacity and transparency control tool',
          url: 'https://simplifyconvert.com/all-tools/add-opacity',
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
