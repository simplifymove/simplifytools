'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Play, Pause, Download, Volume2, Heart, Loader } from 'lucide-react';

export default function TextToSpeech() {
  // Voice map definition BEFORE any hooks
  const voiceMap: Record<string, { label: string; voices: { code: string; name: string }[] }> = {
    'hi-IN': { label: 'हिंदी (Hindi)', voices: [{ code: 'hi-IN-MadhurNeural', name: 'Madhur (Male)' }, { code: 'hi-IN-SwaraNeural', name: 'Swara (Female)' }] },
    'ta-IN': { label: 'தமிழ் (Tamil)', voices: [{ code: 'ta-IN-ValluvarNeural', name: 'Valluvar (Male)' }, { code: 'ta-IN-PallaviNeural', name: 'Pallavi (Female)' }] },
    'te-IN': { label: 'తెలుగు (Telugu)', voices: [{ code: 'te-IN-MohanNeural', name: 'Mohan (Male)' }, { code: 'te-IN-ShrutiNeural', name: 'Shruti (Female)' }] },
    'kn-IN': { label: 'ಕನ್ನಡ (Kannada)', voices: [{ code: 'kn-IN-GaranNeural', name: 'Garan (Male)' }, { code: 'kn-IN-HerangiNeural', name: 'Herangi (Female)' }] },
    'ml-IN': { label: 'മലയാളം (Malayalam)', voices: [{ code: 'ml-IN-SobhanaNeural', name: 'Sobhana (Female)' }, { code: 'ml-IN-JeremiahNeural', name: 'Jeremiah (Male)' }] },
    'mr-IN': { label: 'मराठी (Marathi)', voices: [{ code: 'mr-IN-MedhaNeural', name: 'Medha (Female)' }, { code: 'mr-IN-AarohNeural', name: 'Aaroh (Male)' }] },
    'gu-IN': { label: 'ગુજરાતી (Gujarati)', voices: [{ code: 'gu-IN-DhwaniNeural', name: 'Dhwani (Female)' }, { code: 'gu-IN-NiranjanNeural', name: 'Niranjan (Male)' }] },
    'bn-IN': { label: 'বাংলা (Bengali)', voices: [{ code: 'bn-IN-TanushreeNeural', name: 'Tanushree (Female)' }, { code: 'bn-IN-BiswaNeural', name: 'Biswa (Male)' }] },
    'pa-IN': { label: 'ਪੰਜਾਬੀ (Punjabi)', voices: [{ code: 'pa-IN-OjasvatiNeural', name: 'Ojasvati (Female)' }, { code: 'pa-IN-JunaidNeural', name: 'Junaid (Male)' }] },
    'en-US': { label: 'English (US)', voices: [{ code: 'en-US-AriaNeural', name: 'Aria (Female)' }, { code: 'en-US-GuyNeural', name: 'Guy (Male)' }, { code: 'en-US-JennyNeural', name: 'Jenny (Female)' }] },
    'en-GB': { label: 'English (UK)', voices: [{ code: 'en-GB-LibbyNeural', name: 'Libby (Female)' }, { code: 'en-GB-RyanNeural', name: 'Ryan (Male)' }] },
    'es-ES': { label: 'Español (Spanish)', voices: [{ code: 'es-ES-ElviraNeural', name: 'Elvira (Female)' }, { code: 'es-ES-AlvaroNeural', name: 'Alvaro (Male)' }] },
    'fr-FR': { label: 'Français (French)', voices: [{ code: 'fr-FR-DeniseNeural', name: 'Denise (Female)' }, { code: 'fr-FR-HenriNeural', name: 'Henri (Male)' }] },
    'de-DE': { label: 'Deutsch (German)', voices: [{ code: 'de-DE-AmalaNeural', name: 'Amala (Female)' }, { code: 'de-DE-ConradNeural', name: 'Conrad (Male)' }] },
    'it-IT': { label: 'Italiano (Italian)', voices: [{ code: 'it-IT-ElsaNeural', name: 'Elsa (Female)' }, { code: 'it-IT-DiegoNeural', name: 'Diego (Male)' }] },
    'pt-BR': { label: 'Português (Portuguese)', voices: [{ code: 'pt-BR-FranciscaNeural', name: 'Francisca (Female)' }, { code: 'pt-BR-AntonioNeural', name: 'Antonio (Male)' }] },
    'ja-JP': { label: '日本語 (Japanese)', voices: [{ code: 'ja-JP-NanamiNeural', name: 'Nanami (Female)' }, { code: 'ja-JP-MakoNeural', name: 'Mako (Male)' }] },
    'zh-CN': { label: '中文 (Chinese)', voices: [{ code: 'zh-CN-XiaohanNeural', name: 'Xiaohan (Female)' }, { code: 'zh-CN-YunyangNeural', name: 'Yunyang (Male)' }] },
  };

  // Initialize language and voice properly with defaults
  const defaultLanguage = 'en-US';
  const defaultVoice = voiceMap[defaultLanguage].voices[0].code;

  const [introText, setIntroText] = useState('');
  const [text, setText] = useState('');
  const [outroText, setOutroText] = useState('');
  const [language, setLanguage] = useState(defaultLanguage);
  const [voice, setVoice] = useState(defaultVoice);
  const [emotion, setEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const emotionSettings: Record<string, { pitch: number; speed: number; volume: number; name: string }> = {
    neutral: { pitch: 1, speed: 1, volume: 1, name: 'Neutral' },
    happy: { pitch: 1.3, speed: 1.2, volume: 1.1, name: 'Happy 😊' },
    sad: { pitch: 0.7, speed: 0.8, volume: 0.9, name: 'Sad 😢' },
    angry: { pitch: 1.1, speed: 1.3, volume: 1.2, name: 'Angry 😠' },
    excited: { pitch: 1.25, speed: 1.4, volume: 1.15, name: 'Excited 🤩' },
    serious: { pitch: 0.8, speed: 0.9, volume: 1, name: 'Serious 😐' },
    calm: { pitch: 0.9, speed: 0.7, volume: 0.95, name: 'Calm 🧘' },
    romantic: { pitch: 1.15, speed: 0.85, volume: 1.05, name: 'Romantic 💕' },
  };

  const languageOptions = Object.entries(voiceMap).map(([code, data]) => ({
    code,
    label: data.label,
    flag: code.includes('IN') ? '🇮🇳' : code.includes('US') ? '🇺🇸' : code.includes('GB') ? '🇬🇧' : code.includes('ES') ? '🇪🇸' : code.includes('FR') ? '🇫🇷' : code.includes('DE') ? '🇩🇪' : code.includes('IT') ? '🇮🇹' : code.includes('PT') ? '🇵🇹' : code.includes('JA') ? '🇯🇵' : '🌐',
  }));

  // Get available voices for selected language
  const availableVoices = useMemo(() => {
    return voiceMap[language]?.voices || [];
  }, [language]);

  // Sync voice when language changes - set to first voice of new language
  React.useEffect(() => {
    if (availableVoices.length > 0 && !availableVoices.find(v => v.code === voice)) {
      setVoice(availableVoices[0].code);
    }
  }, [language, availableVoices, voice]);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Build text parts - only include non-empty parts
      const textParts = [];
      if (introText.trim()) textParts.push(introText.trim());
      if (text.trim()) textParts.push(text.trim());
      if (outroText.trim()) textParts.push(outroText.trim());
      
      // Join with clear pauses (double newline for better break)
      const fullText = textParts.join('\n\n');
      
      // Log for debugging
      console.log('[TTS] Text parts:', {
        intro: introText.trim() ? `✓ "${introText.trim().substring(0, 20)}..."` : '✗ Empty',
        main: text.trim() ? `✓ "${text.trim().substring(0, 20)}..."` : '✗ Empty',
        outro: outroText.trim() ? `✓ "${outroText.trim().substring(0, 20)}..."` : '✗ Empty',
        language,
        voice,
        emotion,
        speed: `${speed}x`,
        pitch: `${pitch}x`,
      });

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, language, voice, emotion, speed, pitch }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Speech generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Build text parts - only include non-empty parts
      const textParts = [];
      if (introText.trim()) textParts.push(introText.trim());
      if (text.trim()) textParts.push(text.trim());
      if (outroText.trim()) textParts.push(outroText.trim());
      
      const fullText = textParts.join('\n\n');

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, language, voice, emotion, speed, pitch }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `speech_${language}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-2">
            <Volume2 className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Text to Speech</h1>
          </div>
          <p className="text-gray-600 mb-8">🎤 Neural voices in 20+ languages - Choose professional speakers for better pronunciation! Edge TTS delivers natural, fluent speech.</p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8 rounded">
              <p className="text-sm text-red-900">❌ {error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">📢 Intro Text (Optional)</label>
            <input
              type="text"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder=""
              className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none text-sm bg-green-50"
            />
            <p className="text-xs text-green-700 mt-1">This will be spoken BEFORE your main text</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">📝 Main Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want to convert to speech..."
              className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="mt-2 text-sm text-gray-600">
              Characters: <span className="font-semibold">{text.length}</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Outro/Ending Text (Optional)</label>
            <input
              type="text"
              value={outroText}
              onChange={(e) => setOutroText(e.target.value)}
              placeholder=""
              className="w-full p-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm bg-orange-50"
            />
            <p className="text-xs text-orange-700 mt-1">This will be spoken AFTER your main text</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🌍 Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎤 Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm bg-purple-50 font-medium"
              >
                {availableVoices.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-purple-700 mt-1">✨ Better pronunciation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Heart size={16} className="text-red-500" /> Emotion
              </label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              >
                {Object.entries(emotionSettings).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speed: {speed.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pitch: {pitch.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-8 rounded">
            <p className="text-sm text-purple-900">
              <strong>Current Settings:</strong> {emotionSettings[emotion].name} - 
              Speed: {(speed * emotionSettings[emotion].speed).toFixed(1)}x, 
              Pitch: {(pitch * emotionSettings[emotion].pitch).toFixed(1)}x
            </p>
          </div>

          <div className="flex gap-4 flex-wrap mb-8">
            <button
              onClick={handleSpeak}
              disabled={!text.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Volume2 size={20} /> {isPlaying ? 'Pause' : 'Play'}
                </>
              )}
            </button>
            {isPlaying && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
              >
                Stop
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={!text.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} /> Download Audio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
