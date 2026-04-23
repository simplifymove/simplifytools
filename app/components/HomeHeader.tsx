'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FileText, Image as ImageIcon, Video, PenTool, Database, Code2, Volume2,
  Search, Menu, X, ChevronRight, Sparkles, TrendingUp, FileCheck, Download, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchBox } from './SearchBox';

export function HomeHeader() {
  const router = useRouter();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    {
      id: 'pdf',
      title: 'PDF Tools',
      description: 'Convert, merge, compress, and edit PDFs',
      icon: FileText,
      color: 'from-purple-500 via-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      count: '54+',
      link: '/all-tools/pdf-tools',
      glowColor: 'group-hover:shadow-purple-500/20'
    },
    {
      id: 'image',
      title: 'Image Tools',
      description: 'Edit, convert, enhance, and optimize images',
      icon: ImageIcon,
      color: 'from-orange-500 via-orange-600 to-orange-700',
      bgColor: 'bg-orange-50',
      count: '80+',
      link: '/all-tools/image-tools',
      glowColor: 'group-hover:shadow-orange-500/20'
    },
    {
      id: 'video',
      title: 'Video Tools',
      description: 'Convert, merge, compress, and edit videos',
      icon: Video,
      color: 'from-pink-500 via-pink-600 to-pink-700',
      bgColor: 'bg-pink-50',
      count: '58+',
      link: '/all-tools/video-tools',
      glowColor: 'group-hover:shadow-pink-500/20'
    },
    {
      id: 'ai',
      title: 'AI Write',
      description: 'AI-powered writing, generation, and content creation',
      icon: PenTool,
      color: 'from-blue-500 via-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      count: '60+',
      link: '/all-tools/ai-tools',
      glowColor: 'group-hover:shadow-blue-500/20'
    },
    {
      id: 'data',
      title: 'Data Conversion',
      description: 'Convert and transform data formats easily',
      icon: Database,
      color: 'from-teal-500 via-teal-600 to-teal-700',
      bgColor: 'bg-teal-50',
      count: '12',
      link: '/all-tools/data-converter',
      glowColor: 'group-hover:shadow-teal-500/20'
    },
    {
      id: 'code',
      title: 'Code Tools',
      description: 'Format, minify, validate, and generate code',
      icon: Code2,
      color: 'from-green-500 via-green-600 to-green-700',
      bgColor: 'bg-green-50',
      count: '44',
      link: '/all-tools/code',
      glowColor: 'group-hover:shadow-green-500/20'
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      description: 'Convert text to natural-sounding audio',
      icon: Volume2,
      color: 'from-indigo-500 via-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50',
      count: 'Multi',
      link: '/all-tools/text-to-speech',
      glowColor: 'group-hover:shadow-indigo-500/20'
    },
    {
      id: 'financial-calculators',
      title: 'Financial Calculators',
      description: 'Advanced financial planning and analysis tools',
      icon: TrendingUp,
      color: 'from-emerald-500 via-emerald-600 to-emerald-700',
      bgColor: 'bg-emerald-50',
      count: '4',
      link: '/all-tools/financial-calculators',
      glowColor: 'group-hover:shadow-emerald-500/20'
    },
    {
      id: 'resume-maker',
      title: 'Resume Maker',
      description: 'AI-powered resume builder with job matching and ATS optimization',
      icon: FileCheck,
      color: 'from-blue-500 via-cyan-600 to-teal-700',
      bgColor: 'bg-blue-50',
      count: '1',
      link: '/all-tools/resume-maker/job-match',
      glowColor: 'group-hover:shadow-blue-500/20'
    },
    {
      id: 'downloader',
      title: 'Save From Online',
      description: 'Download any file from any URL - videos, images, PDFs, and more',
      icon: Download,
      color: 'from-green-500 via-emerald-600 to-green-700',
      bgColor: 'bg-green-50',
      count: 'Universal',
      link: '/all-tools/save-from-online',
      glowColor: 'group-hover:shadow-green-500/20'
    }
  ];

  return (
    <>
      {/* TOP NOTIFICATION BAR */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-linear-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertCircle size={20} className="text-orange-500 shrink-0" />
              <p className="text-sm text-gray-700 text-center md:text-left">
                🚧 We're currently improving some features. If you notice any issues, please report them—we appreciate your feedback!
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="shrink-0 p-1 hover:bg-white/50 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </motion.div>
      )}

      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isHeaderScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/40 p-1">
              <Image 
                src="/Logo-icon.gif" 
                alt="Logo" 
                width={20} 
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline">SimplifyConvert</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* All Tools Dropdown */}
            <div className="relative group">
              <Link 
                href="/all-tools"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative flex items-center gap-1 py-2 px-1"
              >
                All Tools
                <ChevronRight size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>

              {/* Dropdown Menu */}
              <div
                className="absolute left-0 top-full min-w-max bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6 pointer-events-none group-hover:pointer-events-auto"
              >
                <div className="grid grid-cols-5 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} href={cat.link}>
                        <motion.div
                          className="p-3 rounded-lg border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group/item w-40"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`flex items-center gap-2 mb-2`}>
                            <div className={`p-1.5 bg-linear-to-br ${cat.color} rounded-md shrink-0`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-900 group-hover/item:text-orange-600 transition">{cat.title}</p>
                          </div>
                          <p className="text-xs text-gray-500">{cat.count} tools</p>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Other Navigation Items */}
            <Link 
              href="/all-tools/image-tools"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
            >
              Image
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/all-tools/video-tools"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
            >
              Video
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/all-tools/ai-tools"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
            >
              AI Write
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/all-tools/data-converter"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
            >
              Data
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* Search & CTA */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center w-64">
              <SearchBox
                placeholder="Search tools..."
                onSearch={(query) => router.push(`/all-tools?search=${encodeURIComponent(query)}`)}
                variant="header"
                showSuggestions={true}
                limit={8}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/all-tools"
                className="hidden sm:inline-block px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all"
              >
                Browse Tools
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-gray-200 bg-white px-4 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex flex-col gap-4">
              <Link href="/all-tools/pdf-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                PDF
              </Link>
              <Link href="/all-tools/image-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Image
              </Link>
              <Link href="/all-tools/video-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Video
              </Link>
              <Link href="/all-tools/ai-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                AI Write
              </Link>
              <Link href="/all-tools/data-converter" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Data
              </Link>
              <Link href="/all-tools/code-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Code
              </Link>
              <Link href="/all-tools/text-to-speech" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Text to Speech
              </Link>
              <Link href="/all-tools/financial-calculators" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Financial Calculators
              </Link>
              <Link href="/all-tools/resume-maker/job-match" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Resume Maker
              </Link>
              <Link href="/all-tools" className="px-4 py-2 bg-orange-500 text-white font-medium rounded-full text-center hover:bg-orange-600 transition-all">
                Browse Tools
              </Link>
            </div>
          </motion.div>
        )}
      </header>

    </>
  );
}



