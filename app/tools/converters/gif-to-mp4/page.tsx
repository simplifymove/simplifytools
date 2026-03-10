'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export default function GifToMp4Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'gif-to-mp4' | 'mp4-to-gif'>('gif-to-mp4');
  const [options, setOptions] = useState({
    fps: 30,
    quality: 85,
    scale: 512,
  });

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setError(null);
    setResult(null);
    setFile(uploadedFile);

    // Create preview from file
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleToggleMode = () => {
    setMode(mode === 'gif-to-mp4' ? 'mp4-to-gif' : 'gif-to-mp4');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleProcess = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a file first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const [fromFormat, toFormat] =
        mode === 'gif-to-mp4' ? ['gif', 'mp4'] : ['mp4', 'gif'];

      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: fromFormat,
          to_format: toFormat,
          options: {
            fps: options.fps,
            quality: options.quality,
            scale: mode === 'mp4-to-gif' ? options.scale : undefined,
          },
        })
      );

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setError(message);
      console.error('Conversion error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result;
    const ext = mode === 'gif-to-mp4' ? 'mp4' : 'gif';
    link.download = `converted.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const acceptFormats = mode === 'gif-to-mp4' ? '.gif' : '.mp4,video/mp4';
  const fileLabel = mode === 'gif-to-mp4' ? 'GIF' : 'MP4';
  const outputFormat = mode === 'gif-to-mp4' ? 'MP4' : 'GIF';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Animation Converter
          </h1>
          <p className="text-lg text-gray-600">
            Convert between GIF and MP4 formats with frame rate and quality control
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {fileLabel} ↔ {outputFormat}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={handleToggleMode}
                disabled={processing}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition"
              >
                {mode === 'gif-to-mp4' ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <span className="text-sm font-semibold hidden sm:inline">MP4→GIF</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold hidden sm:inline">GIF→MP4</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleProcess} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload {fileLabel} File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept={acceptFormats}
                    onChange={handleFileUpload}
                    disabled={processing}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="block w-full p-4 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition text-center"
                  >
                    <Upload className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {file ? `${file.name}` : `Click to upload ${fileLabel}`}
                    </span>
                  </label>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Options</h3>

                {/* FPS Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Frames Per Second (FPS)
                    </label>
                    <span className="text-lg font-bold text-purple-600">{options.fps}</span>
                  </div>
                  <input
                    type="range"
                    min={mode === 'gif-to-mp4' ? 15 : 5}
                    max={mode === 'gif-to-mp4' ? 60 : 30}
                    step={1}
                    value={options.fps}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        fps: parseInt(e.target.value),
                      })
                    }
                    disabled={processing}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {mode === 'gif-to-mp4'
                      ? 'Higher FPS = smoother motion'
                      : 'Lower FPS = smaller file size'}
                  </p>
                </div>

                {/* Quality Slider (GIF→MP4 only) */}
                {mode === 'gif-to-mp4' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        MP4 Quality
                      </label>
                      <span className="text-lg font-bold text-purple-600">
                        {options.quality}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={95}
                      step={5}
                      value={options.quality}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          quality: parseInt(e.target.value),
                        })
                      }
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher quality = larger file size
                    </p>
                  </div>
                )}

                {/* Scale Slider (MP4→GIF only) */}
                {mode === 'mp4-to-gif' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Output Width (pixels)
                      </label>
                      <span className="text-lg font-bold text-purple-600">
                        {options.scale}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={256}
                      max={1024}
                      step={64}
                      value={options.scale}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          scale: parseInt(e.target.value),
                        })
                      }
                      disabled={processing}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Larger = better quality but bigger file
                    </p>
                  </div>
                )}
              </div>

              {/* Convert Button */}
              <button
                type="submit"
                disabled={processing || !file}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </span>
                ) : (
                  `Convert to ${outputFormat}`
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
                {mode === 'gif-to-mp4' ? (
                  <img
                    src={preview}
                    alt="Original GIF"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <video
                    src={preview}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    controls
                  />
                )}
              </div>
            )}

            {/* Result */}
            {result && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Result</p>
                {mode === 'gif-to-mp4' ? (
                  <video
                    src={result}
                    className="w-full h-64 object-cover rounded-lg border border-pink-300 shadow-md"
                    controls
                  />
                ) : (
                  <img
                    src={result}
                    alt="Converted"
                    className="w-full h-64 object-cover rounded-lg border border-pink-300 shadow-md"
                  />
                )}
                <button
                  onClick={downloadResult}
                  className="w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download {outputFormat}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-semibold">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!preview && !result && !error && (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-center">
                  Upload a {fileLabel} to see preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📹 Animation Formats</h3>
              <p className="text-sm text-gray-600">
                <strong>GIF:</strong> Best for simple animations, supports transparency.
                <br />
                <strong>MP4:</strong> Modern compression, smaller files, better quality.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">⚡ Processing</h3>
              <p className="text-sm text-gray-600">
                Conversion is performed server-side. Typical conversion time is 5-60 seconds depending on file size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
