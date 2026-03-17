'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Search, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      router.push(`/tools?search=${encodeURIComponent(query)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isHeaderScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TT</span>
            </div>
            <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition hidden sm:inline">
              TinyTools
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tools"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              All Tools
            </Link>
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Features
            </a>
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <input
                type="search"
                name="search"
                placeholder="Search tools..."
                className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </form>

          {/* Auth Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold">{session.user?.name}</span>
                </span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition duration-0"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-0"
              >
                <User size={16} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-900" />
            ) : (
              <Menu size={24} className="text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 border-t border-gray-200"
          >
            <form onSubmit={handleSearch} className="mt-4 mb-4">
              <div className="relative">
                <input
                  type="search"
                  name="search"
                  placeholder="Search tools..."
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </form>
            <Link
              href="/tools"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tools
            </Link>
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                className="block px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </nav>
    </header>
  );
}
