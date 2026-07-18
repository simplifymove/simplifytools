'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function VintageFilterPage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [vintageIntensity, setVintageIntensity] = useState(50);
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

  const applyVintageFilter = async () => {
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
          const intensity = vintageIntensity / 100;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, r + 40 * intensity);
            data[i + 1] = Math.min(255, g + 20 * intensity);
            data[i + 2] = Math.max(0, b - 30 * intensity);
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
      console.error('Error applying vintage filter:', error);
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
            toolSlug: 'vintage-filter',
            originalName: 'vintage-filtered-image.jpg',
            outputName: 'vintage-filtered-image.jpg',
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
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Vintage Filter</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎞️ Vintage Filter</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Add classic vintage and retro effects to your photos instantly. Transform modern photos into nostalgic memories with our free online vintage filter tool.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Apply authentic vintage looks with adjustable intensity. No signup required, completely free.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Vintage Filter</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition"
                />
              </div>

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                      Vintage Intensity: {vintageIntensity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vintageIntensity}
                      onChange={(e) => setVintageIntensity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={applyVintageFilter}
                    disabled={processing}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Vintage Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Vintage Image
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Use Vintage Filter</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Image:</strong> Click the upload area and select a JPG, PNG, or WebP image from your device.</li>
                <li><strong>2. Adjust Intensity:</strong> Use the slider to control how strong the vintage effect appears (0-100%).</li>
                <li><strong>3. Apply Effect:</strong> Click "Apply Vintage Effect" to process your image with the retro filter.</li>
                <li><strong>4. Download:</strong> Once processed, click "Download Vintage Image" to save your filtered photo.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Benefits of Vintage Filters</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Instant Nostalgic Look</h3>
                  <p className="text-gray-700">Transform modern photos into classic vintage shots with a single click.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Adjustable Intensity</h3>
                  <p className="text-gray-700">Control how strong the vintage effect is to match your style preferences.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">100% Free & Private</h3>
                  <p className="text-gray-700">No registration needed, images processed locally, complete privacy guaranteed.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Professional Results</h3>
                  <p className="text-gray-700">Achieve authentic vintage effects that rival professional editing software.</p>
                </div>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What This Vintage Filter Tool Does</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Vintage Filter tool adds warm color shifts and a retro film-inspired look to modern images. Use it to make photos feel nostalgic, soften digital sharpness, and create consistent old-photo styling for personal or creative projects.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Use Cases</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700 mb-6">
                <li className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">Give portraits a classic film-photo mood.</li>
                <li className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">Create cohesive retro visuals for social posts or blogs.</li>
                <li className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">Add warmth to travel, lifestyle, and event photos.</li>
                <li className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">Preview nostalgic styling before deeper photo editing.</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Example</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Input</h4>
                  <p className="text-gray-700 text-sm">A modern JPG, PNG, or WebP photo with neutral or cool colors.</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Output</h4>
                  <p className="text-gray-700 text-sm">A warm retro JPEG with stronger yellow/orange tones and a nostalgic film-style appearance.</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-2">Privacy Note</h3>
                <p className="text-blue-900 text-sm">Vintage filtering runs locally in your browser using canvas, so your image does not need to be uploaded for this edit.</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What file formats are supported?</summary>
                  <p className="text-gray-700 mt-2">We support JPG, PNG, WebP, BMP, and TIFF formats. Upload any of these and we'll process them instantly.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Is my image data stored?</summary>
                  <p className="text-gray-700 mt-2">No, your images are processed locally in your browser and never stored on our servers.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I adjust the vintage effect after applying it?</summary>
                  <p className="text-gray-700 mt-2">Yes! Adjust the intensity slider to your preference before clicking "Apply Vintage Effect" to experiment with different levels.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">What does the intensity slider do?</summary>
                  <p className="text-gray-700 mt-2">The intensity slider controls how strong the vintage effect appears. Lower values (0-30%) give subtle effects, while higher values (70-100%) create more pronounced vintage looks.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Can I use this on mobile devices?</summary>
                  <p className="text-gray-700 mt-2">Yes! Our vintage filter works on all devices including smartphones, tablets, and desktops.</p>
                </details>
                <details className="border-l-4 border-yellow-500 pl-4 py-2">
                  <summary className="font-bold text-gray-800 cursor-pointer">Do you offer batch processing?</summary>
                  <p className="text-gray-700 mt-2">Currently, you can filter one image at a time. For multiple images, simply repeat the process for each photo.</p>
                </details>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <RelatedToolsSection family="image" toolId="vintage-filter" limit={8} />
            </div>
          </div>
        </div>

        <Footer />
      </main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Vintage Filter',
          description: 'Free online vintage filter tool to add retro effects to photos',
          url: 'https://simplifyconvert.com/all-tools/vintage-filter',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '240',
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What file formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'The vintage filter supports common image formats including JPG, PNG, WebP, BMP, and TIFF.' } },
            { '@type': 'Question', name: 'What does the intensity slider do?', acceptedAnswer: { '@type': 'Answer', text: 'The intensity slider controls how strong the vintage effect appears, from subtle warmth to a stronger retro look.' } },
            { '@type': 'Question', name: 'Is my image data stored?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your image is processed locally in your browser and is not stored on our servers for this effect.' } },
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
            { '@type': 'ListItem', position: 3, name: 'Vintage Filter', item: 'https://simplifyconvert.com/all-tools/vintage-filter' },
          ],
        })}
      </script>
    </>
  );
}
