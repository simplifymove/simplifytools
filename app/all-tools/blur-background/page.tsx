'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload, Sparkles } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';
import { ImageToolErrorType } from '@/app/utils/types/errors';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

const TOOL_ID = 'blur-background';
const TOOL_NAME = 'Blur Background';

export default function BlurBackgroundPage() {
  const router = useRouter();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurStrength, setBlurStrength] = useState(35);
  const [featherRadius, setFeatherRadius] = useState(5);
  const [portraitMode, setPortraitMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { error, clearError, createError } = useImageToolErrors();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPreview = () => {
    setOriginalFile(null);
    setImage(null);
    setPreview(null);
    setResult(null);
    clearError();
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      createError(
        ImageToolErrorType.EMPTY_FILE,
        TOOL_ID,
        TOOL_NAME,
        { error: 'No image provided' }
      );
      return;
    }

    setProcessing(true);
    clearError();

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('blurStrength', blurStrength.toString());
      formData.append('featherRadius', featherRadius.toString());
      formData.append('portraitMode', portraitMode.toString());

      const processResponse = await fetch('/api/blur-background', {
        method: 'POST',
        body: formData,
      });

      const data = await processResponse.json();

      if (!processResponse.ok) {
        createError(
          ImageToolErrorType.SHARP_FAILED,
          TOOL_ID,
          TOOL_NAME,
          { error: data.error || 'Processing failed' }
        );
        return;
      }

      const resultDataUrl = `data:image/jpeg;base64,${data.image}`;
      setResult(resultDataUrl);
    } catch (err) {
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        TOOL_NAME,
        { error: err instanceof Error ? err.message : 'Unknown error' }
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = async () => {
    if (!result || !originalFile) return;

    setProcessing(true);
    clearError();

    try {
      const response = await fetch(result);

      if (!response.ok) {
        throw new Error('Failed to read the processed image');
      }

      const blob = await response.blob();

      const download = await uploadBrowserDownloadResult({
        blob,
        toolSlug: TOOL_ID,
        originalName: originalFile.name,
        outputName: 'blur-background.jpg',
      });

      router.push(download.downloadPageUrl);
    } catch (error) {
      createError(
        ImageToolErrorType.NETWORK_ERROR,
        TOOL_ID,
        TOOL_NAME,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        {
          filename: originalFile.name,
          size: originalFile.size,
          mimeType: originalFile.type,
        }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Error Display */}
        {error && <ErrorAlert error={error} onDismiss={clearError} />}

        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Blur Background</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Blur Background</h1>
                <p className="text-lg text-white/90">Professional portrait mode effect with sharp subject and blurred background. Create stunning depth effect photos.</p>
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
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
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
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Blur Background Result</h3>
                      <img
                        src={result}
                        alt="Result"
                        className="w-full h-64 object-cover rounded-lg border border-blue-300 mb-3"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Controls - Right (sticky sidebar) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Options */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Blur Settings</h3>

                    {/* Blur Strength */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Blur Strength</label>
                        <span className="text-sm font-semibold text-orange-600">{blurStrength}</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="51"
                        step="2"
                        value={blurStrength}
                        onChange={(e) => setBlurStrength(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {blurStrength <= 25 ? 'Natural blur' : blurStrength <= 35 ? 'Balanced portrait' : 'Strong effect'}
                      </p>
                    </div>

                    {/* Feather Radius */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Edge Feathering</label>
                        <span className="text-sm font-semibold text-orange-600">{featherRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="7"
                        step="1"
                        value={featherRadius}
                        onChange={(e) => setFeatherRadius(parseInt(e.target.value))}
                        disabled={processing}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Softer edges, smoother transitions</p>
                    </div>

                    {/* Portrait Mode */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={portraitMode}
                        onChange={(e) => setPortraitMode(e.target.checked)}
                        disabled={processing}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Portrait Mode</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Darkens background for depth effect</p>
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
                          Processing (30-60s)...
                        </>
                      ) : (
                        '✨ Apply Blur Background'
                      )}
                    </button>
                  </form>

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={downloadResult}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Preparing download...
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          Download Result
                        </>
                      )}
                    </button>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">About</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Professional portrait mode</li>
                      <li>• Adjustable blur strength</li>
                      <li>• Edge feathering control</li>
                      <li>• Portrait mode option</li>
                    </ul>
                  </div>

                  {/* Speed Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-1">⚡ Processing Time</h3>
                    <p className="text-xs text-amber-800">First run: 30-60s. Subsequent runs: 10-20s.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Supporting content */}
          <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
            <div className="space-y-12">

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How to Blur an Image Background
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">1. Upload your image</h3>
                    <p className="text-gray-700">
                      Choose a JPG, PNG, or WebP image. Photos with a clearly separated subject
                      usually produce cleaner foreground edges.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">2. Adjust blur strength</h3>
                    <p className="text-gray-700">
                      Use the blur control from 15 to 51. Higher values apply a stronger
                      Gaussian blur to the original background.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">3. Refine subject edges</h3>
                    <p className="text-gray-700">
                      Edge feathering from 3 to 7 pixels softens the transition between the
                      extracted foreground and the blurred background.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">4. Process and download</h3>
                    <p className="text-gray-700">
                      The tool keeps the subject sharp, blurs the background, composites both
                      layers together, and returns a JPEG result at the original image dimensions.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How Background Blur Processing Works
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Blur Background first separates the foreground subject from the original
                    image. It then cleans the subject mask and applies the selected feathering
                    amount to soften the transition around the edges.
                  </p>
                  <p>
                    A blurred copy of the original photo is created using Gaussian blur. The
                    sharp foreground is then composited back over that blurred copy, which
                    creates the final subject-in-focus and background-out-of-focus effect.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Blur Strength and Edge Feathering
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Blur strength: 15–51</h3>
                    <p className="text-gray-700">
                      Lower values create a lighter background blur, while higher values make
                      background detail softer and less distinct. The default setting is 35.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Feathering: 3–7 px</h3>
                    <p className="text-gray-700">
                      Feathering smooths the subject-mask boundary. A larger value creates a
                      softer transition, while a smaller value keeps the edge tighter.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What Portrait Mode Does
                </h2>
                <p className="text-gray-700">
                  Portrait Mode keeps the same blur workflow but slightly darkens the blurred
                  background before compositing the sharp subject. This can create a little more
                  visual separation between the subject and the surrounding scene.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Tips for Better Background Blur
                  </h2>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Use a clear image where the main subject is easy to distinguish from the background.</li>
                    <li>• Try a lower blur value first if you want a more natural-looking result.</li>
                    <li>• Increase feathering if the subject edge looks too abrupt.</li>
                    <li>• Check hair, transparent objects, and fine details carefully in the result preview.</li>
                    <li>• Portrait Mode is optional and only changes the background brightness slightly.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Automatic Processing Limitations
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      Foreground extraction is automatic, so edge quality depends on the source
                      photo. Fine hair, motion blur, transparent materials, low contrast, or
                      overlapping foreground and background colors can make the mask less precise.
                    </p>
                    <p>
                      The tool does not recreate true camera depth data. It separates the subject
                      and applies image processing to the background to simulate a depth-of-field
                      style effect.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">
                  Blur Background FAQ
                </h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Does the tool blur the whole image?
                    </h3>
                    <p className="text-gray-700">
                      No. It attempts to keep the extracted foreground subject sharp while
                      applying the blur to the background copy of the original photo.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      What does edge feathering change?
                    </h3>
                    <p className="text-gray-700">
                      Edge feathering softens the boundary of the foreground mask so the sharp
                      subject blends more gradually into the blurred background.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Does Portrait Mode increase the blur?
                    </h3>
                    <p className="text-gray-700">
                      No. Portrait Mode does not change the selected blur strength. It slightly
                      darkens the blurred background before the final composite is created.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      What file format is the result?
                    </h3>
                    <p className="text-gray-700">
                      The processed image is returned and downloaded as a JPEG while retaining
                      the original image dimensions.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

</main>
      <Footer />
    </>
  );
}







