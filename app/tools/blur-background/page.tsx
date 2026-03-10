'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';

export default function BlurBackgroundPage() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blurStrength, setBlurStrength] = useState(35);
  const [featherRadius, setFeatherRadius] = useState(5);
  const [portraitMode, setPortraitMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
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
      // Convert data URL to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('blurStrength', blurStrength.toString());
      formData.append('featherRadius', featherRadius.toString());
      formData.append('portraitMode', portraitMode.toString());

      // Process
      const processResponse = await fetch('/api/blur-background', {
        method: 'POST',
        body: formData,
      });

      const data = await processResponse.json();

      if (!processResponse.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      // Set result
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

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result;
    link.download = `blur-background-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Blur Background
          </h1>
          <p className="text-lg text-gray-600">
            Professional portrait mode effect with sharp subject and blurred background
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <form onSubmit={handleProcess} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="relative">
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
                    className="block w-full p-4 border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 transition text-center"
                  >
                    <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {image ? 'Image selected' : 'Click to upload image'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Blur Strength */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Blur Strength
                  </label>
                  <span className="text-lg font-bold text-indigo-600">{blurStrength}</span>
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
                  {blurStrength <= 25
                    ? '🎯 Natural, subtle blur'
                    : blurStrength <= 35
                    ? '📸 Balanced portrait mode'
                    : '✨ Strong, dramatic effect'}
                </p>
              </div>

              {/* Feather Radius */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Edge Feathering
                  </label>
                  <span className="text-lg font-bold text-indigo-600">{featherRadius}px</span>
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
                <p className="text-xs text-gray-500 mt-1">
                  Higher = softer, smoother edges (avoids cutout look)
                </p>
              </div>

              {/* Portrait Mode */}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <input
                  type="checkbox"
                  id="portrait-mode"
                  checked={portraitMode}
                  onChange={(e) => setPortraitMode(e.target.checked)}
                  disabled={processing}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="portrait-mode" className="text-sm font-medium text-gray-700">
                  Portrait Mode (darkens background for depth effect)
                </label>
              </div>

              {/* Process Button */}
              <button
                type="submit"
                disabled={processing || !image}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing... (30-60 seconds first time)
                  </span>
                ) : (
                  'Apply Blur Background'
                )}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>

            {/* Original Preview */}
            {preview && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Original</p>
                <img
                  src={preview}
                  alt="Original"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Result Preview */}
            {result && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Result</p>
                <img
                  src={result}
                  alt="Result"
                  className="w-full h-64 object-cover rounded-lg border border-indigo-300 shadow-md"
                />
                <button
                  onClick={downloadResult}
                  className="w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Result
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!preview && !result && !error && (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-center">
                  Upload an image to see preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🎯 Recommended Settings</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>Natural:</strong> Blur 25, Feather 5</li>
              <li><strong>Portrait:</strong> Blur 45, Feather 5</li>
              <li><strong>Professional:</strong> Blur 35 + Portrait Mode</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">⚡ Processing</h3>
            <p className="text-sm text-gray-600">
              First run takes 30-60 seconds (downloads AI model). Subsequent runs are faster.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📸 Best For</h3>
            <p className="text-sm text-gray-600">
              Portraits, headshots, selfies, and professional photos. Works with any background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
