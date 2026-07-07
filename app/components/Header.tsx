'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, Search, Menu, X, FileText, Image as ImageIcon, Video, PenTool, Database, Code2, Volume2, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/all-tools?search=${encodeURIComponent(searchQuery)}`);
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
      count: '55+',
      link: '/all-tools/pdf-tools',
    },
    {
      id: 'image',
      title: 'Image Tools',
      icon: ImageIcon,
      color: 'from-orange-500 to-orange-700',
      count: '80+',
      link: '/all-tools/image-tools',
    },
    {
      id: 'video',
      title: 'Video Tools',
      icon: Video,
      color: 'from-pink-500 to-pink-700',
      count: '58+',
      link: '/all-tools/video-tools',
    },
    {
      id: 'ai',
      title: 'AI Writing',
      icon: PenTool,
      color: 'from-blue-500 to-blue-700',
      count: '60+',
      link: '/all-tools/ai-tools',
    },
    {
      id: 'data',
      title: 'Data Tools',
      icon: Database,
      color: 'from-cyan-500 to-emerald-700',
      count: '12',
      link: '/all-tools/data',
    },
    {
      id: 'code',
      title: 'Code Tools',
      icon: Code2,
      color: 'from-green-500 to-green-700',
      count: '44+',
      link: '/all-tools/code-tools',
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      icon: Volume2,
      color: 'from-indigo-500 to-indigo-700',
      count: 'Voice',
      link: '/all-tools/text-to-speech',
    },
  ];

  const navItems = [
    { label: 'Image', href: '/all-tools/image-tools' },
    { label: 'Video', href: '/all-tools/video-tools' },
    { label: 'AI Writing', href: '/all-tools/ai-tools' },
    { label: 'Data Tools', href: '/all-tools/data' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center overflow-hidden p-1">
              <Image 
                src="/Logo-icon.gif" 
                alt="SimplifyConvert free online tools logo" 
                width={28} 
                height={28}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">
              SimplifyConvert
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 flex-1 ml-8">
            {/* All Tools Dropdown */}
            <div className="relative group pb-2">
              <Link href="/all-tools" className="flex items-center gap-1 text-gray-700 hover:text-orange-500 font-medium transition relative py-2 px-1">
                All Tools
                <ChevronDown size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>

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
              href="/all-tools"
              className="px-6 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition duration-0"
            >
              Browse Tools
            </Link>
            
            {session?.user ? (
              // User Dropdown Menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 rounded-full hover:bg-orange-50 transition"
                >
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-gray-700 font-medium hidden sm:inline max-w-[100px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Account
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-6 py-2 border-2 border-orange-500 text-orange-500 font-medium rounded-full hover:bg-orange-50 transition duration-0"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition duration-0"
                >
                  Sign Up
                </Link>
              </>
            )}
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
              <Link href="/all-tools" className="px-4 py-2 text-gray-700 hover:text-orange-500 font-medium">
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
                href="/all-tools"
                className="w-full px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition text-center"
              >
                Browse Tools
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href="/account"
                    className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="w-full px-4 py-2 border-2 border-orange-500 text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

