'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function VignetteEffectPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [vignetteStrength, setVignetteStrength] = useState(50);
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

  const applyVignette = async () => {
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
          
          const radialGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
          );
          const strength = vignetteStrength / 100;
          radialGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
          radialGradient.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
          
          ctx.fillStyle = radialGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      console.error('Error applying vignette:', error);
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
            toolSlug: 'vignette-effect',
            originalName: 'vignette-image.jpg',
            outputName: 'vignette-image.jpg',
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
        <div className="bg-gradient-to-r from-slate-400 via-gray-400 to-slate-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Vignette Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎬 Vignette Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Add professional vignette borders to your photos instantly. Darken the edges to create a focal point effect and draw attention to the center of your images.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Perfect for creating professional-looking photos with enhanced visual impact.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Vignette Effect</h2>
              
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
                    <label className="block text-gray-700 font-semibold mb-3">Vignette Strength: {vignetteStrength}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vignetteStrength}
                      onChange={(e) => setVignetteStrength(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applyVignette}
                    disabled={processing}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Vignette'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Vignette Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Vignette Effect</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Click to select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Strength:</strong> Use the slider to control how dark the vignette edges appear (0-100%).</li>
                <li><strong>3. Preview Effect:</strong> Lower values create subtle vignettes, higher values create stronger edge darkening.</li>
                <li><strong>4. Apply Effect:</strong> Click "Apply Vignette" to process your image with the effect.</li>
                <li><strong>5. Download:</strong> Save your vignette-enhanced photo to your device.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Benefits of Vignette Effects</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Enhanced Focus</h3>
                  <p className="text-gray-700">Draw viewer attention to the center of your image with darkened edges.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Professional Look</h3>
                  <p className="text-gray-700">Add a polished, cinema-quality effect to your photos instantly.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Adjustable Intensity</h3>
                  <p className="text-gray-700">Control vignette strength from subtle to dramatic for any photo.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-700 mb-2">Instant Processing</h3>
                  <p className="text-gray-700">See results immediately with our fast, browser-based processing.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is a vignette effect?</summary>
                  <p className="text-gray-700 mt-2">A vignette is a darkening or fading of the edges of an image, often creating a fade-to-black effect that draws focus to the center.</p>
                </details>
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Why use vignettes in photography?</summary>
                  <p className="text-gray-700 mt-2">Vignettes improve composition by directing viewer focus to the subject, add emotional depth, and create professional, polished results.</p>
                </details>
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What vignette strength should I use?</summary>
                  <p className="text-gray-700 mt-2">Start with 30-50% for subtle effects. Use 50-70% for moderate vignettes, or 80-100% for dramatic, pronounced effects.</p>
                </details>
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all photo types?</summary>
                  <p className="text-gray-700 mt-2">Yes! Vignettes work beautifully on portraits, landscapes, still life, and any photo type.</p>
                </details>
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I remove vignette afterward?</summary>
                  <p className="text-gray-700 mt-2">No, vignettes are permanent once applied. Always keep your original image as backup.</p>
                </details>
                <details className="border-l-4 border-slate-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is the quality affected?</summary>
                  <p className="text-gray-700 mt-2">No! Vignette application maintains full image quality throughout the process.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Photo Enhancement Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro photo effects</p>
                </Link>
                <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Image Enhancer</h3>
                  <p className="text-sm text-gray-600">Boost brightness & contrast</p>
                </Link>
                <Link href="/all-tools/sepia-filter" className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <h3 className="font-bold text-gray-800">Sepia Filter</h3>
                  <p className="text-sm text-gray-600">Classic sepia tones</p>
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
          name: 'Vignette Effect',
          description: 'Free tool to add vignette effects and edge darkening to photos',
          url: 'https://simplifyconvert.com/all-tools/vignette-effect',
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
