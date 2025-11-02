'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user, userProfile } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    )
  }

  // Get initials from user name
  const name = userProfile?.displayName || userProfile?.name || user?.email?.split('@')[0] || 'U'
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Get random pastel background color based on initials hash
  const colors = [
    'bg-gradient-to-br from-cyan-400 to-blue-500',
    'bg-gradient-to-br from-purple-400 to-pink-500',
    'bg-gradient-to-br from-green-400 to-emerald-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-red-400 to-pink-500'
  ]
  const colorIndex = initials.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  // Build account settings URL
  const source = typeof window !== 'undefined' ? window.location.href : ''
  const authSubdomain = process.env.AUTH_SUBDOMAIN || 'accounts'
  const appDomain = process.env.APP_DOMAIN || 'web3lancer.website'
  const accountsUrl = `https://${authSubdomain}.${appDomain}/profile?source=${encodeURIComponent(source)}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <div className="flex items-start gap-8 mb-8">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <span className="text-4xl font-bold text-white">{initials}</span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900 mb-1">
              {userProfile?.displayName || userProfile?.name || 'User'}
            </h1>
            <p className="text-neutral-600 mb-4">{user?.email}</p>
            
            {userProfile?.verified && (
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                ✓ Verified
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={accountsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            Edit Profile & Settings
            <FiExternalLink className="h-5 w-5" />
          </a>
          <p className="text-sm text-neutral-500 text-center">
            Manage profile, security, and preferences in Account Settings
          </p>
        </div>
      </div>
    </div>
  )
}
