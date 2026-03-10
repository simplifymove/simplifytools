'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, Loader2, AlertCircle } from 'lucide-react';

export default function JpgToGifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState({
    fps: 10,
  });

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setError(null);
    setResult(null);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(uploadedFile);
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
      const formData = new FormData();
      formData.append('image', file);
      formData.append(
        'config',
        JSON.stringify({
          from_format: 'jpg',
          to_format: 'gif',
          options: { fps: options.fps },
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
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = 'converted.gif';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">JPG to GIF Converter</h1>
          <p className="text-lg text-gray-600">Convert single JPG images to GIF format</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <form onSubmit={handleProcess} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload JPG File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={processing}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="block w-full p-4 border-2 border-dashed border-yellow-300 rounded-lg cursor-pointer hover:border-yellow-500 transition text-center"
                  >
                    <Upload className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {file ? `${file.name}` : 'Click to upload JPG'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Options</h3>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">Frames Per Second</label>
                    <span className="text-lg font-bold text-yellow-600">{options.fps}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={options.fps}
                    onChange={(e) => setOptions({ ...options, fps: parseInt(e.target.value) })}
                    disabled={processing}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing || !file}
                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </span>
                ) : (
                  'Convert to GIF'
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>

            {preview && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Original</p>
                <img src={preview} alt="Original" className="w-full h-64 object-cover rounded-lg border border-gray-200" />
              </div>
            )}

            {result && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Result</p>
                <img src={result} alt="Result" className="w-full h-64 object-cover rounded-lg border border-orange-300 shadow-md" />
                <button
                  onClick={downloadResult}
                  className="w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download GIF
                </button>
              </div>
            )}

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
                <p className="text-gray-400 text-center">Upload a JPG to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
