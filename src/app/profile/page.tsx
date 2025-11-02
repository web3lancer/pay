'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAppwriteAccount } from '@/hooks/useAppwriteAccount'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { profile, fetchProfile, updateProfile, loading } = useAppwriteAccount()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    bio: ''
  })

  // Fetch profile on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile()
    } else if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, fetchProfile, router])

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        displayName: profile.displayName || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {profile?.name || 'User Profile'}
              </h1>
              <p className="text-neutral-600">{profile?.email}</p>
              {profile?.verified && (
                <p className="text-sm text-green-600 mt-2">✓ Email verified</p>
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Content */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: profile?.name || '',
                      displayName: profile?.displayName || '',
                      bio: profile?.bio || ''
                    })
                  }}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-600 mb-2">Bio</h3>
                  <p className="text-neutral-700">{profile.bio}</p>
                </div>
              )}
              {profile?.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-600 mb-2">Member Since</h3>
                  <p className="text-neutral-700">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-600">Email</span>
              <span className="text-neutral-900 font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-600">Status</span>
              <span className="text-neutral-900 font-medium">
                {profile?.verified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Not Verified</span>
                )}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-600">User ID</span>
              <span className="text-neutral-900 font-mono text-sm truncate">
                {profile?.userId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
