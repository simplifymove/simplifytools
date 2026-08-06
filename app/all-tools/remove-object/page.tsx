'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Upload, Trash2 } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { CanvasMask } from '../../components/CanvasMask';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResultFromUrl } from '@/app/lib/download-result-client';

export default function RemoveObjectPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [method, setMethod] = useState<'telea' | 'ns'>('ns');
  const [radius, setRadius] = useState(5);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(10);

  const handleImageSelect = (selectedFile: File) => {
    setImageFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      setImagePreview(imgUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleMaskGenerated = (maskBlob: Blob) => {
    const file = new File([maskBlob], 'mask.png', { type: 'image/png' });
    setMaskFile(file);
    setError(null);
  };

  const handleClearImages = () => {
    setImageFile(null);
    setMaskFile(null);
    setImagePreview(null);
    setImageDimensions(null);
    setResult(null);
    setError(null);
  };

  const removeObject = async () => {
    if (!imageFile || !maskFile) {
      setError('Please select both image and mask');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('mask', maskFile);
      formData.append('method', method);
      formData.append('radius', radius.toString());

      const startTime = Date.now();
      const response = await fetch('/api/remove-object', {
        method: 'POST',
        body: formData,
      });

      const processingTimeMs = Date.now() - startTime;
      setProcessingTime(processingTimeMs);

      if (!response.ok) {
        let errorMessage = 'Failed to process image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty response from server');
      }

      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !imageFile || processing) return;

    setProcessing(true);
    setError(null);

    try {
      const outputName = `object-removed-${Date.now()}.jpg`;
      const downloadResult = await uploadBrowserDownloadResultFromUrl({
        url: result,
        toolSlug: 'remove-object',
        originalName: imageFile.name,
        outputName,
      });

      router.push(downloadResult.downloadPageUrl);
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Remove Objects</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Trash2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Remove Objects</h1>
                <p className="text-lg text-white/90">Remove unwanted objects from images using Mask-based image inpainting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left (2 cols) */}
              <div className="lg:col-span-2">
                {/* Step 1: Upload Image */}
                {!imagePreview && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Image</h2>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                        imagePreview ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                      onClick={() => document.getElementById('imageInput')?.click()}
                    >
                      {imagePreview ? (
                        <div>
                          <p className="text-xs text-orange-600 font-medium truncate mb-3">{imageFile?.name}</p>
                          <img src={imagePreview} alt="preview" className="w-full h-64 object-cover rounded-lg" />
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                          <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    />
                  </div>
                )}

                {/* Step 2: Mask Editor */}
                {imagePreview && imageDimensions && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Paint Mask</h2>
                    <CanvasMask
                      imageUrl={imagePreview}
                      imageWidth={imageDimensions.width}
                      imageHeight={imageDimensions.height}
                      onMaskGenerated={handleMaskGenerated}
                      brushSize={brushSize}
                      setBrushSize={setBrushSize}
                    />
                  </div>
                )}

                {/* Result */}
                {result && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Result</h2>
                    <div className="flex justify-center mb-6">
                      <img
                        src={result}
                        alt="result"
                        className="rounded-lg shadow-lg max-w-full"
                        style={{ maxWidth: '600px', maxHeight: '600px' }}
                      />
                    </div>
                    {processingTime !== null && (
                      <p className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-lg">
                        Processed in {(processingTime / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                )}

                {/* Getting Started */}
                {!imagePreview && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 mb-3">How it Works:</h3>
                    <ol className="text-sm text-green-800 space-y-2">
                      <li>1. Upload an image with objects to remove</li>
                      <li>2. Use the brush to paint the areas you want removed</li>
                      <li>3. Use the eraser to fix any mistakes</li>
                      <li>4. Click "Use This Mask" when done</li>
                      <li>5. Adjust settings and click "Remove Object"</li>
                      <li>6. Download your cleaned image</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Settings Sidebar - Right (1 col sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-4">
                  {/* Upload Section (when not editing) */}
                  {!imagePreview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">Features</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Telea and Navier-Stokes inpainting methods</li>
                        <li>• Multiple removing methods</li>
                        <li>• Adjustable parameters</li>
                        <li>• Real-time preview</li>
                        <li>• Fast processing</li>
                      </ul>
                    </div>
                  )}

                  {/* Settings (when image selected) */}
                  {imageFile && imagePreview && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Remove Settings</h3>

                      {/* Method Selection */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">Algorithm</label>
                        <select
                          value={method}
                          onChange={(e) => setMethod(e.target.value as 'telea' | 'ns')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="telea">Telea (Fast)</option>
                          <option value="ns">Navier-Stokes (Smoother)</option>
                        </select>
                      </div>

                      {/* Radius Slider */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Inpaint Radius: {radius}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={radius}
                          onChange={(e) => setRadius(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-600 mt-1">Higher = smoother results (5-10 recommended)</p>
                      </div>

                      {/* Mask Status */}
                      <div className={`p-3 rounded-lg border mb-4 ${maskFile ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <p className="text-xs font-semibold">
                          {maskFile ? (
                            <span className="text-green-700">✓ Mask ready to process</span>
                          ) : (
                            <span className="text-yellow-700">⚠ Paint areas to remove above</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-900 font-semibold text-sm">Error</p>
                      <p className="text-red-700 text-xs mt-1">{error}</p>
                    </div>
                  )}

                  {/* Process Button */}
                  {imageFile && maskFile && (
                    <button
                      onClick={removeObject}
                      disabled={processing}
                      className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Remove Object'
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download
                    </button>
                  )}

                  {/* Clear Button */}
                  {imageFile && (
                    <button
                      onClick={handleClearImages}
                      className="w-full py-2 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                    >
                      Clear All
                    </button>
                  )}

                  {/* Supported Formats */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Supported Formats</h3>
                    <p className="text-sm text-amber-800">Common browser-supported image formats</p>
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
                How to remove an object from an image
              </h2>
              <p className="text-gray-600 leading-7">
                Upload an image, paint over the area you want to remove, and
                confirm the mask. Choose an inpainting method and radius, then
                start processing. The image and mask are sent to the server,
                where OpenCV fills the painted region using surrounding image
                information.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  How the painted mask works
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The mask tells the processor exactly which pixels should be
                  replaced. White painted areas mark regions to remove, while
                  black areas are kept. The mask is generated at the original
                  image dimensions before it is sent for processing.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Paint slightly beyond the object edge
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Cover the complete object and a small amount of its boundary.
                  The backend expands and smooths the mask before inpainting,
                  which helps avoid leaving thin fragments of the selected
                  object around its edges.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Telea vs Navier-Stokes inpainting
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Telea
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    Telea is the default method. It fills the masked region by
                    propagating nearby image information inward from the mask
                    boundary. It is generally a practical first choice for
                    relatively small unwanted areas.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Navier-Stokes
                  </h3>
                  <p className="text-sm text-gray-600 leading-6">
                    Navier-Stokes inpainting uses a different OpenCV method for
                    continuing nearby image structure into the selected region.
                    If Telea leaves an obvious artifact, compare the
                    Navier-Stokes result on the same mask.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What the inpaint radius controls
              </h2>
              <p className="text-gray-600 leading-7">
                The radius determines how far around each masked pixel OpenCV
                looks for neighboring image information. The current tool
                accepts values from 1 to 20 pixels. A small radius may work well
                around fine details, while a larger radius uses a wider
                neighborhood. Bigger values do not automatically produce a
                better result.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Best suited to smaller removal areas
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  Classical inpainting works best when the masked region is
                  reasonably small and surrounded by useful nearby texture.
                  Small blemishes, wires, marks, isolated objects, and simple
                  background interruptions are generally easier than large
                  complex subjects.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Large or complex objects can be difficult
                </h3>
                <p className="text-sm text-gray-600 leading-6">
                  The processor does not invent a new scene or understand hidden
                  background content. Large masks, faces, detailed architecture,
                  repeated patterns, or objects covering important structures
                  may produce visible smearing or reconstructed textures that do
                  not match the original scene.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the mask is prepared before removal
              </h2>
              <p className="text-gray-600 leading-7">
                Before inpainting, the server converts the mask to a binary
                image, performs morphological closing and opening, expands the
                selected region, smooths mask edges, and thresholds it again.
                This preprocessing helps create a cleaner removal boundary before
                the selected inpainting algorithm runs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tips for better object removal
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Keep the painted area as small as practical',
                  'Cover the entire unwanted object',
                  'Include a small margin around difficult edges',
                  'Try Telea first and compare Navier-Stokes if needed',
                  'Use a moderate radius before increasing it',
                  'Inspect patterns, edges, faces, and text after processing',
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
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Output and processing details
              </h2>
              <p className="text-gray-600 leading-7">
                The image and mask are processed on the server. The current
                backend returns the finished result as a JPEG image. Temporary
                input, mask, and output files used by the API are deleted after
                processing completes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Remove Object FAQ
              </h2>

              <div className="space-y-4">
                {[
                  [
                    'Does the tool automatically detect the object?',
                    'No. You manually paint a mask over the area you want removed, giving you direct control over which part of the image is processed.',
                  ],
                  [
                    'Is this AI object removal?',
                    'The current implementation uses classical OpenCV inpainting rather than an object-detection or generative AI model.',
                  ],
                  [
                    'Which inpainting method should I choose?',
                    'Telea is a good first choice. If the result is not satisfactory, compare Navier-Stokes using the same mask and radius.',
                  ],
                  [
                    'What radius should I use?',
                    'Start with a moderate value. The radius controls the neighboring area used during inpainting, and values from 1 to 20 pixels are supported.',
                  ],
                  [
                    'Can it remove a very large object?',
                    'It may process the mask, but large removal areas are more likely to show artifacts because classical inpainting depends on nearby visible image information.',
                  ],
                  [
                    'What format is the result?',
                    'The current server route returns the processed image as JPEG.',
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






