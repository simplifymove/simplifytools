'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Zap } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function MotionBlurPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical' | 'diagonal'>('horizontal');
  const [amount, setAmount] = useState(5);
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

  const applyMotionBlur = async () => {
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

          const result = new Uint8ClampedArray(data.length);
          for (let i = 0; i < data.length; i++) result[i] = 0;

          for (let blur = 0; blur < amount; blur++) {
            let dx = 0, dy = 0;
            if (direction === 'horizontal') dx = blur;
            else if (direction === 'vertical') dy = blur;
            else if (direction === 'diagonal') { dx = blur; dy = blur; }

            for (let i = 0; i < canvas.height; i++) {
              for (let j = 0; j < canvas.width; j++) {
                const x = j + dx;
                const y = i + dy;
                if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                  const idx = (y * canvas.width + x) * 4;
                  const resultIdx = (i * canvas.width + j) * 4;
                  result[resultIdx] += data[idx];
                  result[resultIdx + 1] += data[idx + 1];
                  result[resultIdx + 2] += data[idx + 2];
                  result[resultIdx + 3] += data[idx + 3];
                }
              }
            }
          }

          for (let i = 0; i < result.length; i += 4) {
            data[i] = Math.floor(result[i] / amount);
            data[i + 1] = Math.floor(result[i + 1] / amount);
            data[i + 2] = Math.floor(result[i + 2] / amount);
            data[i + 3] = Math.floor(result[i + 3] / amount);
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
      console.error('Error applying motion blur:', error);
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
            toolSlug: 'motion-blur',
            originalName: `motion-blur-${Date.now()}.jpg`,
            outputName: `motion-blur-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Motion Blur</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">💨 Motion Blur</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply dynamic motion blur effects. Create stunning motion-blurred photos with directional control.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Motion Blur</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Blur Direction</label>
                    <div className="flex gap-4">
                      {['horizontal', 'vertical', 'diagonal'].map((dir) => (
                        <label key={dir} className="flex items-center gap-2">
                          <input
                            type="radio"
                            value={dir}
                            checked={direction === dir}
                            onChange={(e) => setDirection(e.target.value as 'horizontal' | 'vertical' | 'diagonal')}
                            className="cursor-pointer"
                          />
                          <span className="text-gray-700 capitalize">{dir}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Blur Amount: {amount}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 20 = strong motion blur</p>
                  </div>

                  <button
                    onClick={applyMotionBlur}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                    {processing ? 'Processing...' : 'Apply Motion Blur'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Motion Blurred Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Apply Motion Blur</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Choose Direction:</strong> Select horizontal, vertical, or diagonal blur.</li>
                <li><strong>3. Adjust Amount:</strong> Control blur intensity (1-20).</li>
                <li><strong>4. Download:</strong> Save your motion-blurred image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Motion Blur Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Dynamic Effect</h3>
                  <p className="text-gray-700">Create stunning motion effects.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Directional Control</h3>
                  <p className="text-gray-700">Choose blur direction precisely.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust blur amount for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Which direction should I use?</summary>
                  <p className="text-gray-700 mt-2">Choose based on desired motion direction. Horizontal for left-right, vertical for up-down.</p>
                </details>
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What amount should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5 for subtle effect. Higher for stronger motion blur.</p>
                </details>
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Works on all images?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by content.</p>
                </details>
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use commercially?</summary>
                  <p className="text-gray-700 mt-2">Yes, motion-blurred images can be used commercially.</p>
                </details>
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in browser.</p>
                </details>
                <details className="border-l-4 border-blue-600 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What output format?</summary>
                  <p className="text-gray-700 mt-2">High-quality JPEG with excellent blur preservation.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Effect Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/blur-image" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Blur Image</h3>
                  <p className="text-sm text-gray-600">Gaussian blur effects</p>
                </Link>
                <Link href="/all-tools/tilt-shift" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Tilt Shift</h3>
                  <p className="text-sm text-gray-600">Selective focus blur</p>
                </Link>
                <Link href="/all-tools/glow-effect" className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <h3 className="font-bold text-gray-800">Glow Effect</h3>
                  <p className="text-sm text-gray-600">Luminous effects</p>
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
          name: 'Motion Blur',
          description: 'Free online motion blur and dynamic motion effect tool',
          url: 'https://simplifyconvert.com/all-tools/motion-blur',
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
