'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload, SparklesIcon } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResultFromUrl } from '@/app/lib/download-result-client';

export default function UnblurImagePage() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState('image.jpg');
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'motion' | 'defocus'>('motion');

  // Deblurring parameters
  const [strength, setStrength] = useState(1.0);
  const [iterations, setIterations] = useState(1);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setOriginalName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPreview = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setOriginalName('image.jpg');
    setError(null);
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('mode', mode);
      formData.append('strength', strength.toString());
      formData.append('iterations', iterations.toString());

      const processResponse = await fetch('/api/unblur-image', {
        method: 'POST',
        body: formData,
      });

      const data = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      const resultDataUrl = `data:image/jpeg;base64,${data.image}`;
      setResult(resultDataUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!result || processing) return;

    setProcessing(true);
    setError(null);

    try {
      const outputName = `unblur-image-${Date.now()}.jpg`;
      const download = await uploadBrowserDownloadResultFromUrl({
        url: result,
        toolSlug: 'unblur-image',
        originalName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      setError(
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
      <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Unblur Image</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <SparklesIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Unblur Image</h1>
                <p className="text-lg text-white/90">Reduce the appearance of motion blur or defocus blur with adjustable image restoration and sharpening controls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Left (2 cols) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>

                  <div className="relative mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={processing}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="block w-full p-8 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition text-center"
                    >
                      <Upload className="w-8 h-8 mx-auto text-orange-500 mb-3" />
                      <span className="text-sm font-medium text-gray-700">
                        {image ? '✓ Image selected' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Original Preview</h3>
                      <img
                        src={preview}
                        alt="Original"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={handleClearPreview}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Clear &amp; upload different image
                      </button>
                    </div>
                  )}

                  {/* Result */}
                  {result && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Unblurred Result</h3>
                      <img
                        src={result}
                        alt="Result"
                        className="w-full h-64 object-cover rounded-lg border border-blue-300 mb-3"
                      />
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Mode Selection */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Deblurring Mode</h3>

                    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer mb-3 border-2 border-gray-200 hover:border-orange-300 transition">
                      <input
                        type="radio"
                        name="mode"
                        value="motion"
                        checked={mode === 'motion'}
                        onChange={() => setMode('motion')}
                        disabled={processing}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Motion Deblur</p>
                        <p className="text-xs text-gray-500">Removes camera shake & movement blur</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-orange-300 transition">
                      <input
                        type="radio"
                        name="mode"
                        value="defocus"
                        checked={mode === 'defocus'}
                        onChange={() => setMode('defocus')}
                        disabled={processing}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Defocus Deblur</p>
                        <p className="text-xs text-gray-500">Removes out-of-focus blur</p>
                      </div>
                    </label>
                  </div>

                  {/* Deblurring Parameters */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Restoration Strength</h3>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Deblur Strength</label>
                        <span className="text-sm font-semibold text-orange-600">{strength.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={strength}
                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">0.5 = Subtle | 1.0 = Default | 2.0 = Aggressive</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Refinement Passes</label>
                        <span className="text-sm font-semibold text-orange-600">{iterations}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={iterations}
                        onChange={(e) => setIterations(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Additional passes repeat the refinement process and may also increase artifacts</p>
                    </div>
                  </div>

                  {/* Process Button */}
                  <form onSubmit={handleProcess}>
                    <button
                      type="submit"
                      disabled={processing || !image}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing Image...
                        </>
                      ) : (
                        `Deblur ${mode === 'motion' ? 'Motion' : 'Defocus'} Blur`
                      )}
                    </button>
                  </form>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={downloadResult}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Result
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Technology</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <span className="font-semibold">Processing:</span> Server-assisted image restoration</li>
                      <li>• <span className="font-semibold">Enhancement:</span> Edge-preserving filtering and controlled sharpening</li>
                      <li>• <span className="font-semibold">Motion Mode:</span> Edge-preserving filtering with conservative sharpening</li>
                      <li>• <span className="font-semibold">Defocus Mode:</span> Smoothing and controlled edge enhancement</li>
                      <li>• Server-side image processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to reduce blur in an image online
              </h2>
              <p className="text-gray-600 leading-7">
                Upload an image, choose Motion Blur or Defocus Blur, adjust the
                restoration strength and refinement passes, and start processing.
                The image is sent to the server, where edge-preserving filtering
                and controlled sharpening are applied. Review the result before
                continuing to the download page.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Motion Blur mode
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Motion mode applies bilateral filtering to reduce noise while
                  retaining stronger edges, followed by conservative unsharp
                  masking. This can make blurred edges look clearer, but it
                  cannot reconstruct detail that was never captured in the
                  original image.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Defocus Blur mode
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Defocus mode uses a similar edge-preserving filtering process
                  with a slightly broader sharpening comparison. It is intended
                  for images that look generally soft or out of focus rather
                  than images affected mainly by directional camera movement.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What the Strength control does
              </h2>
              <p className="text-gray-600 leading-7">
                Strength controls how strongly the sharpening stage is blended
                into the processed image. Higher values can make edges appear
                more pronounced, but excessive sharpening may introduce halos,
                harsh transitions, or visible noise. Start with a moderate value
                and compare the result before increasing it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What refinement passes do
              </h2>
              <p className="text-gray-600 leading-7">
                Each refinement pass repeats the filtering and sharpening
                process. Additional passes can increase the visible effect, but
                they do not guarantee more recovered detail. Too many passes may
                exaggerate noise or edge artifacts, especially in already
                compressed or low-resolution images.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What this tool can improve
                </h3>
                <ul className="text-sm text-gray-600 leading-6 space-y-2">
                  <li>• Soft-looking edges in mildly blurred photos</li>
                  <li>• Moderate motion-related softness</li>
                  <li>• Slight defocus blur</li>
                  <li>• Images that benefit from controlled edge enhancement</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  What it cannot reliably recover
                </h3>
                <ul className="text-sm text-gray-600 leading-6 space-y-2">
                  <li>• Detail completely lost to severe blur</li>
                  <li>• Unreadable text that was never captured clearly</li>
                  <li>• Missing facial or object detail</li>
                  <li>• Information removed by heavy compression or clipping</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Why sharpening is not the same as restoring lost detail
              </h2>
              <p className="text-gray-600 leading-7">
                Sharpening increases local contrast around edges, which can make
                an image appear clearer. It does not recreate exact information
                that was lost when the photo became blurred. Results therefore
                depend heavily on the original image, blur severity, noise,
                compression, and the selected settings.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better unblur results
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Start with a moderate strength setting',
                  'Use Motion mode for directional blur',
                  'Use Defocus mode for general softness',
                  'Compare one refinement pass before increasing it',
                  'Avoid excessive sharpening on noisy images',
                  'Check fine edges, text, hair, and high-contrast areas',
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unblur Image FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'Can this tool completely fix a blurry photo?',
                    'Not always. It can reduce the appearance of moderate blur and strengthen edges, but severely lost image detail cannot be reliably reconstructed.',
                  ],
                  [
                    'What is the difference between Motion and Defocus mode?',
                    'Motion mode is intended for motion-related softness, while Defocus mode is intended for more general out-of-focus blur. Both use edge-preserving filtering and controlled sharpening with slightly different settings.',
                  ],
                  [
                    'Should I use the highest strength?',
                    'Not necessarily. Higher strength increases sharpening and can also increase halos, noise, or harsh edges. Moderate settings are usually a better starting point.',
                  ],
                  [
                    'Do more refinement passes always improve the result?',
                    'No. Additional passes repeat the restoration process, but excessive processing can introduce artifacts. Compare each result rather than assuming more passes are better.',
                  ],
                  [
                    'Is the image processed in my browser?',
                    'No. The selected image and settings are sent to the server for processing.',
                  ],
                  [
                    'What format is produced?',
                    'The current processing route creates a JPEG output image.',
                  ],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{question}</h3>
                    <p className="text-sm text-gray-600 leading-6">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

</main>
      <Footer />
    </>
  );
}






