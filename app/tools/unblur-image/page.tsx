'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';

export default function UnblurImagePage() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'enhance' | 'motion'>('enhance');
  
  // Enhancement mode parameters
  const [strength, setStrength] = useState(1.8);
  const [denoise, setDenoise] = useState(15);
  const [clahe, setClahe] = useState(3.5);
  const [edgePreserve, setEdgePreserve] = useState(false);
  
  // Motion deblur mode parameters
  const [motionLength, setMotionLength] = useState(15);
  const [motionAngle, setMotionAngle] = useState(45);
  const [iterations, setIterations] = useState(50);
  
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
      formData.append('mode', mode);
      
      if (mode === 'enhance') {
        formData.append('strength', strength.toString());
        formData.append('denoise', denoise.toString());
        formData.append('clahe', clahe.toString());
        formData.append('edgePreserve', edgePreserve.toString());
      } else {
        formData.append('motionLength', motionLength.toString());
        formData.append('motionAngle', motionAngle.toString());
        formData.append('iterations', iterations.toString());
      }

      // Process
      const processResponse = await fetch('/api/unblur-image', {
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
    link.download = `unblur-image-${Date.now()}.jpg`;
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
            Unblur Image
          </h1>
          <p className="text-lg text-gray-600">
            Enhance and clarify blurry images using AI-powered enhancement or motion deblur
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

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Processing Mode
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition" onClick={() => setMode('enhance')}>
                    <input
                      type="radio"
                      name="mode"
                      value="enhance"
                      checked={mode === 'enhance'}
                      onChange={(e) => setMode('enhance')}
                      disabled={processing}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Enhancement Pipeline</p>
                      <p className="text-xs text-gray-500">Denoise + contrast + sharpening</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition" onClick={() => setMode('motion')}>
                    <input
                      type="radio"
                      name="mode"
                      value="motion"
                      checked={mode === 'motion'}
                      onChange={(e) => setMode('motion')}
                      disabled={processing}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Motion Deblur</p>
                      <p className="text-xs text-gray-500">Richardson-Lucy deconvolution</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhancement Mode Parameters */}
              {mode === 'enhance' && (
                <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-gray-900">Enhancement Parameters</h3>
                  
                  {/* Denoise */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Denoise Strength
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{denoise.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={denoise}
                      onChange={(e) => setDenoise(parseFloat(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = off, 10 = balanced, 20+ = heavy</p>
                  </div>

                  {/* Sharpening Strength */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Sharpening Strength
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{strength.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={strength}
                      onChange={(e) => setStrength(parseFloat(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.5 = subtle, 1.2 = balanced, 2.0 = aggressive</p>
                  </div>

                  {/* CLAHE Contrast */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Local Contrast (CLAHE)
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{clahe.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={clahe}
                      onChange={(e) => setClahe(parseFloat(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = off, 2 = balanced, 5 = maximum</p>
                  </div>

                  {/* Edge Preservation */}
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <input
                      type="checkbox"
                      id="edge-preserve"
                      checked={edgePreserve}
                      onChange={(e) => setEdgePreserve(e.target.checked)}
                      disabled={processing}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="edge-preserve" className="text-sm font-medium text-gray-700">
                      Edge Preservation Filter
                    </label>
                  </div>
                </div>
              )}

              {/* Motion Deblur Mode Parameters */}
              {mode === 'motion' && (
                <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h3 className="font-semibold text-gray-900">Motion Deblur Parameters</h3>
                  
                  {/* Motion Length */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Motion Length (pixels)
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{motionLength}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={motionLength}
                      onChange={(e) => setMotionLength(parseInt(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Length of motion blur kernel</p>
                  </div>

                  {/* Motion Angle */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Motion Angle (degrees)
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{motionAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="5"
                      value={motionAngle}
                      onChange={(e) => setMotionAngle(parseInt(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Direction of motion blur</p>
                  </div>

                  {/* Iterations */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Iterations
                      </label>
                      <span className="text-lg font-bold text-indigo-600">{iterations}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={iterations}
                      onChange={(e) => setIterations(parseInt(e.target.value))}
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">50 = fast/good, 100+ = slow/better</p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <button
                type="submit"
                disabled={processing || !image}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === 'enhance' ? 'Enhancing...' : 'Deblurring...'}
                  </span>
                ) : (
                  `Apply ${mode === 'enhance' ? 'Enhancement' : 'Motion Deblur'}`
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
            <h3 className="font-bold text-gray-900 mb-2">📸 Enhancement Mode</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Denoise (removes noise)</li>
              <li>✓ Local contrast enhancement</li>
              <li>✓ Unsharp mask sharpening</li>
              <li>✓ Best for: general blur</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🎯 Motion Deblur Mode</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Richardson-Lucy deconvolution</li>
              <li>✓ Motion blur specific</li>
              <li>✓ Adjustable direction/magnitude</li>
              <li>✓ Best for: motion blur</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">⚡ Pro Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Enhancement: default settings work well</li>
              <li>• Motion: match kernel length to blur</li>
              <li>• More iterations = better quality</li>
              <li>• Processing may take 30-120 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
