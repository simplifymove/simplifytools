'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogOut, ArrowLeft, Calendar, Mail, User, BarChart3 } from 'lucide-react'
import { HomeHeader } from '@/app/components/HomeHeader'
import { Footer } from '@/app/components/Footer'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
    }
  }, [session, status, router])

  if (loading || !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back to SimplifyConvert</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>

          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-5xl font-bold border-4 border-blue-500 shadow-lg">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User size={20} className="text-gray-400" />
                    <p className="text-gray-900 font-medium">{user.name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-gray-400" />
                    <p className="text-gray-900 font-medium break-all">{user.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Member Since</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-gray-400" />
                    <p className="text-gray-900 font-medium">
                      {new Date(session.user.createdAt || new Date()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {session.user.lastLoginAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600">Last Login</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar size={20} className="text-gray-400" />
                      <p className="text-gray-900 font-medium">
                        {new Date(session.user.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Tools Used</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <BarChart3 size={32} className="text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Conversions This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <BarChart3 size={32} className="text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Conversions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <BarChart3 size={32} className="text-orange-500" />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/all-tools"
                className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-center"
              >
                Browse All Tools
              </Link>

              <Link
                href="/account"
                className="px-6 py-4 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition text-center"
              >
                Account Settings
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
