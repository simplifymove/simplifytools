'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function NeonGlowPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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

  const applyNeonGlow = async () => {
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
          const factor = intensity / 50;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            const brightness = gray / 255;

            data[i] = Math.min(255, r + (255 - r) * brightness * factor * 0.6);
            data[i + 1] = Math.min(255, g * (1 - factor * 0.3));
            data[i + 2] = Math.min(255, b + (255 - b) * brightness * factor * 0.8);
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
      console.error('Error applying neon glow:', error);
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
            toolSlug: 'neon-glow',
            originalName: `neon-glow-${Date.now()}.jpg`,
            outputName: `neon-glow-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Neon Glow Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">💡 Neon Glow Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Create vibrant neon lighting effects. Transform your images with glowing neon colors and luminous effects.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Neon Glow</h2>
              
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
                      Glow Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = subtle, 100 = intense neon glow</p>
                  </div>

                  <button
                    onClick={applyNeonGlow}
                    disabled={processing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Neon Glow'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Neon Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Neon Glow</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control the neon glow strength.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Neon Glow".</li>
                <li><strong>4. Download:</strong> Save your neon-glowing image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Neon Glow Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Vibrant Colors</h3>
                  <p className="text-gray-700">Create glowing neon color effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Custom Intensity</h3>
                  <p className="text-gray-700">Control glow strength for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">Instant Processing</h3>
                  <p className="text-gray-700">Apply neon effects in seconds.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-cyan-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What This Neon Glow Tool Does</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Neon Glow tool adds a vibrant electric color treatment to your image, emphasizing bright areas with cyan, pink, and luminous highlights. It is built for stylized graphics, nightlife edits, social posts, and high-impact creative visuals.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Use Cases</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700 mb-6">
                <li className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">Create neon-style social media graphics and thumbnails.</li>
                <li className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">Add futuristic lighting to portraits, products, and event photos.</li>
                <li className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">Make dark images feel more energetic and colorful.</li>
                <li className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg">Design cyberpunk, music, gaming, or nightlife-inspired visuals.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Example</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Input</h4>
                  <p className="text-gray-700 text-sm">A portrait, city photo, product shot, or dark image with visible highlights.</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Output</h4>
                  <p className="text-gray-700 text-sm">A high-contrast JPEG with stronger neon colors and glowing highlight areas.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2">Privacy Note</h3>
                <p className="text-blue-900 text-sm">The neon glow effect is processed in your browser with canvas, so your image does not need to be uploaded for this edit.</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 50 for balanced effect. Higher for stronger glow.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by image content.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, neon glowed images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the output quality?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent color preservation.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in browser.</p>
                </details>
                <details className="border-l-4 border-cyan-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I apply multiple times?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and upload again for stronger effects.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <RelatedToolsSection family="image" toolId="neon-glow" limit={8} />
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Neon Glow Effect',
          description: 'Free online neon glow effect and neon lighting tool',
          url: 'https://simplifyconvert.com/all-tools/neon-glow',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What intensity should I use?', acceptedAnswer: { '@type': 'Answer', text: 'Start at 50 for a balanced neon effect. Increase it for stronger glow or reduce it for a subtler look.' } },
            { '@type': 'Question', name: 'Works on all photos?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, the effect works on any photo, though images with lights, contrast, and color usually produce the strongest neon look.' } },
            { '@type': 'Question', name: 'Is my image private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Neon glow processing runs locally in your browser.' } },
          ],
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://simplifyconvert.com' },
            { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://simplifyconvert.com/all-tools' },
            { '@type': 'ListItem', position: 3, name: 'Neon Glow Effect', item: 'https://simplifyconvert.com/all-tools/neon-glow' },
          ],
        })}
      </script>
    </>
  );
}
