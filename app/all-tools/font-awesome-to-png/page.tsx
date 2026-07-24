'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ChevronRight, Loader, Search, Copy, Check } from 'lucide-react';
import { HomeHeader } from '../../components/HomeHeader';
import { Footer } from '../../components/Footer';
import { uploadBrowserDownloadResult } from '@/app/lib/download-result-client';

// Comprehensive Font Awesome Icon Library
const FONT_AWESOME_ICONS = [
  // UI Icons
  { name: 'heart', symbol: '♥', category: 'UI', description: 'Love, like, favorite' },
  { name: 'star', symbol: '★', category: 'UI', description: 'Rating, favorite, important' },
  { name: 'star-half', symbol: '⭐', category: 'UI', description: 'Half star rating' },
  { name: 'check', symbol: '✓', category: 'UI', description: 'Confirm, tick, done' },
  { name: 'times', symbol: '✕', category: 'UI', description: 'Close, cancel, error' },
  { name: 'circle', symbol: '●', category: 'UI', description: 'Dot, point, bullet' },
  { name: 'square', symbol: '■', category: 'UI', description: 'Box, shape, record' },
  { name: 'triangle', symbol: '▲', category: 'UI', description: 'Up, play, direction' },
  { name: 'exclamation', symbol: '❗', category: 'UI', description: 'Alert, warning, important' },
  { name: 'question', symbol: '❓', category: 'UI', description: 'Help, support, FAQ' },
  { name: 'info', symbol: 'ℹ', category: 'UI', description: 'Information, details' },
  { name: 'plus', symbol: '＋', category: 'UI', description: 'Add, new, create' },
  { name: 'minus', symbol: '−', category: 'UI', description: 'Remove, delete, subtract' },
  { name: 'times-circle', symbol: '⊗', category: 'UI', description: 'Close, error, cancel' },
  { name: 'check-circle', symbol: '✔', category: 'UI', description: 'Success, verified, done' },
  
  // Arrows
  { name: 'arrow-right', symbol: '→', category: 'Arrows', description: 'Right direction' },
  { name: 'arrow-left', symbol: '←', category: 'Arrows', description: 'Left direction' },
  { name: 'arrow-up', symbol: '↑', category: 'Arrows', description: 'Up direction' },
  { name: 'arrow-down', symbol: '↓', category: 'Arrows', description: 'Down direction' },
  { name: 'arrows', symbol: '↔', category: 'Arrows', description: 'Resize, swap' },
  { name: 'arrow-circle-right', symbol: '⟳', category: 'Arrows', description: 'Circular right' },
  { name: 'arrow-circle-left', symbol: '⟲', category: 'Arrows', description: 'Circular left' },
  { name: 'chevron-right', symbol: '›', category: 'Arrows', description: 'Next, forward' },
  { name: 'chevron-left', symbol: '‹', category: 'Arrows', description: 'Previous, back' },
  { name: 'chevron-up', symbol: '∧', category: 'Arrows', description: 'Collapse, up' },
  { name: 'chevron-down', symbol: '∨', category: 'Arrows', description: 'Expand, down' },
  
  // Weather
  { name: 'sun', symbol: '☀', category: 'Weather', description: 'Sunny, bright' },
  { name: 'moon', symbol: '☾', category: 'Weather', description: 'Night, dark mode' },
  { name: 'cloud', symbol: '☁', category: 'Weather', description: 'Cloud, weather' },
  { name: 'cloud-rain', symbol: '🌧', category: 'Weather', description: 'Rain, rainy' },
  { name: 'snowflake', symbol: '❄', category: 'Weather', description: 'Snow, cold, winter' },
  { name: 'wind', symbol: '〰', category: 'Weather', description: 'Wind, breeze' },
  { name: 'temperature', symbol: '🌡', category: 'Weather', description: 'Temperature, heat' },
  { name: 'umbrella', symbol: '☂', category: 'Weather', description: 'Rain protection' },
  
  // Objects
  { name: 'lock', symbol: '🔒', category: 'Objects', description: 'Secure, private, locked' },
  { name: 'unlock', symbol: '🔓', category: 'Objects', description: 'Unsecured, open' },
  { name: 'key', symbol: '🔑', category: 'Objects', description: 'Password, access' },
  { name: 'bell', symbol: '🔔', category: 'Objects', description: 'Notification, alert' },
  { name: 'bell-slash', symbol: '🔕', category: 'Objects', description: 'Muted, no notification' },
  { name: 'gear', symbol: '⚙', category: 'Objects', description: 'Settings, preferences' },
  { name: 'gears', symbol: '⚙⚙', category: 'Objects', description: 'Configuration, setup' },
  { name: 'home', symbol: '🏠', category: 'Objects', description: 'Home, house, dashboard' },
  { name: 'folder', symbol: '📁', category: 'Objects', description: 'Directory, file' },
  { name: 'file', symbol: '📄', category: 'Objects', description: 'Document, page' },
  { name: 'calendar', symbol: '📅', category: 'Objects', description: 'Date, schedule, event' },
  { name: 'clock', symbol: '🕐', category: 'Objects', description: 'Time, duration' },
  { name: 'chart', symbol: '📊', category: 'Objects', description: 'Analytics, statistics' },
  { name: 'bar-chart', symbol: '📉', category: 'Objects', description: 'Graph, data' },
  { name: 'money', symbol: '💰', category: 'Objects', description: 'Payment, price, cost' },
  { name: 'credit-card', symbol: '💳', category: 'Objects', description: 'Payment, card' },
  { name: 'shopping-cart', symbol: '🛒', category: 'Objects', description: 'Shop, buy, ecommerce' },
  { name: 'bag', symbol: '🛍', category: 'Objects', description: 'Shopping, purchase' },
  { name: 'gift', symbol: '🎁', category: 'Objects', description: 'Present, reward, bonus' },
  { name: 'lightbulb', symbol: '💡', category: 'Objects', description: 'Idea, inspiration' },
  { name: 'phone', symbol: '📱', category: 'Objects', description: 'Mobile, contact, call' },
  { name: 'envelope', symbol: '✉', category: 'Objects', description: 'Email, message, mail' },
  { name: 'map', symbol: '🗺', category: 'Objects', description: 'Location, navigation' },
  { name: 'bookmark', symbol: '🔖', category: 'Objects', description: 'Save, favorite, mark' },
  { name: 'printer', symbol: '🖨', category: 'Objects', description: 'Print, document' },
  
  // Communication
  { name: 'comment', symbol: '💬', category: 'Communication', description: 'Chat, message, feedback' },
  { name: 'comments', symbol: '💭', category: 'Communication', description: 'Discussion, chat' },
  { name: 'quote-left', symbol: '❝', category: 'Communication', description: 'Quote, testimonial' },
  { name: 'quote-right', symbol: '❞', category: 'Communication', description: 'Quote end' },
  { name: 'phone-alt', symbol: '☎', category: 'Communication', description: 'Telephone, call' },
  { name: 'microphone', symbol: '🎤', category: 'Communication', description: 'Audio, voice, record' },
  { name: 'speaker', symbol: '🔊', category: 'Communication', description: 'Volume, sound, audio' },
  { name: 'volume-up', symbol: '🔊', category: 'Communication', description: 'Loud, increase' },
  { name: 'volume-down', symbol: '🔉', category: 'Communication', description: 'Quiet, decrease' },
  { name: 'volume-mute', symbol: '🔇', category: 'Communication', description: 'Silent, mute' },
  
  // People
  { name: 'user', symbol: '👤', category: 'People', description: 'Person, profile, account' },
  { name: 'users', symbol: '👥', category: 'People', description: 'Group, team, community' },
  { name: 'user-plus', symbol: '👤➕', category: 'People', description: 'Add user, invite' },
  { name: 'user-times', symbol: '👤✕', category: 'People', description: 'Remove user, delete' },
  { name: 'user-check', symbol: '👤✓', category: 'People', description: 'Verified user' },
  { name: 'user-secret', symbol: '🕵', category: 'People', description: 'Incognito, private' },
  { name: 'user-circle', symbol: '⭕👤', category: 'People', description: 'Profile avatar' },
  { name: 'user-graduate', symbol: '🎓', category: 'People', description: 'Education, student' },
  { name: 'baby', symbol: '👶', category: 'People', description: 'Child, infant' },
  { name: 'boy', symbol: '👦', category: 'People', description: 'Kid, young male' },
  { name: 'girl', symbol: '👧', category: 'People', description: 'Kid, young female' },
  { name: 'man', symbol: '👨', category: 'People', description: 'Adult male' },
  { name: 'woman', symbol: '👩', category: 'People', description: 'Adult female' },
  
  // Business
  { name: 'briefcase', symbol: '💼', category: 'Business', description: 'Work, business' },
  { name: 'handshake', symbol: '🤝', category: 'Business', description: 'Agreement, partnership' },
  { name: 'rocket', symbol: '🚀', category: 'Business', description: 'Launch, startup, growth' },
  { name: 'building', symbol: '🏢', category: 'Business', description: 'Company, office' },
  { name: 'industry', symbol: '🏭', category: 'Business', description: 'Factory, manufacturing' },
  { name: 'university', symbol: '🏫', category: 'Business', description: 'School, education' },
  { name: 'hospital', symbol: '🏥', category: 'Business', description: 'Medical, healthcare' },
  { name: 'bank', symbol: '🏦', category: 'Business', description: 'Finance, banking' },
  { name: 'store', symbol: '🏪', category: 'Business', description: 'Shop, retail, store' },
  { name: 'restaurant', symbol: '🍽', category: 'Business', description: 'Food, dining' },
  { name: 'hotel', symbol: '🏨', category: 'Business', description: 'Hotel, accommodation' },
  
  // Social Media
  { name: 'facebook', symbol: 'f', category: 'Social', description: 'Facebook' },
  { name: 'twitter', symbol: '𝕏', category: 'Social', description: 'Twitter/X' },
  { name: 'instagram', symbol: '📷', category: 'Social', description: 'Instagram' },
  { name: 'linkedin', symbol: 'in', category: 'Social', description: 'LinkedIn' },
  { name: 'youtube', symbol: '▶', category: 'Social', description: 'YouTube' },
  { name: 'github', symbol: '⚙', category: 'Social', description: 'GitHub' },
  { name: 'pinterest', symbol: 'P', category: 'Social', description: 'Pinterest' },
  { name: 'snapchat', symbol: '👻', category: 'Social', description: 'Snapchat' },
  { name: 'tiktok', symbol: '♪', category: 'Social', description: 'TikTok' },
  { name: 'whatsapp', symbol: '💬', category: 'Social', description: 'WhatsApp' },
  { name: 'telegram', symbol: '✈', category: 'Social', description: 'Telegram' },
  { name: 'slack', symbol: '#', category: 'Social', description: 'Slack' },
  { name: 'discord', symbol: '♦', category: 'Social', description: 'Discord' },
  
  // Medical
  { name: 'heartbeat', symbol: '💗', category: 'Medical', description: 'Health, heart, pulse' },
  { name: 'stethoscope', symbol: '🩺', category: 'Medical', description: 'Doctor, medical' },
  { name: 'prescription-bottle', symbol: '💊', category: 'Medical', description: 'Medicine, pills' },
  { name: 'pills', symbol: '💊', category: 'Medical', description: 'Medication, pharmacy' },
  { name: 'syringe', symbol: '💉', category: 'Medical', description: 'Injection, vaccine' },
  { name: 'flask', symbol: '⚗', category: 'Medical', description: 'Laboratory, science' },
  { name: 'dna', symbol: '🧬', category: 'Medical', description: 'Genetics, biology' },
  
  // Status
  { name: 'thumbs-up', symbol: '👍', category: 'Status', description: 'Like, approve, good' },
  { name: 'thumbs-down', symbol: '👎', category: 'Status', description: 'Dislike, bad' },
  { name: 'hand-paper', symbol: '✋', category: 'Status', description: 'Stop, wait, hand' },
  { name: 'hand-peace', symbol: '✌', category: 'Status', description: 'Peace, victory' },
  { name: 'hand-heart', symbol: '🤲', category: 'Status', description: 'Care, charity' },
  { name: 'clap', symbol: '👏', category: 'Status', description: 'Applause, congrats' },
  { name: 'frown', symbol: '☹', category: 'Status', description: 'Sad, unhappy' },
  { name: 'smile', symbol: '☺', category: 'Status', description: 'Happy, smile' },
  { name: 'meh', symbol: '😐', category: 'Status', description: 'Neutral, okay' },
  { name: 'laugh', symbol: '😄', category: 'Status', description: 'Funny, laugh' },
  { name: 'crying', symbol: '😭', category: 'Status', description: 'Sad, crying' },
  { name: 'surprised', symbol: '😲', category: 'Status', description: 'Shock, amazed' },
  { name: 'angry', symbol: '😠', category: 'Status', description: 'Angry, upset' },
  { name: 'confused', symbol: '😕', category: 'Status', description: 'Confused, unclear' },
  
  // Transport
  { name: 'car', symbol: '🚗', category: 'Transport', description: 'Vehicle, automobile' },
  { name: 'bicycle', symbol: '🚴', category: 'Transport', description: 'Bike, cycling' },
  { name: 'bus', symbol: '🚌', category: 'Transport', description: 'Public transport' },
  { name: 'train', symbol: '🚂', category: 'Transport', description: 'Railway, transit' },
  { name: 'plane', symbol: '✈', category: 'Transport', description: 'Flight, travel' },
  { name: 'ship', symbol: '⛴', category: 'Transport', description: 'Boat, cruise, shipping' },
  { name: 'taxi', symbol: '🚕', category: 'Transport', description: 'Cab, ride' },
  { name: 'motorcycle', symbol: '🏍', category: 'Transport', description: 'Motorbike, scooter' },
  { name: 'spacecraft', symbol: '🚀', category: 'Transport', description: 'Space, launch, spacecraft' },
  
  // Sports
  { name: 'futbol', symbol: '⚽', category: 'Sports', description: 'Soccer, football' },
  { name: 'basketball', symbol: '🏀', category: 'Sports', description: 'Basketball' },
  { name: 'baseball', symbol: '⚾', category: 'Sports', description: 'Baseball' },
  { name: 'tennis', symbol: '🎾', category: 'Sports', description: 'Tennis' },
  { name: 'volleyball', symbol: '🏐', category: 'Sports', description: 'Volleyball' },
  { name: 'golf', symbol: '⛳', category: 'Sports', description: 'Golf' },
  { name: 'hockey', symbol: '🏒', category: 'Sports', description: 'Ice hockey' },
  { name: 'trophy', symbol: '🏆', category: 'Sports', description: 'Award, winner, champion' },
  { name: 'medal', symbol: '🏅', category: 'Sports', description: 'Achievement, honor' },
  
  // Learning
  { name: 'book', symbol: '📖', category: 'Learning', description: 'Read, education' },
  { name: 'bookmark-alt', symbol: '🔖', category: 'Learning', description: 'Save page' },
  { name: 'pencil', symbol: '✏', category: 'Learning', description: 'Write, edit, draw' },
  { name: 'pen', symbol: '🖊', category: 'Learning', description: 'Write, sign' },
  { name: 'graduation-cap', symbol: '🎓', category: 'Learning', description: 'Education, degree' },
  { name: 'microscope', symbol: '🔬', category: 'Learning', description: 'Science, research' },
  { name: 'telescope', symbol: '🔭', category: 'Learning', description: 'Astronomy, explore' },
  { name: 'palette', symbol: '🎨', category: 'Learning', description: 'Art, design, color' },
  { name: 'music', symbol: '🎵', category: 'Learning', description: 'Audio, song' },
  { name: 'camera', symbol: '📷', category: 'Learning', description: 'Photography, photo' },
  { name: 'video-camera', symbol: '📹', category: 'Learning', description: 'Video, recording' },
  
  // Validation
  { name: 'certificate', symbol: '📜', category: 'Validation', description: 'Certificate, official' },
  { name: 'badge', symbol: '🏷', category: 'Validation', description: 'Badge, label' },
  { name: 'ribbon', symbol: '🎀', category: 'Validation', description: 'Award, ribbon' },
  { name: 'stamp', symbol: '🔖', category: 'Validation', description: 'Approve, verified' },
  { name: 'seal', symbol: '⭐', category: 'Validation', description: 'Certified, official' },
  { name: 'crown', symbol: '👑', category: 'Validation', description: 'Premium, exclusive' },
];

