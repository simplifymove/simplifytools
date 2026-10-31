'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useState, useRef, useEffect } from 'react';
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
  const operationRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [toolError, setToolError] = useState<string | null>(null);

  const clearResult = () => {
    operationRef.current += 1;
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setResultPreview(null);
    setToolError(null);
    setProcessing(false);
  };

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      clearResult();
      setFile(null);
      setPreview(null);

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        setToolError('Please select a JPG, PNG, or WebP image.');
        return;
      }

      setFile(selectedFile);
      const selection = operationRef.current;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (selection !== operationRef.current) return;
        setPreview(event.target?.result as string);
      };
      reader.onerror = () => {
        if (selection !== operationRef.current) return;
        setToolError('Unable to read this image.');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const applyVintageFilter = async () => {
    if (!file || !preview) return;
    clearResult();
    const operation = operationRef.current;
    setProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        if (operation !== operationRef.current) return;
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
              if (operation === operationRef.current) {
                setToolError('Unable to create the processed image.');
                setProcessing(false);
              }
              return;
            }
            if (operation !== operationRef.current) return;
            const url = URL.createObjectURL(blob);
            resultUrlRef.current = url;
            setResultPreview(url);
            setResult(blob);
            setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (error) {
          console.error('Error in image onload:', error);
          if (operation === operationRef.current) {
            setToolError('Unable to apply the vintage filter.');
            setProcessing(false);
          }
        }
      };
      img.onerror = () => {
        if (operation === operationRef.current) {
          setToolError('Unable to load the selected image.');
          setProcessing(false);
        }
      };
      img.src = preview;
    } catch (error) {
      console.error('Error applying vintage filter:', error);
      if (operation === operationRef.current) {
        setToolError('Unable to apply the vintage filter.');
        setProcessing(false);
      }
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
              Apply vintage and retro-style effects to supported images using adjustable browser-based controls.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Choose a vintage-style effect and adjust its intensity before exporting the result.
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
                  accept="image/jpeg,image/png,image/webp"
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
                      onChange={(e) => {
                        clearResult();
                        setVintageIntensity(Number(e.target.value));
                      }}
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

              {toolError && (
                <p role="alert" className="mb-4 text-sm text-red-700">
                  {toolError}
                </p>
              )}

              {resultPreview && (
                <div className="mt-6 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Processed Image Preview
                  </h3>
                  <img
                    src={resultPreview}
                    alt="Photo with vintage filter applied"
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                  />
                </div>
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
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Browser-Based Processing</h3>
                  <p className="text-gray-700">Vintage filtering is performed locally in the browser using canvas.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-600 mb-2">Customizable Vintage Effects</h3>
                  <p className="text-gray-700">Apply adjustable vintage effects to create a retro, film-inspired appearance.</p>
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
                <p className="text-blue-900 text-sm">Vintage filtering runs locally in your browser using canvas. When you choose Download, the generated JPEG is uploaded to our download service to prepare your download page.</p>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What file formats are supported?</FAQQuestion>
                  <FAQAnswer>The tool accepts supported browser-readable image files and processes the selected effect locally.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my image data stored?</FAQQuestion>
                  <FAQAnswer>Filtering runs locally in your browser. Selecting Download sends the generated JPEG to the download service to prepare the download page.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I adjust the vintage effect after applying it?</FAQQuestion>
                  <FAQAnswer>Yes! Adjust the intensity slider to your preference before clicking "Apply Vintage Effect" to experiment with different levels.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What does the intensity slider do?</FAQQuestion>
                  <FAQAnswer>The intensity slider controls how strong the vintage effect appears. Lower values (0-30%) give subtle effects, while higher values (70-100%) create more pronounced vintage looks.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use this on mobile devices?</FAQQuestion>
                  <FAQAnswer>The filter can be used in many modern desktop and mobile browsers, but compatibility and practical image limits can vary by browser and device.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Do you offer batch processing?</FAQQuestion>
                  <FAQAnswer>Currently, you can filter one image at a time. For multiple images, simply repeat the process for each photo.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

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
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What file formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'The tool accepts image formats that the browser can decode. Actual decoding support can vary by browser and source format.' } },
            { '@type': 'Question', name: 'What does the intensity slider do?', acceptedAnswer: { '@type': 'Answer', text: 'The intensity slider controls how strong the vintage effect appears, from subtle warmth to a stronger retro look.' } },
            { '@type': 'Question', name: 'Where is the vintage effect processed?', acceptedAnswer: { '@type': 'Answer', text: 'The vintage effect is processed locally in the browser. When Download is selected, the generated result is sent through the download-result service so the download page can be prepared.' } },
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
