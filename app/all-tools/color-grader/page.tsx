'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function ColorGraderPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [colorBalance, setColorBalance] = useState(0);
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

  const applyColorGrading = async () => {
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

          ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation}%)`;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const balance = colorBalance / 100;

          for (let i = 0; i < data.length; i += 4) {
            if (balance > 0) {
              data[i] = Math.min(255, data[i] + 20 * balance);
            } else {
              data[i + 2] = Math.min(255, data[i + 2] - 20 * Math.abs(balance));
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
      console.error('Error applying color grading:', error);
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
          toolSlug: 'color-grader',
          originalName: 'color-graded-image.jpg',
          outputName: 'color-graded-image.jpg',
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
        <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Color Grader</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Color Grader</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Grade and adjust colors in your photos like a professional. Control hue, saturation, and color balance to achieve the perfect look.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Professional-grade color correction tools, completely free and easy to use.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Grade Your Image</h2>

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
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Hue: {hue}°</label>
                      <input type="range" min="-180" max="180" value={hue} onChange={(e) => setHue(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Saturation: {saturation}%</label>
                      <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Color Balance: {colorBalance}</label>
                      <input type="range" min="-100" max="100" value={colorBalance} onChange={(e) => setColorBalance(Number(e.target.value))} className="w-full" />
                    </div>
                  </div>

                  <button
                    onClick={applyColorGrading}
                    disabled={processing}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Color Grading'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Graded Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Color Grader</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Image:</strong> Select a photo from your device (JPG, PNG, WebP supported).</li>
                <li><strong>2. Adjust Hue:</strong> Rotate the color wheel from -180° to 180° to shift colors.</li>
                <li><strong>3. Control Saturation:</strong> Increase saturation (0-200%) to make colors more vivid or decrease for muted tones.</li>
                <li><strong>4. Set Color Balance:</strong> Shift between warm (red) and cool (blue) tones.</li>
                <li><strong>5. Apply & Download:</strong> Click "Apply Color Grading" then download your edited image.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Use Color Grading</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Professional Results</h3>
                  <p className="text-gray-700">Achieve studio-quality color correction without expensive software.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Precise Control</h3>
                  <p className="text-gray-700">Fine-tune hue, saturation, and balance for exact color preferences.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">Instant Adjustments</h3>
                  <p className="text-gray-700">See changes in real-time as you adjust the sliders.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-600 mb-2">100% Free Forever</h3>
                  <p className="text-gray-700">No subscriptions, watermarks, or hidden costs.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is color grading?</summary>
                  <p className="text-gray-700 mt-2">Color grading is the process of adjusting and correcting colors in images to achieve a desired aesthetic, mood, or style.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What does hue adjustment do?</summary>
                  <p className="text-gray-700 mt-2">Hue adjustment rotates all colors in your image around the color wheel, shifting blues to greens, reds to oranges, etc.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">How does saturation affect my image?</summary>
                  <p className="text-gray-700 mt-2">Saturation controls color intensity. Higher values make colors more vivid, while lower values create a more muted, desaturated look.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What is color balance?</summary>
                  <p className="text-gray-700 mt-2">Color balance lets you shift the overall temperature of your image between warm (reddish) and cool (bluish) tones.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I reset the adjustments?</summary>
                  <p className="text-gray-700 mt-2">Yes! Simply refresh the page or reload your image to reset all sliders to their default values.</p>
                </details>
                <details className="border-l-4 border-purple-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is color grading permanent?</summary>
                  <p className="text-gray-700 mt-2">Only if you download the image. The original file remains unchanged until you save the graded version.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Image Enhancer</h3>
                  <p className="text-sm text-gray-600">Brightness and contrast control</p>
                </Link>
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro photo effects</p>
                </Link>
                <Link href="/all-tools/sepia-filter" className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
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
          name: 'Color Grader',
          description: 'Professional color grading and adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/color-grader',
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
