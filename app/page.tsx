'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, Image, Video, PenTool, Database, Code2, Volume2, Brackets,
  ArrowRight, Search, Menu, X, Zap, Lock, Smartphone, Sparkles,
  BarChart3, CheckCircle, ChevronRight, ArrowUpRight, Eraser, Combine,
  FileImage, Mountain, Wand2, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiEditingTools, converterTools, aiWriteTools, videoTools } from './data/tools';
import { HomeHeader } from './components/HomeHeader';
import { SearchBox } from './components/SearchBox';
import { Footer } from './components/Footer';

export default function Home() {
  const router = useRouter();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      icon: Image,
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
      count: '44+',
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
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Converts most files in seconds without software installation'
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
      link: '/all-tools/remove-background'
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one',
      icon: Combine,
      category: 'PDF',
      color: 'from-purple-500 to-purple-600',
      link: '/all-tools/pdf-tools'
    },
    {
      title: 'Compress Image',
      description: 'Reduce image file size without quality loss',
      icon: Zap,
      category: 'Image', 
      color: 'from-orange-500 to-orange-600',
      link: '/all-tools/compress-image'
    },
    {
      title: 'JPG to PNG',
      description: 'Convert JPG images to PNG format',
      icon: FileImage,
      category: 'Image',
      color: 'from-orange-500 to-orange-600',
      link: '/all-tools/jpg-to-png'
    },
    {
      title: 'Upscale Image',
      description: 'Enhance and enlarge images without quality loss',
      icon: Mountain,
      category: 'Image',
      color: 'from-orange-500 to-orange-600',
      link: '/all-tools/upscale-image'
    },
    {
      title: 'AI Image Generator',
      description: 'Generate images from text descriptions',
      icon: Wand2,
      category: 'AI',
      color: 'from-blue-500 to-blue-600',
      link: '/all-tools/ai-image-generator'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size easily',
      icon: FileText,
      category: 'PDF',
      color: 'from-purple-500 to-purple-600',
      link: '/all-tools/pdf-tools'
    },
    {
      title: 'AI Writing Tools',
      description: 'AI-powered writing and content creation',
      icon: PenTool,
      category: 'AI',
      color: 'from-blue-500 to-blue-600',
      link: '/all-tools/ai-tools'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />

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
                Free Online Tools to Convert, Edit & Optimize<br />
                <motion.span
                  className="relative inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="absolute -inset-3 bg-orange-500/20 rounded-lg blur-lg opacity-50" />
                  <span className="relative text-orange-500 font-bold">
                    Your Files in Seconds
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
                <div className="relative group mb-4 max-w-2xl">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <div className="relative">
                    <SearchBox
                      placeholder="Search tools... (e.g., Remove background, Merge PDF)"
                      onSearch={(query) => router.push(`/all-tools?search=${encodeURIComponent(query)}`)}
                      variant="hero"
                      showSuggestions={true}
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
                      onClick={() => router.push(`/all-tools?search=${encodeURIComponent(tag)}`)}
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
                <Link href="/all-tools" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 transition-all">
                  View All Tools
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
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
                title: 'Choose Tool',
                description: 'Select the tool or conversion you want to apply to your file',
                icon: Wand2
              },
              {
                step: 2,
                title: 'Upload File',
                description: 'Choose and upload your file from your device or drag and drop',
                icon: Package
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
              Trusted by users for fast, secure file conversion and editing
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

      {/* SEO CONTENT SECTION - What is SimplifyConvert */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              What are Free Online Tools?
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                <strong>SimplifyConvert</strong> is a comprehensive platform offering <strong>200+ free online tools</strong> for file conversion, image editing, video processing, PDF manipulation, and AI-powered content creation. Our free online tools eliminate the need for expensive software installations, subscriptions, or technical expertise. Whether you need to convert images, compress videos, merge PDFs, or generate AI content, SimplifyConvert provides instant solutions directly in your browser.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Why Choose Our Free Online Tools?
              </h3>
              
              <p>
                Users worldwide trust SimplifyConvert because our free online conversion tools are:
              </p>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>Completely Free:</strong> All 200+ tools are permanently free with no hidden costs, premium tiers, or surprise fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>No Installation Required:</strong> Works directly in your browser on Windows, Mac, iOS, and Android</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>Fast Processing:</strong> Converts most files in seconds directly in your browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>Privacy Focused:</strong> Files are processed securely and automatically deleted after processing. We do not store your files</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>No Signup:</strong> Start using our free online tools immediately without creating an account</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Popular Free Online Tool Categories
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">📸 Image Tools</h4>
                  <p className="text-sm text-gray-600">Convert JPG to PNG, compress images, remove backgrounds, upscale images, and apply filters with our free image converter tools.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">📄 PDF Tools</h4>
                  <p className="text-sm text-gray-600">Merge, compress, split, and convert PDFs with our free PDF tools. Extract text, edit content, and secure documents instantly.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">🎬 Video Tools</h4>
                  <p className="text-sm text-gray-600">Convert, compress, and edit videos in any format. Trim clips, adjust resolution, and create stunning content with our free video tools.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">🤖 AI Tools</h4>
                  <p className="text-sm text-gray-600">Generate images, write content, and create with AI. Use our free AI tools for writing, coding, and content generation.</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                How Our Free Online Tools Work
              </h3>

              <p>
                Using SimplifyConvert's free online tools is simple and straightforward. Just select your desired tool, upload your file, and click convert. No complicated settings, no learning curve. Our platform handles complex processing in the background while you get instant results. Whether you're converting a single file or working with batch operations, our free online tools make file conversion, editing, and optimization accessible to everyone.
              </p>

              <p>
                With 200+ free online tools covering every conversion need, SimplifyConvert is your one-stop platform for all file transformation tasks. Start using our free online conversion tools today—no signup, no credit card, completely free forever.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about SimplifyConvert and our free online tools
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {[
              {
                question: "Are all SimplifyConvert tools really free?",
                answer: "Yes! All 200+ free online tools at SimplifyConvert are completely free forever. No hidden costs, premium tiers, or surprise fees. You can use any tool unlimited times without signup or payment."
              },
              {
                question: "Do I need to install software to use these free online tools?",
                answer: "No! Our free online tools work directly in your web browser. No installation, downloads, or software setup required. Works on Windows, Mac, Linux, iPhone, iPad, and Android devices."
              },
              {
                question: "Is my data safe when using SimplifyConvert free online tools?",
                answer: "Yes, your privacy is our top priority. Files are processed securely and automatically deleted after processing. We do not store your files. We use HTTPS encryption and follow strict data protection standards."
              },
              {
                question: "Do I need to create an account to use the free online tools?",
                answer: "No signup required! You can start using any of our 200+ free online tools immediately without creating an account, providing an email, or any registration."
              },
              {
                question: "Which free online tools are most popular?",
                answer: "Our most-used free online tools include: JPG to PNG converter, PDF merger, image compressor, video converter, background remover, and AI image generator. Users love these tools for their speed and simplicity."
              },
              {
                question: "Can I use SimplifyConvert free online tools on mobile?",
                answer: "Absolutely! Our free online tools are fully responsive and work perfectly on smartphones and tablets. Use any tool with the same features and speed as on desktop."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-500 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between p-6 bg-gray-50 group-open:bg-orange-50 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-6 bg-white text-gray-700 leading-relaxed border-t border-gray-200">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Schema - Note: FAQ schema will be added via next/script in layout.tsx for client components */}
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}



