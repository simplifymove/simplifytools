'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Palette } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function HueSaturationPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
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

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const applyHueSaturation = async () => {
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

          for (let i = 0; i < data.length; i += 4) {
            const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
            const newH = (h + hue) % 360;
            const newS = Math.max(0, Math.min(100, s + saturation));
            const newL = Math.max(0, Math.min(100, l + lightness));
            const [r, g, b] = hslToRgb(newH, newS, newL);

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
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
      console.error('Error applying hue saturation:', error);
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
            toolSlug: 'hue-saturation',
            originalName: `hue-saturation-${Date.now()}.jpg`,
            outputName: `hue-saturation-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Hue Saturation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Hue Saturation</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Adjust hue, saturation, and lightness independently. Fine-tune colors with precision control.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adjust Colors</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Hue: {hue}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Saturation: {saturation}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Lightness: {lightness}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={lightness}
                      onChange={(e) => setLightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applyHueSaturation}
                    disabled={processing}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Palette size={20} />}
                    {processing ? 'Processing...' : 'Apply Adjustments'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Adjusted Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Adjust Hue & Saturation</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Hue:</strong> Shift colors from -180° to +180° for different color tones.</li>
                <li><strong>3. Adjust Saturation:</strong> Increase intensity (-100 to +100%) for vivid or muted colors.</li>
                <li><strong>4. Adjust Lightness:</strong> Change brightness (-100 to +100%) for darker or lighter tones.</li>
                <li><strong>5. Apply & Download:</strong> Click "Apply Adjustments" then download your result.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Adjustment Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-violet-600 mb-2">Independent Control</h3>
                  <p className="text-gray-700">Adjust hue, saturation, and lightness separately for precision.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-violet-600 mb-2">Adjustable Results</h3>
                  <p className="text-gray-700">Achieve color grading quality without expensive software.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-violet-600 mb-2">Interactive Preview</h3>
                  <p className="text-gray-700">See changes in real-time as you adjust sliders.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-violet-600 mb-2">100% Free</h3>
                  <p className="text-gray-700">No registration, subscriptions, or hidden costs.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the difference between these three adjustments?</summary>
                  <p className="text-gray-700 mt-2">Hue shifts color tones, Saturation controls color intensity, and Lightness adjusts brightness.</p>
                </details>
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I desaturate colors completely?</summary>
                  <p className="text-gray-700 mt-2">Yes, set saturation to -100% to remove all color and create grayscale images.</p>
                </details>
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What hue values produce what colors?</summary>
                  <p className="text-gray-700 mt-2">0° is red, 120° is green, 240° is blue. Values between shift between these colors.</p>
                </details>
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I undo changes?</summary>
                  <p className="text-gray-700 mt-2">Upload again to reset. Each upload is independent with no persistent changes.</p>
                </details>
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my data private?</summary>
                  <p className="text-gray-700 mt-2">Yes, all processing happens locally in your browser. Images never reach our servers.</p>
                </details>
                <details className="border-l-4 border-violet-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What image formats work?</summary>
                  <p className="text-gray-700 mt-2">JPG, PNG, WebP, BMP, TIFF, and most standard image formats are supported.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Color Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-violet-200 rounded-lg hover:bg-violet-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Color adjustment controls</p>
                </Link>
                <Link href="/all-tools/image-enhancer" className="p-4 border-2 border-violet-200 rounded-lg hover:bg-violet-50 transition">
                  <h3 className="font-bold text-gray-800">Image Enhancer</h3>
                  <p className="text-sm text-gray-600">Brightness and contrast</p>
                </Link>
                <Link href="/all-tools/invert-colors" className="p-4 border-2 border-violet-200 rounded-lg hover:bg-violet-50 transition">
                  <h3 className="font-bold text-gray-800">Invert Colors</h3>
                  <p className="text-sm text-gray-600">Negative color effects</p>
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
                How hue and saturation adjustment works
              </h2>
              <p className="text-gray-600 leading-7">
Upload an image and adjust hue, saturation, and lightness.
                The browser recalculates image color values according to the
                selected controls and updates the preview before download.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Browser-based processing
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The visual adjustment is produced with browser image and
                  Canvas processing. The preview lets you compare the result
                  before using the download action.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What the adjustment changes
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Hue shifts colors around the color spectrum, saturation changes color intensity, and lightness adjusts overall tonal brightness.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better results
              </h2>
              <p className="text-gray-600 leading-7">
                Start with moderate settings and compare the preview with the
                original. Strong adjustments can intentionally reduce subtle
                detail or produce a more stylized appearance.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                hue and saturation adjustment works FAQ
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Does this effect increase image resolution?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    No. It modifies the appearance of existing image pixels
                    and does not reconstruct missing source detail.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Can I preview changes before downloading?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-6">
                    Yes. Use the preview and available controls to review the
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
          name: 'Hue Saturation',
          description: 'Free online hue saturation color adjustment tool',
          url: 'https://simplifyconvert.com/all-tools/hue-saturation',
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
