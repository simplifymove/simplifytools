'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Lock, Shield, Trash2, Edit2, Check, X, Mail, Home, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { HomeHeader } from '@/app/components/HomeHeader'
import { Footer } from '@/app/components/Footer'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [passwordStatusLoading, setPasswordStatusLoading] = useState(true)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [canCreatePassword, setCanCreatePassword] = useState(false)
  const [usesGoogleSignIn, setUsesGoogleSignIn] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    console.log('[Account Page] Session status:', status)
    console.log('[Account Page] Session data:', session)
    
    if (status === 'loading') {
      console.log('[Account Page] Still loading session...')
      return
    }
    
    if (!session?.user) {
      console.log('[Account Page] No session found, redirecting to signin')
      router.push('/auth/signin?callbackUrl=/account')
      return
    }
    
    console.log('[Account Page] Session exists for user:', session.user.email)
    setLoading(false)
    setEditName(session.user.name || '')
    setEditBio(session.user.bio || '')

    let cancelled = false
    setPasswordStatusLoading(true)
    fetch('/api/user/change-password')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load account security status')
        return response.json() as Promise<{
          hasPassword?: boolean
          usesGoogleSignIn?: boolean
          canCreatePassword?: boolean
        }>
      })
      .then((data) => {
        if (!cancelled) {
          setHasPassword(Boolean(data.hasPassword))
          setUsesGoogleSignIn(Boolean(data.usesGoogleSignIn))
          setCanCreatePassword(Boolean(data.canCreatePassword))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasPassword(null)
          setUsesGoogleSignIn(false)
          setCanCreatePassword(false)
        }
      })
      .finally(() => {
        if (!cancelled) setPasswordStatusLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session, status, router])

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setSaveMessage('Name cannot be empty')
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

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not available'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleChangePassword = async () => {
    setPasswordMessage('')
    setPasswordError('')

    const isCreatingPassword = canCreatePassword && hasPassword === false

    if ((!isCreatingPassword && !currentPassword) || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Confirm new password must match.')
      return
    }

    if (!isCreatingPassword && currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      })
      const result = await response.json().catch(() => ({})) as { error?: string }

      if (!response.ok) {
        setPasswordError(result.error || 'Unable to change password right now.')
        return
      }

      setPasswordMessage(isCreatingPassword ? 'Password created successfully.' : 'Password changed successfully.')
      setHasPassword(true)
      setCanCreatePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch {
      setPasswordError('Unable to change password right now.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading || !session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    )
  }

  const user = session.user
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'account', label: 'Account', icon: Mail },
  ]

  const renderPasswordSection = (isMobile = false) => {
    const isCreatingPassword = canCreatePassword && hasPassword === false
    const canManagePassword = hasPassword === true || isCreatingPassword
    const passwordSubmitLabel = isChangingPassword
      ? isCreatingPassword ? 'Creating...' : 'Changing...'
      : isCreatingPassword ? 'Create Password' : 'Change Password'

    return (
      <div className={`${isMobile ? 'pb-4' : 'pb-6'} border-b border-gray-200`}>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className={`${isMobile ? 'font-semibold' : 'text-lg font-semibold'} text-gray-900`}>
            {isCreatingPassword ? 'Create Password' : 'Change Password'}
          </h3>
          {usesGoogleSignIn && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Google Sign-In
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          {isCreatingPassword
            ? 'Create a password to sign in with either Google or email and password.'
            : 'Change your password to keep your account secure.'}
        </p>
      </div>

      {passwordStatusLoading && (
        <p className="text-sm text-gray-500">Loading password settings...</p>
      )}

      {!passwordStatusLoading && canManagePassword && (
        <div className="space-y-4">
          {!isCreatingPassword && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {passwordError && (
            <div className="p-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="p-4 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              {passwordMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
          >
            {passwordSubmitLabel}
          </button>
        </div>
      )}

      {!passwordStatusLoading && hasPassword === false && !canCreatePassword && (
        <div className="p-4 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
          Password management is not available for this account.
        </div>
      )}

      {!passwordStatusLoading && hasPassword === null && (
        <div className="p-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          Unable to load password settings right now.
        </div>
      )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HomeHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === item.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop Layout: Sidebar + Content */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-1">
            <nav className="space-y-1 sticky top-8">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                      activeTab === item.id
                        ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="col-span-3 space-y-6">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
              >
                <div className="flex items-start justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Avatar */}
                <div className="mb-8">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="w-32 h-32 rounded-full border-4 border-orange-600 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-orange-600 shadow-lg">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{editName || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.email}</p>
                      <CheckCircle2 size={20} className="text-green-600" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tell us about yourself (optional)"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-600">{editBio || 'No bio added yet'}</p>
                    )}
                  </div>

                  {/* Save/Cancel */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                      >
                        <Check size={18} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditName(session.user?.name || '')
                          setEditBio(session.user?.bio || '')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Message */}
                  {saveMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 rounded-lg text-sm font-medium ${
                        saveMessage.includes('successfully')
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {saveMessage}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Security Section */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Security</h2>

                {renderPasswordSection()}

                {/* Two-Factor Authentication */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-gray-600 text-sm mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button disabled className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg cursor-not-allowed font-medium whitespace-nowrap">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Account Section */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>

                {/* Created Date */}
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-semibold text-gray-700">Account Created</label>
                  <p className="text-gray-900 font-medium mt-2">{formatDate(session.user?.createdAt)}</p>
                </div>

                {/* Last Login */}
                <div className="pb-6 border-b border-gray-200">
                  <label className="text-sm font-semibold text-gray-700">Last Sign In</label>
                  <p className="text-gray-900 font-medium mt-2">{formatDate(session.user?.lastLoginAt)}</p>
                </div>

                {/* Sign Out */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">Session</label>
                  <button
                    onClick={() => router.push('/api/auth/signout')}
                    className="px-4 py-2 flex items-center gap-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}


          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Profile</h2>

              {/* Avatar */}
              <div>
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-24 h-24 rounded-full border-4 border-orange-600 shadow-lg object-cover mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-orange-600 shadow-lg mx-auto">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{editName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-600">{editBio || 'No bio added'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
              <div className="space-y-4">
                {renderPasswordSection(true)}
                <div>
                  <h3 className="font-semibold text-gray-900">2FA</h3>
                  <p className="text-gray-600 text-sm mt-1">Coming Soon</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-900">Account</h2>
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <label className="text-sm font-semibold text-gray-700">Created</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDate(session.user?.createdAt)}</p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <label className="text-sm font-semibold text-gray-700">Last Sign In</label>
                  <p className="text-gray-900 font-medium mt-1">{formatDate(session.user?.lastLoginAt)}</p>
                </div>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}


        </div>
      </main>

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
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Delete Account?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  // TODO: Implement account deletion
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  )
}
