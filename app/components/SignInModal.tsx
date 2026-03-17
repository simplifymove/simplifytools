'use client';

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setError('Email sign-in requires additional setup. Use OAuth options below.');
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
    setIsLoading(false);
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    await signIn('facebook', { callbackUrl: '/' });
    setIsLoading(false);
  };

  const handleOutlookSignIn = async () => {
    setIsLoading(true);
    await signIn('azure-ad', { callbackUrl: '/' });
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    onClose();
  };

  if (session?.user) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal */}
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-8"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>

              {/* Profile View */}
              <div className="text-center">
                <div className="mb-4">
                  {session.user?.image && (
                    <motion.img
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-blue-500 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {session.user?.name || 'User'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{session.user?.email}</p>

                {(session as any)?.provider && (
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full mb-4">
                    {(session as any).provider.charAt(0).toUpperCase() +
                      (session as any).provider.slice(1)}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    className="w-full py-2 bg-blue-500 text-white font-medium rounded-lg text-sm hover:bg-blue-600 transition-all"
                    onClick={onClose}
                  >
                    View Profile
                  </Link>
                  <motion.button
                    onClick={handleSignOut}
                    className="w-full py-2 bg-gray-200 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-300 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-8"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>

            {/* Title */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
                SC
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            </div>

            {/* Google Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </motion.button>

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mb-4 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-blue-500 hover:text-blue-600 font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Sign In Button */}
            <motion.button
              onClick={handleEmailSignIn}
              disabled={isLoading || !email || !password}
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg text-sm hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-500">Or sign in with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <motion.button
                onClick={handleFacebookSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm hover:border-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-medium">Facebook</span>
              </motion.button>
              <motion.button
                onClick={handleOutlookSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                  <path d="M11.6 4H4.4C3.6 4 3 4.6 3 5.4v13.2c0 .8.6 1.4 1.4 1.4h7.2V4zm8.8 0h-7.2v14.6h7.2c.8 0 1.4-.6 1.4-1.4V5.4c0-.8-.6-1.4-1.4-1.4z" />
                </svg>
                <span className="font-medium">Outlook</span>
              </motion.button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
