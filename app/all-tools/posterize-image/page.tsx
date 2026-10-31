'use client';
import { FAQAnswer, FAQDisclosure, FAQHeading, FAQList, FAQPanel, FAQQuestion } from '@/app/components/FAQDesign';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, Loader, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useRouter } from 'next/navigation';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

export default function PosterizeImagePage() {
    const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [levels, setLevels] = useState(4);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generationRef = useRef(0);
  const processingRef = useRef(false);
  const downloadRef = useRef(false);
  const readerRef = useRef<FileReader | null>(null);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      readerRef.current?.abort();
    };
  }, []);

  const resetResult = () => {
    generationRef.current += 1;
    readerRef.current?.abort();
    readerRef.current = null;
    processingRef.current = false;
    setProcessing(false);
    setResult(null);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (downloadRef.current) return;

    const selectedFile = e.target.files?.[0];

    resetResult();
    setFile(null);
    setPreview(null);

    if (!selectedFile) return;

    const acceptedTypes: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'webp': ['image/webp'],
    };

    const extension = selectedFile.name
      .split('.')
      .pop()
      ?.toLowerCase();

    if (
      !extension ||
      !acceptedTypes[extension]?.includes(selectedFile.type)
    ) {
      setError('Please select a valid JPG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('The selected image is empty.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Please select an image smaller than 20 MB.');
      return;
    }

    const generation = generationRef.current;
    const reader = new FileReader();
    readerRef.current = reader;

    reader.onload = () => {
      if (generation !== generationRef.current) return;

      if (typeof reader.result !== 'string') {
        setError('Unable to preview this image.');
        return;
      }

      setFile(selectedFile);
      setPreview(reader.result);
    };

    reader.onerror = () => {
      if (generation === generationRef.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleLevelsChange = (value: number) => {
    if (processingRef.current || downloadRef.current) return;

    generationRef.current += 1;
    setLevels(value);
    setResult(null);
    setError(null);
  };

  const applyPosterize = () => {
    if (
      !file ||
      !preview ||
      processingRef.current ||
      downloadRef.current
    ) {
      return;
    }

    const generation = ++generationRef.current;
    processingRef.current = true;

    setProcessing(true);
    setResult(null);
    setError(null);

    const fail = (message: string) => {
      if (generation !== generationRef.current) return;

      setError(message);
      processingRef.current = false;
      setProcessing(false);
    };

    try {
      const img = new Image();

      img.onload = () => {
        if (generation !== generationRef.current) return;

        try {
          const canvas = canvasRef.current;

          if (!canvas) {
            throw new Error('Image processing canvas is unavailable.');
          }

          if (!img.width || !img.height) {
            throw new Error('The image has invalid dimensions.');
          }

          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Unable to initialize image processing.');
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(
            0, 0, canvas.width, canvas.height
          );

          const data = imageData.data;
          const steps = levels - 1;

          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.round(
              Math.round(data[i] / 255 * steps) * 255 / steps
            );
            data[i + 1] = Math.round(
              Math.round(data[i + 1] / 255 * steps) * 255 / steps
            );
            data[i + 2] = Math.round(
              Math.round(data[i + 2] / 255 * steps) * 255 / steps
            );
          }

          ctx.putImageData(imageData, 0, 0);

          // JPEG does not support transparency.
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';

          canvas.toBlob((blob) => {
            if (generation !== generationRef.current) return;

            if (!blob || blob.size === 0) {
              fail('Unable to generate the posterized image.');
              return;
            }

            if (blob.type !== 'image/jpeg') {
              fail('Your browser did not generate a JPEG image.');
              return;
            }

            setResult(blob);
            processingRef.current = false;
            setProcessing(false);
          }, 'image/jpeg', 0.95);
        } catch (caughtError) {
          fail(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to apply the posterize effect.'
          );
        }
      };

      img.onerror = () => {
        fail('Unable to decode the selected image.');
      };

      img.src = preview;
    } catch (caughtError) {
      fail(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to apply the posterize effect.'
      );
    }
  };

  const handleDownload = async () => {
    if (
      !result ||
      !file ||
      processingRef.current ||
      downloadRef.current
    ) {
      return;
    }

    processingRef.current = true;
    downloadRef.current = true;
    setProcessing(true);
    setError(null);

    try {
      const baseName =
        file.name.replace(/\.[^.]+$/, '').trim() ||
        'image';

      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'posterize-image',
        originalName: file.name,
        outputName: `${baseName}-posterized.jpg`,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.'
      );
    } finally {
      downloadRef.current = false;
      processingRef.current = false;
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-400 via-pink-400 to-red-500 py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Posterize Image</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">🎨 Posterize Image</h1>
            <p className="text-lg text-white/90 max-w-2xl mb-4">
              Transform your photos into bold, artistic poster art. Create striking effects by reducing color levels to create a dramatic, stylized appearance.
            </p>
            <p className="text-base text-white/80 max-w-2xl">
              Useful for stylized graphics, poster-like effects, and reduced-color artwork.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Posterize Effect</h2>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Upload Image</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition"
                />
              </div>

              {error && (
                <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {preview && (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Color Levels: {levels}</label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={levels}
                      onChange={(e) => handleLevelsChange(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-1">Lower values = bolder effect, Higher values = more detail</p>
                  </div>

                  <button
                    onClick={applyPosterize}
                    disabled={processing}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {processing ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {processing ? 'Processing...' : 'Apply Posterize Effect'}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={handleDownload}
                  disabled={processing}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  {processing ? 'Preparing Download...' : 'Download Posterized Image'}
                </button>
              )}
            </div>

            {/* How To Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Posterize Images</h2>
              <ol className="space-y-4 text-gray-700">
                <li><strong>1. Upload Your Photo:</strong> Click the upload area to select a JPG, PNG, or WebP image.</li>
                <li><strong>2. Adjust Color Levels:</strong> Use the slider to set the number of color levels (2-8 recommended).</li>
                <li><strong>3. Preview Settings:</strong> Lower levels create bolder effects, higher levels retain more detail.</li>
                <li><strong>4. Apply Effect:</strong> Click "Apply Posterize Effect" to process your image.</li>
                <li><strong>5. Download Result:</strong> Save your posterized artwork to your device.</li>
              </ol>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Use Posterize</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Artistic Effects</h3>
                  <p className="text-gray-700">Create striking, stylized artwork from ordinary photos in seconds.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Bold Design Appeal</h3>
                  <p className="text-gray-700">Use reduced color levels for posters, prints, graphics, and stylized social content.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Easy Customization</h3>
                  <p className="text-gray-700">Control the intensity of the effect with simple color level adjustments.</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600 mb-2">Adjustable Color Levels</h3>
                  <p className="text-gray-700">Choose the number of color levels and review how strongly the setting simplifies the image.</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <FAQPanel>
              <FAQHeading>Frequently Asked Questions</FAQHeading>
              <FAQList>
                <FAQDisclosure>
                  <FAQQuestion>What does posterize mean?</FAQQuestion>
                  <FAQAnswer>Posterization is the process of reducing the number of distinct colors in an image to create a bold, artistic effect with flat color areas.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What color level should I use?</FAQQuestion>
                  <FAQAnswer>Start with 4-5 levels for moderate effects. Use 2-3 for very bold artwork, or 6-8 to maintain more photo detail.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I use posterized images commercially?</FAQQuestion>
                  <FAQAnswer>You can use your posterized output in commercial projects if you have the necessary rights to the original image. The tool does not grant rights to images you do not own or have permission to use.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>What file formats are supported?</FAQQuestion>
                  <FAQAnswer>Upload JPG, PNG, or WebP images. The posterized result downloads as JPEG, so transparent areas are placed on a white background.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Is there a file size limit?</FAQQuestion>
                  <FAQAnswer>This tool accepts files up to 20 MB. Very large image dimensions may still exceed your browser or device memory limits.</FAQAnswer>
                </FAQDisclosure>
                <FAQDisclosure>
                  <FAQQuestion>Can I combine posterize with other effects?</FAQQuestion>
                  <FAQAnswer>Yes! Use the posterized image with other tools like color graders and filters for more creative effects.</FAQAnswer>
                </FAQDisclosure>
              </FAQList>
            </FAQPanel>

            {/* Related Tools */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Artistic Tools</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/all-tools/vintage-filter" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Vintage Filter</h3>
                  <p className="text-sm text-gray-600">Retro photo effects</p>
                </Link>
                <Link href="/all-tools/color-grader" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Color Grader</h3>
                  <p className="text-sm text-gray-600">Adjust image color settings</p>
                </Link>
                <Link href="/all-tools/vignette-effect" className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                  <h3 className="font-bold text-gray-800">Vignette Effect</h3>
                  <p className="text-sm text-gray-600">Add edge darkening</p>
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
          name: 'Posterize Image',
          description: 'Free tool to create poster art effects from photos',
          url: 'https://simplifyconvert.com/all-tools/posterize-image',
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
