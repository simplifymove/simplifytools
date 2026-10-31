'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Heart, Loader, ChevronRight, Sparkles, Zap, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import { FAQ } from '@/app/components/FAQ';

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
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const generationId = useRef(0);
  const mountedRef = useRef(true);
  const [hasAudio, setHasAudio] = useState(false);

  const clearAudio = () => {
    generationId.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    busyRef.current = false;

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    audioBlobRef.current = null;

    if (mountedRef.current) {
      setHasAudio(false);
      setIsPlaying(false);
      setIsLoading(false);
      setError('');
    }
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      generationId.current += 1;
      requestRef.current?.abort();
      audioRef.current?.pause();

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    clearAudio();
    // Regenerate when text or voice settings change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introText, text, outroText, language, voice, emotion, speed, pitch]);

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

  const generateAudio = async (): Promise<Blob> => {
    const controller = new AbortController();
    const currentId = ++generationId.current;
    requestRef.current = controller;

    const fullText = [introText, text, outroText]
      .map(part => part.trim())
      .filter(Boolean)
      .join('\n\n');

    if (!text.trim()) {
      throw new Error('Enter the main text before generating speech.');
    }

    if (fullText.length > 10000) {
      throw new Error('Combined text must not exceed 10,000 characters.');
    }

    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        text: fullText,
        language,
        voice,
        emotion,
        speed,
        pitch
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(
        typeof data?.error === 'string'
          ? data.error
          : 'Unable to generate speech.'
      );
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error('The speech service returned an empty audio file.');
    }

    if (currentId !== generationId.current || controller.signal.aborted) {
      throw new DOMException('Request cancelled', 'AbortError');
    }

    audioBlobRef.current = blob;

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }

    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = url;

    audio.onended = () => {
      if (mountedRef.current) setIsPlaying(false);
    };

    audio.onerror = () => {
      if (mountedRef.current) {
        setIsPlaying(false);
        setError('Unable to play the generated audio.');
      }
    };

    if (mountedRef.current) setHasAudio(true);

    return blob;
  };

  const handleSpeak = async () => {
    if (!text.trim() || busyRef.current) return;

    const audio = audioRef.current;

    if (audioBlobRef.current && audio) {
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      try {
        if (audio.ended) audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        setError('');
      } catch {
        setError('Audio playback was blocked or could not start.');
      }
      return;
    }

    busyRef.current = true;
    setIsLoading(true);
    setError('');
    const currentId = generationId.current + 1;

    try {
      await generateAudio();

      if (currentId !== generationId.current) return;

      const player = audioRef.current;
      if (!player) throw new Error('Audio player is unavailable.');

      await player.play();

      if (currentId === generationId.current && mountedRef.current) {
        setIsPlaying(true);
      }
    } catch (err) {
      if (currentId !== generationId.current) return;

      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(
          err instanceof Error ? err.message : 'Unable to generate speech.'
        );
      }
    } finally {
      if (currentId === generationId.current && mountedRef.current) {
        busyRef.current = false;
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!text.trim() || busyRef.current) return;

    busyRef.current = true;
    setIsLoading(true);
    setError('');

    const currentId = audioBlobRef.current
      ? generationId.current
      : generationId.current + 1;

    try {
      const blob = audioBlobRef.current || await generateAudio();

      if (currentId !== generationId.current) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `speech_${language}.mp3`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      if (currentId !== generationId.current) return;

      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(
          err instanceof Error ? err.message : 'Unable to download speech.'
        );
      }
    } finally {
      if (currentId === generationId.current && mountedRef.current) {
        busyRef.current = false;
        requestRef.current = null;
        setIsLoading(false);
      }
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
            <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
            <ChevronRight size={16} />
            <span>Text to Speech</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Text to Speech Converter with Voice Options
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              Enter text, choose from the available multilingual voices, adjust the provided voice settings, listen to the result, and download the generated audio as an MP3. No signup is required.
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
                      <Volume2 size={18} /> {isPlaying ? 'Pause' : hasAudio ? 'Resume / Play' : 'Generate & Play'}
                    </>
                  )}
                </button>
                {hasAudio && (
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
              <div role="alert" className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
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
                <h3 className="text-lg font-semibold mb-2">Voice Selection</h3>
                <p className="text-white/90 text-sm">Choose from the multilingual voices currently available in the tool</p>
              </div>
            </motion.div>
            <motion.div className="flex gap-4" whileHover={{ x: 5 }}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/30">
                  <Shield size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Voice Settings</h3>
                <p className="text-white/90 text-sm">Use the available presets together with speed and pitch controls</p>
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
                <p className="text-white/90 text-sm">Generate speech and save the returned audio as an MP3 file</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* SEO Content Section */}
      <div className="py-12 px-4 md:px-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What You Can Do with Text to Speech</h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              SimplifyConvert's text-to-speech tool converts entered text into spoken audio using the available voice choices. You can select a language and voice, use the provided presets, adjust speed and pitch settings, preview the generated speech, and download the result as an MP3. You can also explore <Link href="/all-tools" className="text-blue-600 font-medium hover:underline">other online tools</Link> for related file and content workflows.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Multilingual Voice Choices</h3>
                <p className="text-gray-700 text-sm">Choose from the language and voice options listed in the tool, including English and several Indian and international language variants.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ Adjustable Voice Settings</h3>
                <p className="text-gray-700 text-sm">The interface includes several named presets along with speed and pitch controls. Generated speech can vary by the selected voice and source text.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ MP3 Download</h3>
                <p className="text-gray-700 text-sm">After speech generation completes, use the Download button to save the returned audio as an MP3 file. No account is required to use the current tool.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">✓ No Signup Required</h3>
                <p className="text-gray-700 text-sm">No signup is required to use the available text-to-speech controls.</p>
              </div>
            </div>

            {/* Popular Features - Internal Linking */}
            <div className="mb-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Use Cases</h2>
              <p className="text-gray-700 mb-6">Possible uses for generated speech include:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Podcast Drafts:</strong> Create spoken versions of prepared scripts for review or use in audio projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Video Narration:</strong> Turn prepared narration text into an audio track for video projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Learning Materials:</strong> Create spoken versions of notes, explanations, or other educational text</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Presentations:</strong> Generate narration audio from text prepared for slides or demonstrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Listening Copies:</strong> Create an audio version of text when listening is more convenient than reading</span>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Text to Speech Tool</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Select a language and one of the voices available for it, then type or paste your main text. You can optionally add intro and outro text. Use the preset, speed, and pitch controls as needed, select Play to generate and listen to the speech, and use Download when you want to generate and save an MP3 copy. You can also <Link href="/all-tools/ai-tools" className="text-blue-600 font-medium hover:underline">explore other AI tools</Link> for additional content creation needs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ
        items={[
          {
            name: 'Do I need an account to use text to speech?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can use the available text-to-speech controls without creating an account.'
            }
          },
          {
            name: 'What languages and voices are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The tool currently lists 18 language and regional variants, including English (US and UK), several Indian languages, and other international options. Available voice choices vary by language.'
            }
          },
          {
            name: 'Can I control the emotion, speed, and pitch?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Speed and pitch are applied during speech generation. The named emotion presets modify speaking rate rather than producing expressive emotional voice acting. Results vary by voice and text.'
            }
          },
          {
            name: 'How do I download the audio file?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Enter your text, choose the settings you want, and click Download. The tool requests the speech audio and, when generation succeeds, saves the returned result as an MP3 file.'
            }
          },
          {
            name: 'Can I use generated audio commercially?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Usage rights for generated speech can depend on the speech provider and the content being synthesized. Review the applicable provider terms and make sure you have the necessary rights to the source text before publishing or using generated audio commercially.'
            }
          },
          {
            name: 'What file format do you provide?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The current download flow saves generated speech as an MP3 file. Whether it can be opened or imported depends on the software or device you use.'
            }
          }
        ]}
        colorClass="blue"
        bgColor="white"
      />

      {/* TTS Features ItemList Schema for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Text to Speech Features',
          description: 'Text to speech converter with multilingual voice choices, adjustable settings, playback, and MP3 download',
          itemListElement: [
            {
              '@type': 'SoftwareApplication',
              position: 1,
              name: 'English Text to Speech',
              description: 'Convert English text to speech using the available US and UK voice options',
              url: 'https://simplifyconvert.com/all-tools/text-to-speech',
              applicationCategory: 'AudioApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            },
            {
              '@type': 'SoftwareApplication',
              position: 2,
              name: 'Multilingual Text to Speech',
              description: 'Generate speech using 18 listed language and regional variants, including English, European and Indian language options',
              url: 'https://simplifyconvert.com/all-tools/text-to-speech',
              applicationCategory: 'AudioApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            },
            {
              '@type': 'SoftwareApplication',
              position: 3,
              name: 'Speaking Style Rate Presets',
              description: 'Choose named presets that adjust speaking rate, alongside manual speed and pitch controls',
              url: 'https://simplifyconvert.com/all-tools/text-to-speech',
              applicationCategory: 'AudioApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            },
            {
              '@type': 'SoftwareApplication',
              position: 4,
              name: 'Speed and Pitch Control',
              description: 'Adjust speech speed from 0.5x to 2x and pitch to customize voice delivery',
              url: 'https://simplifyconvert.com/all-tools/text-to-speech',
              applicationCategory: 'AudioApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            },
            {
              '@type': 'SoftwareApplication',
              position: 5,
              name: 'MP3 Download',
              description: 'Download successfully generated speech audio as an MP3 file',
              url: 'https://simplifyconvert.com/all-tools/text-to-speech',
              applicationCategory: 'AudioApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            }
          ]
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://simplifyconvert.com'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'All Tools',
              item: 'https://simplifyconvert.com/all-tools'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Text to Speech',
              item: 'https://simplifyconvert.com/all-tools/text-to-speech'
            }
          ]
        })}
      </script>
      </div>
    </main>
    <Footer />
    </>
  );
}







