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
import { getBestSearchResult } from './lib/search-index';

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
      count: '55',
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
      count: '100+',
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
      count: '50+',
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
      count: '40+',
      link: '/all-tools/ai-tools',
      glowColor: 'group-hover:shadow-blue-500/20'
    },
    {
      id: 'data',
      title: 'Data Tools',
      description: 'Convert and transform data formats easily',
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
      description: 'Some tools process files in your browser, while others use temporary server processing'
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
      title: '200+ Utility Tools',
      description: 'A broad collection for common conversion and editing tasks'
    },
    {
      icon: Sparkles,
      title: 'Free Utility Tools',
      description: 'Utility tools are free to use; Premium AI Studio is a separate credit-based service'
    }
  ];

  const popularTools = [...aiEditingTools, ...converterTools, ...aiWriteTools, ...videoTools];

  const homepageFaqs = [
    {
      question: "Which SimplifyConvert tools are free?",
      answer: "Our 200+ utility tools are free to use. Premium AI Studio is separate and uses purchased credits."
    },
    {
      question: "Do I need to install software to use these free online tools?",
      answer: "No! Our free online tools work directly in your web browser. No installation, downloads, or software setup required. Works on Windows, Mac, Linux, iPhone, iPad, and Android devices."
    },
    {
      question: "Is my data safe when using SimplifyConvert free online tools?",
      answer: "Connections use HTTPS. Some tools process files in your browser, while others temporarily send files to our servers for processing. See our Privacy Policy for details."
    },
    {
      question: "Do I need to create an account to use the free online tools?",
      answer: "Most free utility tools can be used without an account. Premium AI Studio requires an eligible account and credits."
    },
    {
      question: "Which free online tools are most popular?",
      answer: "Our most-used free online tools include: JPG to PNG converter, PDF merger, image compressor, video converter, background remover, and AI image generator. Users love these tools for their speed and simplicity."
    },
    {
      question: "Can I use SimplifyConvert free online tools on mobile?",
      answer: "Absolutely! Our free online tools are fully responsive and work perfectly on smartphones and tablets. Use any tool with the same features and speed as on desktop."
    }
  ];

  const homepageFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const getToolsByCategory = (cat: string) => {
    const filtered = popularTools.filter(tool => {
      if (!tool.route) return false;
      if (cat === 'all') return true;
      const category = tool.category?.toLowerCase() || '';
      const title = tool.title?.toLowerCase() || '';
      const catLower = cat.toLowerCase();
      
      // Check both category and title
      return category.includes(catLower) || title.includes(catLower);
    });
    return filtered.slice(0, 12);
  };

  const navigateSearch = (query: string) => {
    const bestMatch = getBestSearchResult(query);
    router.push(bestMatch?.route ?? `/all-tools?search=${encodeURIComponent(query)}`);
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
      link: '/all-tools/pdf/merge-pdf'
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
      link: '/all-tools/pdf/compress-pdf'
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomeHeader />

      {/* TAG LINE */}
      <section className="bg-orange-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
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
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-white">
        {/* Enhanced Animated Background Elements */}
        <motion.div
          className="absolute top-10 left-5 w-72 h-72 bg-gradient-to-br from-orange-200 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          animate={{ x: [0, 60, -40, 0], y: [0, 40, -60, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-5 w-72 h-72 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          animate={{ x: [0, -60, 40, 0], y: [0, -40, 60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-56 h-56 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, 30, -50, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            {/* LEFT SIDE - TEXT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-normal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Free Online Tools to Convert, Edit & Optimize{' '}
                <motion.span
                  className="relative inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <span className="absolute -inset-x-2 -inset-y-1 bg-orange-500/10 rounded-xl blur-lg" />
                  <span className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                    Your Files in Seconds
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Explore 200+ free utility tools for PDFs, images, video, AI writing, and more. Premium AI Studio is available separately.
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
                      onClick={() => navigateSearch(tag)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-full shadow-sm hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              </motion.div>

              {/* Stats with Counter Animation */}
              <motion.div
                className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: '200', suffix: '+', value: 'Tools' },
                  { label: '7', suffix: '', value: 'Categories' },
                  { label: 'Free', suffix: '', value: 'Utility Tools' }
                ].map((stat) => (
                  <motion.div key={stat.value} className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm group" variants={itemVariants}>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                      {stat.label}
                      <span className="text-lg md:text-xl text-orange-500">{stat.suffix}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-1 group-hover:text-gray-900 transition">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE - CATEGORIES */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="block"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Tools preview</p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900">Start with a category</h2>
                </div>
                <Link href="/all-tools" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition">
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
                          className="group h-full rounded-2xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all overflow-hidden"
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-5 h-full min-h-[132px] flex flex-col justify-between">
                            <div>
                              <div className={`p-3 bg-gradient-to-br ${cat.color} rounded-xl group-hover:shadow-lg transition-all w-fit mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="font-bold text-gray-900 text-base leading-tight">{cat.title}</h4>
                              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100">
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
                className="mt-6 text-center sm:hidden"
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
      <section id="categories" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Browse tools by category and discover everything we offer
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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
                      className="group h-full rounded-2xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all overflow-hidden"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 h-full min-h-[210px] flex flex-col justify-between gap-5 group-hover:bg-orange-50/30 transition">
                        <div className="flex items-start justify-between">
                          <div className={`p-3.5 bg-gradient-to-br ${cat.color} rounded-xl group-hover:shadow-lg transition-all`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <motion.div
                            className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            Recent
                          </motion.div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">{cat.title}</h4>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{cat.description}</p>
                        </div>
                        <motion.div
                          className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-gray-100"
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
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Actions
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              The most common tasks users perform. Start with what you need.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
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
                      className="group h-full min-h-[220px] p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 cursor-pointer flex flex-col"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`inline-flex w-fit p-3 mb-5 bg-gradient-to-br ${action.color} rounded-xl shadow-sm`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-5 line-clamp-2 flex-1">
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
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-orange-600 transition" />
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

      {/* PREMIUM AI STUDIO SECTION */}
      <section className="border-y border-orange-100 bg-orange-50/40 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                <Sparkles size={14} />
                Premium · Credit-based
              </div>
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Create with Premium AI Studio
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600 md:text-lg">
                Turn an idea into an editable presentation, structured document, or organized spreadsheet.
                AI Studio uses purchased credits and is separate from SimplifyConvert&apos;s free utility tools.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/ai-studio"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Explore AI Studio
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/ai-studio/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                View credit pricing
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                title: 'AI Presentation Maker',
                description: 'Build a presentation outline with slide content and visual direction, then export an editable PPTX.',
                href: '/ai-studio/presentation-maker',
                icon: Sparkles,
              },
              {
                title: 'AI Document Maker',
                description: 'Create structured reports, proposals, plans, letters, and other documents from a prompt.',
                href: '/ai-studio/document-maker',
                icon: FileText,
              },
              {
                title: 'AI Spreadsheet Maker',
                description: 'Generate organized tables for budgets, trackers, reports, and planning tasks, ready to review and export.',
                href: '/ai-studio/spreadsheet-maker',
                icon: BarChart3,
              },
            ].map((tool) => {
              const Icon = tool.icon;

              return (
                <motion.div key={tool.href} variants={itemVariants}>
                  <Link href={tool.href}>
                    <motion.div
                      className="group flex h-full min-h-[210px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-5 inline-flex w-fit rounded-xl bg-orange-100 p-3 text-orange-600 transition group-hover:bg-orange-200">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-gray-900 transition group-hover:text-orange-600">
                        {tool.title}
                      </h3>
                      <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600">
                        {tool.description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                        Open {tool.title}
                        <ArrowRight size={16} />
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to convert, edit, and optimize your files
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
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
                className="relative h-full"
              >
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition group flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <motion.div
                    className="relative mb-5 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition duration-300 blur-xl" />
                    <div className="relative w-full h-full flex items-center justify-center bg-orange-50 rounded-full border border-orange-100 shadow-sm group-hover:shadow-md transition">
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-500 mb-0.5">Step</div>
                        <div className="text-2xl font-bold text-orange-500">
                          {item.step}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-orange-200" />
                  )}

                  {/* Icon */}
                  <motion.div
                    className="p-3 bg-gray-50 rounded-2xl mb-5 shadow-sm group-hover:shadow-md transition inline-flex"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <item.icon className="w-7 h-7 text-orange-600" />
                  </motion.div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* POPULAR TOOLS SHOWCASE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 md:mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Tools
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with popular tools for common conversion and editing tasks
            </p>
          </motion.div>

          {/* Enhanced Filter Tabs */}
          <motion.div
            className="flex flex-wrap gap-2 mb-10 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {['all', 'Image', 'PDF', 'Video', 'AI Write'].map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative overflow-hidden ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {getToolsByCategory(selectedCategory).map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.id} variants={itemVariants}>
                  <Link href={tool.route ?? '/all-tools'}>
                    <motion.div 
                      className="h-full min-h-[220px] rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group relative overflow-hidden"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Hover Glow Background */}
                      <motion.div
                        className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div 
                            className="w-12 h-12 bg-orange-100 rounded-xl flex shrink-0 items-center justify-center group-hover:bg-orange-200 transition"
                            whileHover={{ scale: 1.2, rotate: 12 }}
                          >
                            <Icon className="w-6 h-6 text-orange-600" />
                          </motion.div>
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-orange-100 group-hover:text-orange-700 transition">
                            {tool.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition">{tool.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-5 flex-1">{tool.description}</p>
                        <motion.div 
                          className="flex items-center gap-1 text-orange-600 font-medium text-sm"
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
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose SimplifyConvert?
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Built for fast, straightforward file conversion and editing
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
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
                    className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 h-full min-h-[210px] transition-all group relative overflow-hidden"
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative z-10">
                      <motion.div 
                        className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition"
                        whileHover={{ scale: 1.15, rotate: 12 }}
                      >
                        <Icon className="w-7 h-7 text-orange-600" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition">{feature.title}</h3>
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
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
              What are Free Online Tools?
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                <strong>SimplifyConvert</strong> offers <strong>200+ free utility tools</strong> for file conversion, image editing, video processing, PDF tasks, and AI-assisted writing. These utility tools work online without software installation. Premium AI Studio is a separate credit-based product for creating presentations, documents, and spreadsheets.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                Why Choose Our Free Online Tools?
              </h3>
              
              <p>
                Our free online conversion tools are designed to be:
              </p>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg mt-1">✓</span>
                  <span><strong>Free Utility Tools:</strong> Our 200+ utility tools are free to use. Premium AI Studio is a separate credit-based service</span>
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
                  <span><strong>Privacy Focused:</strong> Some tools process files locally in your browser, while others temporarily process files on our servers</span>
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
                With 200+ free utility tools covering common file tasks, SimplifyConvert brings conversion and editing tools together in one place. Premium AI Studio is available separately for credit-based creation.
              </p>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about SimplifyConvert and our free online tools
            </p>
          </motion.div>

          <motion.div
            className="mx-auto grid max-w-4xl grid-cols-1 gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {homepageFaqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-orange-200 transition-all"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between gap-4 p-5 md:p-6 bg-white group-open:bg-orange-50 transition-colors">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-5 md:p-6 bg-white text-gray-700 leading-relaxed border-t border-gray-200">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
