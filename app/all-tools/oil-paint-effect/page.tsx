'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Wand2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function OilPaintEffectPage() {
    const router = useRouter();
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

  const applyOilPaintEffect = async () => {
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

          // Apply median filter for oil paint effect
          const radius = intensity;
          for (let y = radius; y < canvas.height - radius; y++) {
            for (let x = radius; x < canvas.width - radius; x++) {
              const idx = (y * canvas.width + x) * 4;
              const pixels = { r: [] as number[], g: [] as number[], b: [] as number[] };

              for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                  const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4;
                  pixels.r.push(data[nIdx]);
                  pixels.g.push(data[nIdx + 1]);
                  pixels.b.push(data[nIdx + 2]);
                }
              }

              pixels.r.sort((a, b) => a - b);
              pixels.g.sort((a, b) => a - b);
              pixels.b.sort((a, b) => a - b);

              const mid = Math.floor(pixels.r.length / 2);
              data[idx] = pixels.r[mid];
              data[idx + 1] = pixels.g[mid];
              data[idx + 2] = pixels.b[mid];
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
      console.error('Error applying oil paint effect:', error);
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
            toolSlug: 'oil-paint-effect',
            originalName: `oil-paint-${Date.now()}.jpg`,
            outputName: `oil-paint-${Date.now()}.jpg`,
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
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Oil Paint Effect</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Oil Paint Effect</h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Apply a painterly smoothing effect that blends nearby colors and reduces fine image detail.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Oil Paint Effect</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Intensity: {intensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">1 = subtle, 10 = strong oil painting effect</p>
                  </div>

                  <button
                    onClick={applyOilPaintEffect}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {processing ? 'Processing...' : 'Apply Oil Paint Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Painting
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Create Oil Paintings</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Photo:</strong> Select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Intensity:</strong> Control the oil painting effect strength.</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Oil Paint Effect".</li>
                <li><strong>4. Download:</strong> Save your oil painting artwork.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Oil Paint Effect Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Artistic Transformation</h3>
                  <p className="text-gray-700">Convert photos into beautiful paintings.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Adjustable Painterly Effect</h3>
                  <p className="text-gray-700">Adjust the smoothing strength to change the painterly appearance.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">Customizable</h3>
                  <p className="text-gray-700">Adjust intensity for desired effect.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-orange-600 mb-2">No Account Required</h3>
                  <p className="text-gray-700">No registration or payment needed.</p>
                </div>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What This Oil Paint Effect Tool Does</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Oil Paint Effect tool turns photos into painterly artwork by smoothing details and blending nearby colors. It is useful for portraits, landscapes, pet photos, wall-art concepts, and creative images that need a hand-painted look.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Use Cases</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700 mb-6">
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Create art-style portraits from personal photos.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Turn landscapes and travel photos into painting-like images.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Generate creative visuals for posters, covers, and social posts.</li>
                <li className="p-4 bg-orange-50 border border-orange-100 rounded-lg">Test a painting look before sending an image to a designer or artist.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Example</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Input</h4>
                  <p className="text-gray-700 text-sm">A portrait, pet image, landscape, or product photo with visible texture and color.</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Output</h4>
                  <p className="text-gray-700 text-sm">A JPEG image with softened details and an oil-painting-inspired texture.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2">Privacy Note</h3>
                <p className="text-blue-900 text-sm">Oil paint processing happens locally in your browser using canvas. Your image does not need to be uploaded for this effect.</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What intensity should I use?</summary>
                  <p className="text-gray-700 mt-2">Start at 5 for balanced effect. Lower for subtle, higher for strong painting style.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Does this work on all photos?</summary>
                  <p className="text-gray-700 mt-2">Yes, works on any photo. Results vary by image content and detail.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use for commercial art?</summary>
                  <p className="text-gray-700 mt-2">Commercial-use rights depend on the rights and license attached to the source image and any other material used in your project.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What's the output quality?</summary>
                  <p className="text-gray-700 mt-2">The processed result is exported as JPEG. The effect intentionally smooths and changes image detail, and JPEG encoding can introduce additional compression changes.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image private?</summary>
                  <p className="text-gray-700 mt-2">The visual effect is processed locally in the browser. When you choose Download, the generated JPEG is sent through the download-result service so the download page can be prepared.</p>
                </details>
                <details className="border-l-4 border-orange-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I edit further?</summary>
                  <p className="text-gray-700 mt-2">Yes, download and use image editors for additional modifications.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <RelatedToolsSection family="image" toolId="oil-paint-effect" limit={8} />
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
          name: 'Oil Paint Effect',
          description: 'Free online oil paint effect and artistic painting converter',
          url: 'https://simplifyconvert.com/all-tools/oil-paint-effect',
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
            { '@type': 'Question', name: 'What intensity should I use?', acceptedAnswer: { '@type': 'Answer', text: 'Start at 5 for a balanced oil paint effect. Lower values are more subtle and higher values create stronger smoothing.' } },
            { '@type': 'Question', name: 'Does this work on all photos?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, it works on most photos, with best results on images that have clear color areas and visible detail.' } },
            { '@type': 'Question', name: 'Where is the effect processed?', acceptedAnswer: { '@type': 'Answer', text: 'The visual effect is processed locally in the browser. When Download is selected, the generated JPEG is sent through the download-result service so the download page can be prepared.' } },
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
            { '@type': 'ListItem', position: 3, name: 'Oil Paint Effect', item: 'https://simplifyconvert.com/all-tools/oil-paint-effect' },
          ],
        })}
      </script>
    </>
  );
}
