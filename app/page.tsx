'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  FileText, Image, Video, PenTool, Database, Code2, Volume2, Brackets,
  ArrowRight, Search, Menu, X, Zap, Lock, Smartphone, Sparkles,
  BarChart3, CheckCircle, ChevronRight, ArrowUpRight, Eraser, Combine,
  FileImage, Mountain, Wand2, Package, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiEditingTools, converterTools, aiWriteTools, videoTools } from './data/tools';
import { SignInModal } from './components/SignInModal';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/tools?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch((e.target as HTMLInputElement).value);
    }
  };

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
      count: '47+',
      link: '/tools/pdf',
      glowColor: 'group-hover:shadow-purple-500/20'
    },
    {
      id: 'image',
      title: 'Image Tools',
      description: 'Edit, convert, enhance, and optimize images',
      icon: Image,
      color: 'from-orange-500 via-orange-600 to-orange-700',
      bgColor: 'bg-orange-50',
      count: '30+',
      link: '/tools?category=Image',
      glowColor: 'group-hover:shadow-orange-500/20'
    },
    {
      id: 'video',
      title: 'Video Tools',
      description: 'Convert, merge, compress, and edit videos',
      icon: Video,
      color: 'from-pink-500 via-pink-600 to-pink-700',
      bgColor: 'bg-pink-50',
      count: '10+',
      link: '/tools?category=video',
      glowColor: 'group-hover:shadow-pink-500/20'
    },
    {
      id: 'ai',
      title: 'AI Write',
      description: 'AI-powered writing, generation, and content creation',
      icon: PenTool,
      color: 'from-blue-500 via-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      count: '50+',
      link: '/tools/ai-write',
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
      link: '/tools/data',
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
      link: '/tools/code',
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
      link: '/tools/text-to-speech',
      glowColor: 'group-hover:shadow-indigo-500/20'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Powerful processing that works instantly without lag'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your files are secure. We never store or share your data'
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Works perfectly on desktop, tablet, and mobile devices'
    },
    {
      icon: CheckCircle,
      title: 'No Installation',
      description: 'Use directly in your browser, no software required'
    },
    {
      icon: BarChart3,
      title: '200+ Tools',
      description: 'Complete solution for all your conversion needs'
    },
    {
      icon: Sparkles,
      title: 'Always Free',
      description: 'All tools are completely free forever'
    }
  ];

  const popularTools = [...aiEditingTools, ...converterTools, ...aiWriteTools, ...videoTools];

  const getToolsByCategory = (cat: string) => {
    const filtered = popularTools.filter(tool => {
      if (cat === 'all') return true;
      const category = tool.category?.toLowerCase() || '';
      const title = tool.title?.toLowerCase() || '';
      const catLower = cat.toLowerCase();
      
      // Check both category and title
      return category.includes(catLower) || title.includes(catLower);
    });
    return filtered.slice(0, 12);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity }
    }
  };

  // Popular actions/tools that users commonly use
  const popularActions = [
    {
      title: 'Remove Background',
      description: 'Remove image backgrounds automatically',
      icon: Eraser,
      category: 'Image',
      color: 'from-orange-500 to-orange-600',
      link: '/tools/remove-background'
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one',
      icon: Combine,
      category: 'PDF',
      color: 'from-purple-500 to-purple-600',
      link: '/tools/pdf'
    },
    {
      title: 'Compress Image',
      description: 'Reduce image file size without quality loss',
      icon: Zap,
      category: 'Image', 
      color: 'from-orange-500 to-orange-600',
      link: '/tools/compress-image'
    },
    {
      title: 'JPG to PNG',
      description: 'Convert JPG images to PNG format',
      icon: FileImage,
      category: 'Image',
      color: 'from-orange-500 to-orange-600',
      link: '/tools/bmp-to-png'
    },
    {
      title: 'Upscale Image',
      description: 'Enhance and enlarge images without quality loss',
      icon: Mountain,
      category: 'Image',
      color: 'from-orange-500 to-orange-600',
      link: '/tools/upscale-image'
    },
    {
      title: 'AI Image Generator',
      description: 'Generate images from text descriptions',
      icon: Wand2,
      category: 'AI',
      color: 'from-blue-500 to-blue-600',
      link: '/tools/ai-image-generator'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size easily',
      icon: FileText,
      category: 'PDF',
      color: 'from-purple-500 to-purple-600',
      link: '/tools/pdf'
    },
    {
      title: 'AI Write',
      description: 'AI-powered writing and content creation',
      icon: PenTool,
      category: 'AI',
      color: 'from-blue-500 to-blue-600',
      link: '/tools/ai-write'
    }
  ];

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* NAVBAR */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isHeaderScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
            : 'bg-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
              SC
            </div>
            <span className="hidden sm:inline">SimplifyConvert</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* All Tools Dropdown */}
            <div className="relative group pb-2">
              <motion.a 
                href="/#categories"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative flex items-center gap-1 py-2 px-1"
                whileHover={{ y: -2 }}
              >
                All Tools
                <ChevronRight size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </motion.a>

              {/* Dropdown Menu */}
              <div
                className="absolute left-0 top-full w-80 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-4 pointer-events-none group-hover:pointer-events-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} href={cat.link}>
                        <motion.div
                          className="p-3 rounded-lg border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group/item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className={`flex items-center gap-2 mb-2`}>
                            <div className={`p-1.5 bg-linear-to-br ${cat.color} rounded-md shrink-0`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-900 group-hover/item:text-orange-600 transition whitespace-nowrap overflow-hidden text-ellipsis">{cat.title}</p>
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
            {['Image', 'Video', 'AI Write', 'Data'].map((item) => (
              <motion.a 
                key={item} 
                href="#" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition relative group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          {/* Search & CTA */}
          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              searchActive ? 'bg-orange-50 border border-orange-200 shadow-lg shadow-orange-500/10' : 'bg-gray-50 border border-gray-200'
            }`}>
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                className="bg-transparent outline-none text-sm w-32 text-gray-900 placeholder-gray-400"
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>

            {session?.user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/tools"
                    className="hidden sm:inline-block px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all"
                  >
                    Explore Tools
                  </Link>
                </motion.div>
                
                <motion.button
                  onClick={() => setSignInModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {session.user.name?.split(' ')[0]}
                  </span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/tools"
                    className="hidden sm:inline-block px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all"
                  >
                    Browse Tools
                  </Link>
                </motion.div>

                <motion.button
                  onClick={() => setSignInModalOpen(true)}
                  className="hidden sm:inline-block px-6 py-2 border-2 border-orange-500 text-orange-600 font-medium rounded-full hover:bg-orange-50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </>
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
              {['PDF', 'Image', 'Video', 'AI Write', 'Data', 'Code'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  {item}
                </a>
              ))}
              <Link href="/tools" className="px-4 py-2 bg-orange-500 text-white font-medium rounded-full text-center hover:bg-orange-600 transition-all">
                Browse Tools
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* TAG LINE */}
      <section className="px-4 md:px-8 py-3 bg-orange-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            className="text-sm md:text-base font-semibold text-indigo-700 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={16} />
            Convert Files • Edit Images • Process Videos • AI Tools
            <Sparkles size={16} />
          </motion.p>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="relative px-4 md:px-8 py-16 md:py-28 overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <motion.div
          className="absolute top-10 left-5 w-80 h-80 bg-gradient-to-br from-indigo-400 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, 60, -40, 0], y: [0, 40, -60, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-5 w-80 h-80 bg-gradient-to-br from-purple-400 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, -60, 40, 0], y: [0, -40, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-pink-300 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{ x: [0, 30, -50, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE - TEXT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Convert, Edit, and Optimize<br />
                <motion.span
                  className="relative inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="absolute -inset-3 bg-orange-500/20 rounded-lg blur-lg opacity-50" />
                  <span className="relative text-orange-500 font-bold">
                    Files in Seconds
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Free online tools for PDF, Image, Video, AI writing, and more. No signup required.
              </motion.p>

              {/* Search Bar with Suggestions */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="relative group mb-4">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <div className="relative flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-lg border border-gray-200">
                    <Search size={20} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tools... (e.g., Remove background, Merge PDF)"
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                    />
                  </div>
                </div>
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {['Remove background', 'Merge PDF', 'Convert JPG to PNG', 'Compress video'].map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(tag)}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              </motion.div>

              {/* Stats with Counter Animation */}
              <motion.div
                className="grid grid-cols-3 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: '200', suffix: '+', value: 'Tools' },
                  { label: '7', suffix: '', value: 'Categories' },
                  { label: '100', suffix: '%', value: 'Free' }
                ].map((stat) => (
                  <motion.div key={stat.value} className="text-center group" variants={itemVariants}>
                    <div className="text-2xl md:text-3xl font-bold text-orange-500">
                      {stat.label}
                      <span className="text-lg md:text-xl">{stat.suffix}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 group-hover:text-gray-900 transition">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE - CATEGORIES */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <motion.div
                className="grid grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {categories.slice(0, 6).map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div key={cat.id} variants={itemVariants}>
                      <Link href={cat.link}>
                        <motion.div
                          className={`group h-full rounded-xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-all overflow-hidden`}
                          whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-4 space-y-3 h-full flex flex-col justify-between">
                            <div>
                              <div className={`p-2.5 bg-gradient-to-br ${cat.color} rounded-lg group-hover:shadow-lg transition-all w-fit mb-2`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm leading-tight">{cat.title}</h4>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100">
                                <span className={`bg-gradient-to-r ${cat.color} bg-clip-text text-transparent font-bold`}>
                                  {cat.count}
                                </span>
                              </span>
                              <motion.div
                                animate={{ x: 0 }}
                                whileHover={{ x: 2 }}
                              >
                                <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              {/* View All Categories Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-6 text-center"
              >
                <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all">
                  View All Categories
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POPULAR ACTIONS SECTION - THE MOST IMPORTANT */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Popular Actions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most common tasks users perform. Start with what you need.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {popularActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link href={action.link}>
                    <motion.div
                      className="group h-full p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-transparent hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -12, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`inline-flex p-3 mb-4 bg-gradient-to-br ${action.color} rounded-xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {action.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {action.category}
                        </span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600 transition" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CATEGORY CARDS SECTION */}
      <section id="categories" className="px-4 md:px-8 py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-lg text-gray-600">
              Browse tools by category and discover everything we offer
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.id} variants={itemVariants}>
                  <Link href={cat.link}>
                    <motion.div 
                      className={`group h-full rounded-2xl border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 hover:shadow-2xl transition-all overflow-hidden`}
                      whileHover={{ scale: 1.06, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 h-full space-y-4 group-hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 bg-gradient-to-br ${cat.color} rounded-xl group-hover:shadow-lg transition-all`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <motion.div
                            className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-red-100 text-red-600"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            Recent
                          </motion.div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">{cat.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">Explore your {cat.title.toLowerCase()}</p>
                        </div>
                        <motion.div
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-100"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className={`bg-gradient-to-r ${cat.color} bg-clip-text text-transparent font-bold`}>
                            {cat.count} tools
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to convert, edit, and optimize your files
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                step: 1,
                title: 'Upload File',
                description: 'Choose and upload your file from your device or drag and drop',
                icon: Package
              },
              {
                step: 2,
                title: 'Choose Tool',
                description: 'Select the tool or conversion you want to apply to your file',
                icon: Wand2
              },
              {
                step: 3,
                title: 'Download Result',
                description: 'Your processed file is ready to download instantly',
                icon: ArrowUpRight
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="relative"
              >
                <div className="flex flex-col items-center text-center group">
                  {/* Step Circle */}
                  <motion.div
                    className="relative mb-6 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition duration-300 blur-xl" />
                    <div className="relative w-full h-full flex items-center justify-center bg-white rounded-full border-2 border-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 shadow-lg group-hover:shadow-xl transition">
                      <div className="text-center">
                        <div className="text-sm font-bold text-gray-600 mb-1">Step</div>
                        <div className="text-2xl md:text-3xl font-bold text-orange-500">
                          {item.step}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                  )}

                  {/* Icon */}
                  <motion.div
                    className="p-4 bg-white rounded-2xl mb-6 shadow-md group-hover:shadow-xl transition inline-flex"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <item.icon className="w-8 h-8 text-purple-600" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ENHANCED STATS SECTION */}
      <section className="px-4 md:px-8 py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: '📥', label: 'Files Processed', value: '2.5M', suffix: '+' },
              { icon: '⚡', label: 'Conversions', value: '10M', suffix: '+' },
              { icon: '🛠️', label: 'Online Tools', value: '200', suffix: '+' },
              { icon: '✨', label: 'Premium Users', value: '50k', suffix: '+' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center group"
              >
                <motion.div
                  className="text-5xl mb-3 inline-block group-hover:scale-125 transition-transform"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {stat.value}
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* POPULAR TOOLS SHOWCASE */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Popular Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with the most-used tools that thousands of users love
            </p>
          </motion.div>

          {/* Enhanced Filter Tabs */}
          <motion.div
            className="flex flex-wrap gap-2 mb-12 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {['all', 'Image', 'PDF', 'Video', 'AI Write'].map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all relative overflow-hidden ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 hover:bg-orange-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 font-semibold">
                  {cat === 'all' ? 'All Tools' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {/* Tools Grid */}
          <motion.div
            key={selectedCategory}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {getToolsByCategory(selectedCategory).map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.id} variants={itemVariants}>
                  <Link href={tool.route || '#'}>
                    <motion.div 
                      className="h-full rounded-2xl bg-white border border-gray-200 p-6 hover:border-gray-300 transition-all group relative overflow-hidden"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Hover Glow Background */}
                      <motion.div
                        className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div 
                            className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition"
                            whileHover={{ scale: 1.2, rotate: 12 }}
                          >
                            <Icon className="w-6 h-6 text-indigo-600" />
                          </motion.div>
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-purple-100 group-hover:text-purple-700 transition">
                            {tool.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">{tool.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tool.description}</p>
                        <motion.div 
                          className="flex items-center gap-1 text-purple-600 font-medium text-sm"
                          whileHover={{ gap: 8 }}
                        >
                          Use tool <motion.div whileHover={{ x: 2 }}><ArrowRight size={16} /></motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Why Choose SimplifyConvert?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most trusted platform for file conversion and editing with millions of happy users worldwide
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <motion.div 
                    className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 h-full transition-all group relative overflow-hidden"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative z-10">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:from-indigo-200 group-hover:to-purple-200 transition"
                        whileHover={{ scale: 1.15, rotate: 12 }}
                      >
                        <Icon className="w-7 h-7 text-indigo-600" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">{feature.title}</h3>
                      <p className="text-gray-600 group-hover:text-gray-700 transition">{feature.description}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* PREMIUM UPGRADE SECTION */}
      <section className="relative px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-orange-500 opacity-95\"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{ x: [0, 50, -30, 0], y: [0, -50, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Get More with Premium
              </motion.h2>
              <motion.p
                className="text-lg text-white/90 mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Take your productivity to the next level with unlimited usage, priority processing, and advanced features.
              </motion.p>

              {/* Benefits List */}
              <motion.div
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {[
                  { icon: '🚀', text: 'Unlimited file uploads and downloads' },
                  { icon: '⚡', text: 'Faster processing priority' },
                  { icon: '🔒', text: 'Advanced privacy controls' },
                  { icon: '✨', text: 'Access to beta features' }
                ].map((benefit, idx) => (
                  <motion.div
                    key={benefit.text}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                    <span className="text-white font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:shadow-2xl hover:shadow-white/40 transition-all flex items-center justify-center gap-2 group">
                  Get Started
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} />
                  </motion.span>
                </button>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-96 hidden lg:block"
            >
              <motion.div
                className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 p-8 flex items-center justify-center"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ⭐
                  </motion.div>
                  <p className="text-white font-bold text-lg">Upgrade Your Experience</p>
                  <p className="text-white/70 text-sm mt-2">Join premium users and unlock full potential</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-300 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/40">
                  SC
                </div>
                <span>SimplifyConvert</span>
              </div>
              <p className="text-sm text-gray-400">
                Free online tools for PDF, Image, Video, AI Write, Data, Code, and Text to Speech conversion.
              </p>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {['PDF Tools', 'Image Tools', 'Video Tools', 'AI Write', 'Code Tools'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Tools */}
            <div>
              <h4 className="font-semibold text-white mb-4">Popular</h4>
              <ul className="space-y-2 text-sm">
                {['PDF to JPG', 'Remove BG', 'Compress Image', 'JSON Formatter', 'CSV to Excel'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'About', href: '/about' },
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/tos' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Blog', href: '/blog' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-400">
              © 2026 SimplifyConvert. All rights reserved. All tools are free and work in your browser.
            </p>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <SignInModal isOpen={signInModalOpen} onClose={() => setSignInModalOpen(false)} />
    </main>
  );
}
