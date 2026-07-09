'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { 
  FileText, Image as ImageIcon, Video, PenTool, Database, Code2, Volume2,
  Search, Menu, X, ChevronRight, Sparkles, TrendingUp, FileCheck, Download, AlertCircle, ChevronDown, LogOut, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HomeHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      count: '55+',
      link: '/all-tools/pdf',
      glowColor: 'group-hover:shadow-purple-500/20'
    },
    {
      id: 'image',
      title: 'Image Tools',
      description: 'Edit, convert, enhance, and optimize images',
      icon: ImageIcon,
      color: 'from-orange-500 via-orange-600 to-orange-700',
      bgColor: 'bg-orange-50',
      count: '79',
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
      count: '58',
      link: '/all-tools/video-tools',
      glowColor: 'group-hover:shadow-pink-500/20'
    },
    {
      id: 'ai',
      title: 'AI Writing Tools',
      description: 'AI-powered writing, generation, and content creation',
      icon: PenTool,
      color: 'from-blue-500 via-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      count: '60+',
      link: '/all-tools/ai-tools',
      glowColor: 'group-hover:shadow-blue-500/20'
    },
    {
      id: 'data-conversion',
      title: 'Data Tools',
      description: 'Convert between CSV, JSON, Excel, and XML formats',
      icon: Database,
      color: 'from-teal-500 via-teal-600 to-teal-700',
      bgColor: 'bg-teal-50',
      count: '12',
      link: '/all-tools/data',
      glowColor: 'group-hover:shadow-teal-500/20'
    },
    {
      id: 'code',
      title: 'Code Tools',
      description: 'Format, minify, validate, and generate code',
      icon: Code2,
      color: 'from-green-500 via-green-600 to-green-700',
      bgColor: 'bg-green-50',
      count: '49',
      link: '/all-tools/code-tools',
      glowColor: 'group-hover:shadow-green-500/20'
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      description: 'Convert text to natural-sounding audio',
      icon: Volume2,
      color: 'from-indigo-500 via-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50',
      count: 'Voice',
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
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-linear-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertCircle size={20} className="text-orange-500 shrink-0" />
              <p className="text-sm text-gray-700 text-center md:text-left">
                We're currently improving some features. If you notice any issues, please report them - we appreciate your feedback!
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-2xl text-gray-900 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/40 p-1">
              <Image 
                src="/Logo-icon.gif" 
                alt="SimplifyConvert free online tools logo" 
                width={20} 
                height={20}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden text-lg min-[430px]:inline sm:text-2xl">SimplifyConvert</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-7 min-w-0">
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
              AI Writing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/all-tools/data"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
            >
              Data Tools
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* Search & CTA */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/all-tools"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label="Search tools"
              title="Search tools"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/ai-studio"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-slate-950 via-blue-700 to-cyan-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Sparkles size={15} className="shrink-0" />
              AI Studio
              <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white min-[390px]:inline">
                Premium
              </span>
            </Link>

            {/* Auth Section */}
            {session?.user ? (
              // Logged In - User Dropdown
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-orange-500 rounded-full hover:bg-orange-50 transition-colors"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || ''} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{session.user.name || session.user.email}</span>
                  <ChevronDown size={16} />
                </motion.button>

                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
                  >
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/account');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                    >
                      <Settings size={16} /> Account
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              // Not Logged In - Auth Buttons
              <div className="hidden sm:flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}

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
              <Link href="/all-tools/pdf" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                PDF
              </Link>
              <Link href="/all-tools/image-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Image
              </Link>
              <Link href="/all-tools/video-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Video
              </Link>
              <Link href="/all-tools/ai-tools" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                AI Writing
              </Link>
              <Link href="/all-tools/data" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Data Tools
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

              {/* Mobile Auth Buttons */}
              {session?.user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/account');
                    }}
                    className="w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Account
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded text-center hover:border-orange-500 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded text-center hover:bg-orange-600 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}

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


