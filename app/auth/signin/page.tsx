'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, type FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeHeader } from '@/app/components/HomeHeader'
import { Footer } from '@/app/components/Footer'
import { getSafeInternalCallbackPath, getSignUpPath } from '@/lib/auth/redirect'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const error = searchParams?.get('error')
  
  const callbackUrl = getSafeInternalCallbackPath(
    searchParams?.get('callbackUrl'),
  )

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setFormError('Email and password are required.')
      return
    }

    setIsEmailLoading(true)
    try {
      const result = await signIn('credentials', {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setFormError('Invalid email or password.')
        return
      }

      router.push(result?.url || callbackUrl)
      router.refresh()
    } catch (error) {
      console.error('Email sign in failed:', error)
      setFormError('Unable to sign in right now. Please try again.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', {
        callbackUrl: callbackUrl,
        redirect: true,
      })
      if (result?.error) {
        console.error('Sign in error:', result.error)
      }
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <HomeHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">Sign in to SimplifyConvert</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
            >
              {error === 'OAuthSignin'
                ? 'Error connecting to Google. Please try again.'
                : error === 'OAuthCallback'
                  ? 'Error during Google callback. Please try again.'
                  : 'An error occurred during sign in. Please try again.'}
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot Password
              </Link>
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
              >
                {formError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isEmailLoading || !email.trim() || !password}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEmailLoading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <p className="text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href={getSignUpPath(callbackUrl)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create Account
            </Link>
          </p>

          {/* Footer Links */}
          <div className="text-center text-sm text-gray-500 space-y-1 border-t border-gray-200 pt-6 mt-6">
            <div className="flex gap-4 justify-center text-xs">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <SignInContent />
    </Suspense>
  )
}
