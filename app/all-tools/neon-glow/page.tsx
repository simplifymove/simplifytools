'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

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
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generationRef = useRef(0);
  const processingRef = useRef(false);

  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  React.useEffect(() => {
    if (!result) {
      setResultPreview(null);
      return;
    }
    const url = URL.createObjectURL(result);
    setResultPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  React.useEffect(() => {
    return () => {
      generationRef.current += 1;
    };
  }, []);

  const clearResult = () => {
    generationRef.current += 1;
    setResult(null);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (processingRef.current || downloading) return;

    const selectedFile = e.target.files?.[0];
    e.target.value = '';

    if (!selectedFile) return;

    clearResult();

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setFile(null);
      setError('Please choose an image smaller than 20 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const applyNeonGlow = async () => {
    if (!file || !preview || processingRef.current || downloading) return;

    processingRef.current = true;
    setProcessing(true);
    setError(null);
    setResult(null);

    const generation = ++generationRef.current;

    try {
      const image = new Image();

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to decode this image.'));
        image.src = preview;
      });

      if (generation !== generationRef.current) return;

      const width = image.naturalWidth;
      const height = image.naturalHeight;

      if (!width || !height || width * height > 16000000) {
        throw new Error('Image dimensions are too large. Maximum: 16 megapixels.');
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error('Image editor is unavailable.');
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas rendering is unavailable.');
      }

      const base = document.createElement('canvas');
      base.width = width;
      base.height = height;

      const baseContext = base.getContext('2d');

      if (!baseContext) {
        throw new Error('Unable to initialize image processing.');
      }

      baseContext.drawImage(image, 0, 0);

      const glow = document.createElement('canvas');
      glow.width = width;
      glow.height = height;

      const glowContext = glow.getContext('2d');

      if (!glowContext) {
        throw new Error('Unable to initialize glow processing.');
      }

      const strength = intensity / 100;
      const blurRadius = Math.max(2, Math.round(Math.min(width, height) * 0.018));

      glowContext.filter =
        `brightness(${1.15 + strength * 0.65}) saturate(${1.4 + strength * 1.4}) blur(${blurRadius}px)`;

      glowContext.drawImage(base, 0, 0);
      glowContext.filter = 'none';

      context.fillStyle = '#08091a';
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'screen';
      context.globalAlpha = 0.25 + strength * 0.65;
      context.drawImage(glow, 0, 0);

      context.globalAlpha = 1;
      context.drawImage(base, 0, 0);

      context.globalCompositeOperation = 'source-over';

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) resolve(value);
            else reject(new Error('Unable to create the edited image.'));
          },
          'image/jpeg',
          0.92
        );
      });

      if (generation !== generationRef.current) return;

      setResult(blob);
    } catch (caughtError) {
      if (generation === generationRef.current) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to apply the neon glow effect.'
        );
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || processingRef.current || downloading) return;

    setDownloading(true);
    setError(null);

    try {
      const filename = `neon-glow-${Date.now()}.jpg`;

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'neon-glow',
        originalName: filename,
        outputName: filename,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.'
      );
    } finally {
      setDownloading(false);
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
                  disabled={processing || downloading}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition disabled:opacity-50"
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
                      onChange={(e) => {
                        setIntensity(Number(e.target.value));
                        clearResult();
                      }}
                      disabled={processing || downloading}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-2">0 = gentle glow, 100 = stronger neon-style lighting</p>
                  </div>

                  <button
                    onClick={applyNeonGlow}
                    disabled={processing || downloading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Neon Glow'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {resultPreview && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Your Neon Glow Result
                  </h3>
                  <img
                    src={resultPreview}
                    alt="Edited image with neon-style glow"
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing || downloading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={20} />
                  {downloading ? 'Preparing download...' : 'Download Neon Image'}
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
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What intensity should I use?</FAQQuestion>
                  <FAQAnswer>Start at 50 for balanced effect. Higher for stronger glow.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Works on all photos?</FAQQuestion>
                  <FAQAnswer>Yes, works on any photo. Results vary by image content.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use commercially?</FAQQuestion>
                  <FAQAnswer>You can use the edited image commercially if you have the necessary rights to the original image and its contents.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What's the output quality?</FAQQuestion>
                  <FAQAnswer>The tool exports a JPEG at 92% quality. Neon-style lighting intentionally changes colors, and JPEG compression may introduce some detail loss.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is my image private?</FAQQuestion>
                  <FAQAnswer>Yes, all processing happens locally in browser.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I apply multiple times?</FAQQuestion>
                  <FAQAnswer>Yes, download and upload again for stronger effects.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

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
