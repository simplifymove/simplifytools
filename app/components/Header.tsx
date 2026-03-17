'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Menu, X, FileText, Image, Video, PenTool, Database, Code2, Volume2 } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const categories = [
    {
      id: 'pdf',
      title: 'PDF Tools',
      icon: FileText,
      color: 'from-purple-500 to-purple-700',
      count: '47+',
      link: '/tools/pdf',
    },
    {
      id: 'image',
      title: 'Image Tools',
      icon: Image,
      color: 'from-orange-500 to-orange-700',
      count: '30+',
      link: '/tools?category=Image',
    },
    {
      id: 'video',
      title: 'Video Tools',
      icon: Video,
      color: 'from-pink-500 to-pink-700',
      count: '10+',
      link: '/tools?category=video',
    },
    {
      id: 'ai',
      title: 'AI Write',
      icon: PenTool,
      color: 'from-blue-500 to-blue-700',
      count: '50+',
      link: '/tools/ai-write',
    },
    {
      id: 'data',
      title: 'Data Conversion',
      icon: Database,
      color: 'from-teal-500 to-teal-700',
      count: '12',
      link: '/tools/data',
    },
    {
      id: 'code',
      title: 'Code Tools',
      icon: Code2,
      color: 'from-green-500 to-green-700',
      count: '44',
      link: '/tools/code',
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      icon: Volume2,
      color: 'from-indigo-500 to-indigo-700',
      count: 'Multi',
      link: '/tools/text-to-speech',
    },
  ];

  const navItems = [
    { label: 'Image', href: '/tools?category=Image' },
    { label: 'Video', href: '/tools?category=video' },
    { label: 'AI Write', href: '/tools/ai-write' },
    { label: 'Data', href: '/tools/data' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">
              SimplifyConvert
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 ml-8">
            {/* All Tools Dropdown */}
            <div className="relative group pb-2">
              <button className="flex items-center gap-1 text-gray-700 hover:text-orange-500 font-medium transition relative py-2 px-1">
                All Tools
                <ChevronDown size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full w-96 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-4 pointer-events-none group-hover:pointer-events-auto">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link key={cat.id} href={cat.link}>
                        <div className="p-3 rounded-lg border border-gray-100 hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-all group/item hover:scale-105">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 bg-gradient-to-br ${cat.color} rounded-md shrink-0`}>
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-gray-900 group-hover/item:text-orange-600 transition whitespace-nowrap overflow-hidden text-ellipsis">{cat.title}</p>
                          </div>
                          <p className="text-xs text-gray-500">{cat.count} tools</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Nav Items */}
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 font-medium transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </form>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/tools"
              className="px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition duration-0"
            >
              Browse Tools
            </Link>
            <Link
              href="/auth/signin"
              className="px-6 py-2 border-2 border-orange-500 text-orange-500 font-medium rounded-full hover:bg-orange-50 transition duration-0"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearch} className="mb-4 mt-4 px-2">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </form>

            {/* Mobile Nav Items */}
            <div className="flex flex-col gap-2 px-2">
              <Link href="/tools" className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium">
                All Tools
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2 mt-4 px-2">
              <Link
                href="/tools"
                className="w-full px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition text-center"
              >
                Browse Tools
              </Link>
              <Link
                href="/auth/signin"
                className="w-full px-4 py-2 border-2 border-orange-500 text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