export default function FontAwesomeToPngPage() {
  const router = useRouter();
  const [selectedIcon, setSelectedIcon] = useState<typeof FONT_AWESOME_ICONS[0]>(FONT_AWESOME_ICONS[0]);
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [size, setSize] = useState(256);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [roundCorners, setRoundCorners] = useState(false);
  const [padding, setPadding] = useState(20);
  const previewRef = useRef<HTMLDivElement>(null);

  // Scroll to preview when category is selected
  useEffect(() => {
    if (selectedCategory && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(FONT_AWESOME_ICONS.map(icon => icon.category))).sort();
  }, []);

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    return FONT_AWESOME_ICONS.filter(icon => {
      const matchesSearch = 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || icon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleGenerateIcon = async () => {
    if (!selectedIcon) {
      setError('Please select an icon');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add rounded corners if enabled
      if (roundCorners) {
        const radius = 15;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.fill();
      }

      // Draw icon
      ctx.fillStyle = color;
      ctx.font = `bold ${size * 0.5}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedIcon.symbol, canvas.width / 2, canvas.height / 2);

      // Store canvas for format-agnostic downloads
      setResult(canvas);
    } catch (err) {
      setError((err as Error).message || 'Error generating icon');
    } finally {
      setProcessing(false);
    }
  };

  const downloadAsFormat = async (format: 'png' | 'svg' | 'jpg' | 'webp') => {
    if (!result) return;

    try {
      let blob: Blob;

      if (format === 'svg') {
        const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${size}" height="${size}" fill="${backgroundColor}" ${roundCorners ? `rx="15"` : ''}/>
          <text x="${size / 2}" y="${size / 2}" font-size="${size * 0.5}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="Arial, sans-serif">
            ${selectedIcon.symbol}
          </text>
        </svg>`;
        blob = new Blob([svgContent], { type: 'image/svg+xml' });
      } else {
        const mimeType =
          format === 'png' ? 'image/png' :
          format === 'jpg' ? 'image/jpeg' :
          'image/webp';

        blob = await new Promise<Blob>((resolve, reject) => {
          result.toBlob((generatedBlob) => {
            if (generatedBlob) resolve(generatedBlob);
            else reject(new Error('Unable to generate the icon image.'));
          }, mimeType, format === 'jpg' ? 0.95 : undefined);
        });
      }

      const outputName = `${selectedIcon.name}.${format}`;
      const downloadResult = await uploadBrowserDownloadResult({
        blob,
        toolSlug: 'font-awesome-to-png',
        originalName: outputName,
        outputName,
      });

      router.push(downloadResult.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(selectedIcon.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
        {/* Hero Header */}
        <div className="relative bg-orange-500 py-16 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={16} />
              <Link href="/all-tools" className="hover:text-white transition">All Tools</Link>
              <ChevronRight size={16} />
              <span>Font Awesome to PNG</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Download size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Font Awesome to PNG</h1>
                <p className="text-lg text-white/90">Convert 200+ Font Awesome icons to customizable PNG images with advanced styling options.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Icon Browser */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Icon Library</h3>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search icons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Categories</label>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                        selectedCategory === null
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All ({FONT_AWESOME_ICONS.length})
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition ${
                          selectedCategory === cat
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat} ({FONT_AWESOME_ICONS.filter(i => i.category === cat).length})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle - Preview & Settings */}
              <div className="lg:col-span-3 space-y-6" ref={previewRef}>
                {/* Icons Grid Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Select an Icon</h3>
                    <p className="text-sm font-medium text-gray-700">
                      ✓ <span className="text-orange-600 font-bold">{filteredIcons.length}</span> icons found
                    </p>
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {filteredIcons.map(icon => (
                      <button
                        key={icon.name}
                        onClick={() => setSelectedIcon(icon)}
                        className={`p-3 rounded-lg transition flex items-center justify-center text-3xl ${
                          selectedIcon.name === icon.name
                            ? 'bg-orange-100 border-2 border-orange-500 shadow-md'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        title={icon.name}
                      >
                        {icon.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icons Found Count */}
                <div className="px-2">
                  <p className="text-sm font-medium text-gray-700">Selected: <span className="text-orange-600 font-bold">{selectedIcon.name}</span> ({selectedIcon.category})</p>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Icon Preview & Customization</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Preview</label>
                      <div 
                        className={`flex items-center justify-center rounded-lg border-2 border-gray-200 transition-all ${roundCorners ? 'rounded-2xl' : ''}`}
                        style={{
                          width: '300px',
                          height: '300px',
                          backgroundColor: backgroundColor,
                        }}
                      >
                        <span
                          style={{
                            fontSize: `${Math.min(size * 0.5, 200)}px`,
                            color: color,
                          }}
                        >
                          {selectedIcon.symbol}
                        </span>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                      {/* Icon Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Selected Icon</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={selectedIcon.name}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                          />
                          <button
                            onClick={handleCopyName}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition flex items-center gap-2"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{selectedIcon.description}</p>
                      </div>

                      {/* Icon Color */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Icon Color</label>
                        <div className="flex gap-3 mb-3">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.startsWith('#') && (val.length === 7 || val.length === 4)) {
                                setColor(val);
                              }
                            }}
                            placeholder="#000000"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                        <p className="text-xs text-gray-500">Note: Color preview applies filter effect. Generated PNG will use solid color.</p>
                      </div>

                      {/* Background Color */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Background Color</label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-16 h-10 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* Size */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Size: <span className="text-orange-600 font-bold">{size}px</span>
                        </label>
                        <input
                          type="range"
                          min="64"
                          max="512"
                          step="16"
                          value={size}
                          onChange={(e) => setSize(parseInt(e.target.value))}
                          className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 128px - 512px</p>
                      </div>

                      {/* Rounded Corners */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="roundCorners"
                          checked={roundCorners}
                          onChange={(e) => setRoundCorners(e.target.checked)}
                          className="w-5 h-5 text-orange-500 rounded cursor-pointer"
                        />
                        <label htmlFor="roundCorners" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Rounded Corners
                        </label>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={handleGenerateIcon}
                        disabled={processing}
                        className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader size={20} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate PNG'
                        )}
                      </button>

                      {/* Download Format Buttons */}
                      {result && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 mb-2">Download Format:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => downloadAsFormat('png')}
                              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              PNG
                            </button>
                            <button
                              onClick={() => downloadAsFormat('svg')}
                              className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              SVG
                            </button>
                            <button
                              onClick={() => downloadAsFormat('jpg')}
                              className="py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              JPG
                            </button>
                            <button
                              onClick={() => downloadAsFormat('webp')}
                              className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Download size={16} />
                              WEBP
                            </button>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">200+ Icons</h4>
                        <p className="text-sm text-gray-600">Extensive collection organized by categories</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Custom Colors</h4>
                        <p className="text-sm text-gray-600">Full color picker support for icon and background</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Any Size</h4>
                        <p className="text-sm text-gray-600">Generate from 64px to 512px without quality loss</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Multi-Format Export</h4>
                        <p className="text-sm text-gray-600">Download as PNG, SVG, JPG, or WEBP formats</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Search & Filter</h4>
                        <p className="text-sm text-gray-600">Find icons quickly by name or category</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="text-orange-500 text-2xl">✓</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Rounded Corners</h4>
                        <p className="text-sm text-gray-600">Optional rounded corners for modern look</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Can I use these icons commercially?</h4>
                      <p className="text-sm text-gray-600">Yes! The generated PNG files are yours to use. Font Awesome icons are freely available for use in both personal and commercial projects.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What sizes should I use?</h4>
                      <p className="text-sm text-gray-600">For web: 16px-32px, for buttons: 24px-48px, for large graphics: 128px-512px. PNG format scales well at any size.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Can I edit the generated PNG?</h4>
                      <p className="text-sm text-gray-600">PNG files are raster images. For scalable editing, download as SVG or regenerate with different settings and re-export.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What if I need an icon not in the library?</h4>
                      <p className="text-sm text-gray-600">The library includes 200+ most popular Font Awesome icons. Visit fontawesome.com for the complete collection or check back for updates.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What formats are available for download?</h4>
                      <p className="text-sm text-gray-600 mb-2">We offer four download formats, each with specific advantages:</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li><strong>PNG:</strong> Universal raster format, supports transparency, best for web</li>
                        <li><strong>SVG:</strong> Scalable vector format, infinitely scalable, smallest file size, best for web graphics</li>
                        <li><strong>JPG:</strong> Compressed raster format, good for photos, smaller file sizes</li>
                        <li><strong>WEBP:</strong> Modern compressed format, smallest file sizes, excellent quality, best for performance-critical sites</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Can I customize the transparency?</h4>
                      <p className="text-sm text-gray-600">The current version generates solid colors. For transparency effects, you can edit the PNG/SVG in design tools like Photoshop, Illustrator, or use online editors.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}






