'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Play, Pause, Download, Volume2, Heart, Loader, ChevronRight, Sparkles, Zap, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';

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
    <>
      <HomeHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 py-16 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight size={16} />
            <Link href="/tools/ai-write" className="hover:text-white transition">AI Tools</Link>
            <ChevronRight size={16} />
            <span>Text to Speech</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
              🎤 Text to Speech
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Convert text to natural speech with neural voices in 20+ languages. Perfect for podcasts, presentations, and more
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sticky Sidebar Form */}
          <motion.div
            className="lg:sticky lg:top-4 h-fit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                Voice Settings
              </h2>

              {/* Language */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🌍 Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm bg-blue-50"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.flag} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎤 Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full p-3 border-2 border-cyan-200 rounded-lg focus:border-cyan-500 focus:outline-none text-sm bg-cyan-50"
                >
                  {availableVoices.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emotion */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Heart size={16} className="text-blue-600" /> Emotion
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

              {/* Speed */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">⚡ Speed: {speed.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Pitch */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎵 Pitch: {pitch.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Current Settings */}
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
                <p className="text-xs font-semibold text-blue-900">
                  <span className="block mb-1">Current Settings:</span>
                  <span className="text-blue-700">{emotionSettings[emotion].name}</span>
                  <span className="block text-blue-700">Speed: {(speed * emotionSettings[emotion].speed).toFixed(1)}x</span>
                  <span className="block text-blue-700">Pitch: {(pitch * emotionSettings[emotion].pitch).toFixed(1)}x</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSpeak}
                  disabled={!text.trim() || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg duration-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} /> {isPlaying ? 'Pause' : 'Play'}
                    </>
                  )}
                </button>
                {isPlaying && (
                  <button
                    onClick={handleStop}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg duration-0 shadow-lg"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={!text.trim() || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg duration-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
                <p className="text-sm text-red-900 font-medium">❌ {error}</p>
              </div>
            )}

            {/* Intro Text */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">📢 Intro Text (Optional)</label>
              <input
                type="text"
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                placeholder="Example: 'Welcome to my podcast'"
                className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none text-sm bg-green-50"
              />
              <p className="text-xs text-green-700 mt-2">This will be spoken BEFORE your main text</p>
            </div>

            {/* Main Text */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">📝 Main Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the text you want to convert to speech..."
                className="w-full h-48 p-4 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-600">Characters: <span className="font-bold text-blue-600">{text.length}</span></span>
              </div>
            </div>

            {/* Outro Text */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">🎯 Outro/Ending Text (Optional)</label>
              <input
                type="text"
                value={outroText}
                onChange={(e) => setOutroText(e.target.value)}
                placeholder="Example: 'Thanks for listening!'"
                className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm bg-orange-50"
              />
              <p className="text-xs text-orange-700 mt-2">This will be spoken AFTER your main text</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Highlight */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl shadow-xl p-12 text-white"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-3xl font-bold mb-8">Why Use Our Text-to-Speech?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div className="flex gap-4" whileHover={{ x: 5 }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/30">
                  <Zap size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Natural Speech</h3>
                <p className="text-white/90 text-sm">Neural voices with natural pronunciation in 20+ languages</p>
              </div>
            </motion.div>
            <motion.div className="flex gap-4" whileHover={{ x: 5 }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/30">
                  <Shield size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Emotion Control</h3>
                <p className="text-white/90 text-sm">Adjust emotions, speed, and pitch for perfect tone</p>
              </div>
            </motion.div>
            <motion.div className="flex gap-4" whileHover={{ x: 5 }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-400/30">
                  <CheckCircle size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Easy Download</h3>
                <p className="text-white/90 text-sm">Generate and download high-quality MP3 files instantly</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </main>
    <Footer />
    </>
  );
}
