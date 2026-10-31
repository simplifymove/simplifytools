'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeHeader } from '../../components/HomeHeader';
import { ImageUploader } from '../../components/ImageUploader';
import { Download, ChevronRight, Globe, Plus, X, Loader } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

interface DetectedText {
  id: string;
  original: string;
  translated: string;
  translationSuccess: boolean;
  x: number;
  y: number;
  confidence: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export default function TranslateImagePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [detectedTexts, setDetectedTexts] = useState<DetectedText[]>([]);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState('');
  const [error, setError] = useState('');
  const [translationWarning, setTranslationWarning] = useState('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const fileReadRef = useRef(0);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      generationRef.current++;
      fileReadRef.current++;
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const clearResult = () => {
    generationRef.current++;
    setResult(null);
    setResultPreview('');
    setProcessing(false);

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  const clearTranslation = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setOcrProcessing(false);
    setDetectedTexts([]);
    setOverlays([]);
    setSelectedOverlayId(null);
    setTranslationWarning('');
    clearResult();
  };

  const handleFileSelect = (selectedFile: File) => {
    clearTranslation();
    setError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setFile(null);
      setPreview('');
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    setFile(selectedFile);
    const readId = ++fileReadRef.current;
    const reader = new FileReader();

    reader.onload = () => {
      if (readId === fileReadRef.current) {
        setPreview(String(reader.result || ''));
      }
    };

    reader.onerror = () => {
      if (readId === fileReadRef.current) {
        setError('Unable to read the selected image.');
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleClearPreview = () => {
    fileReadRef.current++;
    clearTranslation();
    setFile(null);
    setPreview('');
    setError('');
  };

  const handleSourceLanguageChange = (value: string) => {
    clearTranslation();
    setSourceLanguage(value);
    setError('');
  };

  const handleTargetLanguageChange = (value: string) => {
    clearTranslation();
    setTargetLanguage(value);
    setError('');
  };

  const performOCR = async () => {
    if (!file || !preview || ocrProcessing || processing || downloading) return;

    clearTranslation();
    const controller = new AbortController();
    requestRef.current = controller;
    setOcrProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('/api/translate-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Translation failed (${response.status}).`);
      }

      if (!Array.isArray(data.translations)) {
        throw new Error('Unexpected translation response.');
      }

      if (controller.signal.aborted) return;

      const detectedItems: DetectedText[] = data.translations.map(
        (item: {
          original?: string;
          translated?: string;
          translationSuccess?: boolean;
          x?: number;
          y?: number;
          confidence?: number;
        }, index: number) => ({
          id: String(index),
          original: String(item.original || ''),
          translated: String(item.translated || item.original || ''),
          translationSuccess: item.translationSuccess === true,
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          confidence: Number(item.confidence) || 0,
        })
      );

      setDetectedTexts(detectedItems);
      setOverlays(detectedItems.map((item) => ({
        id: item.id,
        text: item.translated,
        x: item.x,
        y: item.y,
        fontSize,
        color: textColor,
      })));

      const failedCount = detectedItems.filter(
        (item) => !item.translationSuccess
      ).length;

      if (failedCount) {
        setTranslationWarning(
          `${failedCount} item(s) could not be translated. Original text was retained. Review these entries before exporting.`
        );
      }

      if (!detectedItems.length) {
        setTranslationWarning('No readable text was detected in this image.');
      }
    } catch (caughtError) {
      if (controller.signal.aborted) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to detect or translate image text.'
      );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setOcrProcessing(false);
      }
    }
  };

  const removeOverlay = (id: string) => {
    clearResult();
    setOverlays((current) => current.filter((item) => item.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    clearResult();
    setOverlays((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !preview) return;

    const img = new Image();

    img.onload = () => {
      const width = Math.min(img.naturalWidth, 600);
      const scale = width / img.naturalWidth;

      canvas.width = width;
      canvas.height = Math.round(img.naturalHeight * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      overlays.forEach((overlay) => {
        ctx.font = `${overlay.fontSize * scale}px Arial`;
        ctx.fillStyle = overlay.color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(overlay.text, overlay.x * scale, overlay.y * scale);
        ctx.shadowColor = 'transparent';
      });
    };

    img.src = preview;
  };

  const generateImage = async () => {
    if (!file || !preview || !overlays.length || processing || ocrProcessing) {
      setError('Upload an image and detect text before generating.');
      return;
    }

    clearResult();
    const generation = generationRef.current;
    setProcessing(true);
    setError('');

    try {
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to load the image.'));
        img.src = preview;
      });

      if (generation !== generationRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Image canvas unavailable.');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas processing unavailable.');

      ctx.drawImage(img, 0, 0);

      overlays.forEach((overlay) => {
        ctx.font = `${overlay.fontSize}px Arial`;
        ctx.fillStyle = overlay.color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(overlay.text, overlay.x, overlay.y);
        ctx.shadowColor = 'transparent';
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => value
            ? resolve(value)
            : reject(new Error('Unable to generate PNG.')),
          'image/png'
        );
      });

      if (generation !== generationRef.current) return;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult(blob);
      setResultPreview(url);
    } catch (caughtError) {
      if (generation !== generationRef.current) return;

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Image generation failed.'
      );
    } finally {
      if (generation === generationRef.current) setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file || processing || downloading) return;

    setDownloading(true);
    setError('');

    try {
      const downloadResult = await uploadBrowserDownloadResult({
        blob: result,
        toolSlug: 'translate-image',
        originalName: file.name,
        outputName: 'translated-image.png',
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

  useEffect(() => {
    drawPreview();
  }, [overlays, preview]);
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Hero Header */}
      <div className="bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Translate Image</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Translate Image</h1>
              <p className="text-white/90 text-lg">
                Automatically detect text in images and translate it
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 shadow-lg hidden md:block">
              <Globe size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Upload Image</h2>
              <ImageUploader
                onFileSelect={handleFileSelect}
                preview={preview}
                onClearPreview={handleClearPreview}
                accept="image/jpeg,image/png,image/webp"
              />
              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📁 {file.name}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Select Languages</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">Source</label>
                    <select
                      value={sourceLanguage}
                      onChange={(e) => handleSourceLanguageChange(e.target.value)}
                      className="w-full border border-amber-300 rounded-lg p-2 text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">Target</label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => handleTargetLanguageChange(e.target.value)}
                      className="w-full border border-amber-300 rounded-lg p-2 text-sm"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={performOCR}
                  disabled={!file || !preview || ocrProcessing || processing || downloading}
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  {ocrProcessing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Detecting Text...
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      2. Detect & Translate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Section - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-auto max-h-96">
                {preview ? (
                  <canvas ref={previewCanvasRef} className="max-w-full" />
                ) : (
                  <div className="text-gray-400 text-center p-8">
                    <p className="text-sm">Upload an image to preview</p>
                  </div>
                )}
              </div>

              {detectedTexts.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✓ Detected {detectedTexts.length} text {detectedTexts.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Translations */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Edit Translations</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p role="alert" className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {translationWarning && (
                <div role="alert" className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">{translationWarning}</p>
                </div>
              )}

              {detectedTexts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Run OCR to detect text in image</p>
                </div>
              ) : (
                <>
                  {/* Text Styling Controls */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value);
                        setFontSize(newSize);
                        clearResult(); setOverlays(overlays.map(o => ({ ...o, fontSize: newSize })));
                      }}
                      className="w-full accent-blue-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 mt-3 mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          clearResult(); setOverlays(overlays.map(o => ({ ...o, color: e.target.value })));
                        }}
                        className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={textColor}
                        readOnly
                        className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Overlays List */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">Detected Text ({overlays.length})</p>
                    <div className="space-y-2">
                      {overlays.map((overlay, idx) => (
                        <div key={overlay.id} className="p-2 bg-white border border-gray-200 rounded text-xs">
                          <div className="flex items-start gap-2 mb-1">
                            <input
                              type="text"
                              value={overlay.text}
                              onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
                              className="flex-1 border border-gray-300 rounded p-1 text-xs"
                            />
                            <button
                              onClick={() => removeOverlay(overlay.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {detectedTexts[idx] && (
                            <p className="text-gray-500">Original: {detectedTexts[idx].original}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generateImage}
                    disabled={overlays.length === 0 || processing || ocrProcessing || downloading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition mb-3 flex items-center justify-center gap-2 text-sm"
                  >
                    {processing ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      '✓ Generate Image'
                    )}
                  </button>

                  {result && resultPreview && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Generated PNG preview
                      </p>
                      <img
                        src={resultPreview}
                        alt="Image with translated text overlays"
                        className="w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Download Button */}
                  {result && (
                    <button
                      onClick={handleDownload} disabled={processing || downloading || ocrProcessing}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      {downloading ? "Preparing download..." : "Download PNG"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 How It Works</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Upload your image</li>
                <li>2. Select source & target languages</li>
                <li>3. Click "Detect & Translate"</li>
                <li>4. Edit translations if needed</li>
                <li>5. Generate and download</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

        <section className="bg-white border-t border-gray-200 px-4 md:px-8 py-14">
          <div className="max-w-6xl mx-auto space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How to translate text in an image
              </h2>
              <p className="text-gray-600 leading-7">
                Upload an image, choose the source and target languages, and
                run Detect &amp; Translate. The image is analyzed for text and
                translated entries are returned for review before generating
                the final image.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Server-assisted OCR and translation
                </h3>
                <p className="text-gray-600 leading-7">
                  OCR and translation use the SimplifyConvert server-side
                  translation endpoint. The uploaded image and selected
                  source and target languages are submitted for processing.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Editable translated overlays
                </h3>
                <p className="text-gray-600 leading-7">
                  Returned translations become editable text overlays. You
                  can correct translated wording or remove overlays before
                  generating the final image.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                How the translated image is generated
              </h2>
              <p className="text-gray-600 leading-7">
                After translation, the source image is drawn to a browser
                Canvas and the translated text overlays are rendered on top.
                The completed canvas is encoded as PNG. Original image text remains visible underneath the overlays; this tool does not automatically erase it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Review OCR results before exporting
              </h2>
              <p className="text-gray-600 leading-7">
                Small text, unusual fonts, low contrast, blur, and complex
                backgrounds can affect OCR recognition. Review detected and
                translated text and edit it when necessary.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Common image translation uses
              </h2>
              <ul className="text-gray-600 leading-7 space-y-2">
                <li>• Translate readable text captured in screenshots.</li>
                <li>• Review text detected from posters and graphics.</li>
                <li>• Translate legible text from scanned visual material.</li>
                <li>• Correct translated wording before generating the PNG.</li>
              </ul>
            </div>

            <FAQPanel>
              <FAQHeading>
                Translate Image FAQ
              </FAQHeading>

              <FAQList>
                <FAQCard>
                  <FAQStaticQuestion>
                    Is OCR performed entirely in the browser?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    No. OCR and translation use a server-side processing
                    endpoint.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    Can translated text be edited?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    Yes. Returned overlays can be edited before the final
                    image is generated.
                  </FAQAnswer>
                </FAQCard>

                <FAQCard>
                  <FAQStaticQuestion>
                    What output format is generated?
                  </FAQStaticQuestion>
                  <FAQAnswer>
                    The translated image is generated as PNG.
                  </FAQAnswer>
                </FAQCard>
              </FAQList>
            </FAQPanel>

          </div>
        </section>

</main>

      <Footer />
    </div>
  );
}





