'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Shield, Trash2, Edit2, Check, X, User } from 'lucide-react'
import { HomeHeader } from '@/app/components/HomeHeader'
import { Footer } from '@/app/components/Footer'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
      setEditName(session.user.name || '')
      setEditBio(session.user.bio || '')
    }
  }, [session, status, router])

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
        }),
      })

      if (response.ok) {
        setSaveMessage('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSaveMessage(''), 3000)
        router.refresh()
      } else {
        setSaveMessage('Failed to update profile')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage('Error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading account settings...</p>
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
              <h1 className="text-4xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account and preferences</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>

          {/* Profile Information - Editable Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center justify-center md:justify-start">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-500 shadow-lg">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full mt-2 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-2">
                    <User size={20} className="text-gray-400" />
                    <p className="text-gray-900 font-medium">{editName || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full mt-2 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-medium text-gray-900"
                    placeholder="Tell us about yourself (optional)"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg mt-2">
                    <p className="text-gray-600">
                      {editBio || <span className="text-gray-400">No bio added yet</span>}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Email Address</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-2">
                  <Mail size={20} className="text-gray-400" />
                  <p className="text-gray-900 font-medium">{user.email}</p>
                  <span className="ml-auto text-sm text-green-600">✓ Verified</span>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    <Check size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditName(user.name || '')
                      setEditBio(user.bio || '')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}

              {/* Success Message */}
              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    saveMessage.includes('successfully')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {saveMessage}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Email & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Email & Security</h2>
            
            <div className="space-y-6">
              {/* Password - Read Only for OAuth */}
              <div className="pb-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Lock size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                      <p className="text-gray-600 mt-1">
                        {user.provider === 'google' 
                          ? 'You signed up with Google. Your Google account handles your password.' 
                          : 'Change your password to keep your account secure.'}
                      </p>
                    </div>
                  </div>
                  {user.provider !== 'google' && (
                    <button className="px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition">
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-gray-600 mt-1">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-gray-600 border border-gray-300 font-semibold hover:bg-gray-50 rounded-lg transition">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-red-900 mb-6">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-start gap-4">
                  <Trash2 size={24} className="text-red-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 rounded-lg transition whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Account?</h3>
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      // TODO: Implement account deletion
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
