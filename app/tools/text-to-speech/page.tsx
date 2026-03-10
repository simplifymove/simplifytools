'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en-US');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((v) => v.name === voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = Math.max(0.5, Math.min(2, speed));
    utterance.pitch = Math.max(0.5, Math.min(2, pitch));

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!text.trim()) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.name === voice);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = Math.max(0.5, Math.min(2, speed));
      utterance.pitch = Math.max(0.5, Math.min(2, pitch));

      // Since browser TTS doesn't support direct download, show info
      alert('Note: To download audio, use an audio recording extension or screen recorder. Browser speech synthesis cannot be directly saved to file.');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const uniqueVoices = Array.from(new Set(voices.map((v) => v.name))).map((name) =>
    voices.find((v) => v.name === name)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Text to Speech</h1>
          <p className="text-gray-600 mb-8">Convert your text to natural-sounding audio</p>

          {/* Text Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Text</label>
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

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {uniqueVoices.map((v) => (
                  <option key={v?.name} value={v?.name}>
                    {v?.name.split(' - ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed */}
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

            {/* Pitch */}
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

          {/* Controls */}
          <div className="flex gap-4 flex-wrap mb-8">
            <button
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Volume2 size={20} /> {isPlaying ? 'Pause' : 'Play'}
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
              disabled={!text.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} /> Download Audio
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Tips</h3>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• Adjust speed and pitch for natural pronunciation</li>
              <li>• Choose from different voices and accents</li>
              <li>• Works with up to 5000 characters</li>
              <li>• Uses browser speech synthesis technology</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
