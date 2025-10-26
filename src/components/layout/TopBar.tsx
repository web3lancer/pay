'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHelpCircle,
  FiChevronDown
} from 'react-icons/fi'

interface TopBarProps {
  onMenuClick: () => void
  mobile?: boolean
}

/**
 * Generate initials from name or email
 */
function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }
  
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  
  return 'U'
}

/**
 * Get background color based on initials
 */
function getAvatarColor(initials: string): string {
  const colors = [
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-orange-500'
  ]
  
  let hash = 0
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export function TopBar({ onMenuClick, mobile = false }: TopBarProps) {
  const { logout, isAuthenticated, redirectToAuth, user, loading } = useAuth()
  const router = useRouter()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      setProfileDropdownOpen(false)
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleProfileClick = () => {
    setProfileDropdownOpen(false)
    router.push('/profile')
  }

  const handleSettingsClick = () => {
    setProfileDropdownOpen(false)
    router.push('/settings')
  }

  const userEmail = user?.email || ''
  const userName = user?.name || user?.displayName || ''
  const initials = getInitials(userName, userEmail)
  const avatarColor = getAvatarColor(initials)

  if (!mounted) return null

  return (
    <header className={cn(
      'flex h-16 items-center justify-between bg-white border-b border-neutral-200 px-6',
      {
        'px-4': mobile,
      }
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-4 min-w-0">
        {mobile && (
          <button
            onClick={onMenuClick}
            className="p-2 text-neutral-600 hover:text-neutral-900 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}

        {/* Logo and App Name */}
        <div className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="LancerPay Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="font-semibold text-neutral-900">LancerPay</span>
        </div>
      </div>

      {/* Center Section - Search bar for desktop */}
      {!mobile && (
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions, addresses..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
          <FiBell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">3</span>
          </span>
        </button>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200',
              profileDropdownOpen 
                ? 'bg-neutral-100' 
                : 'hover:bg-neutral-100'
            )}
          >
            {/* Avatar Circle with Initials */}
            {isAuthenticated && !loading ? (
              <>
                <div className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm',
                  avatarColor
                )}>
                  {initials}
                </div>
                
                {!mobile && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-neutral-900">
                      {userName ? userName.split(' ')[0] : userEmail.split('@')[0]}
                    </span>
                    <FiChevronDown className={cn(
                      'h-4 w-4 text-neutral-600 transition-transform',
                      profileDropdownOpen && 'rotate-180'
                    )} />
                  </div>
                )}
              </>
            ) : loading ? (
              <>
                <div className="h-9 w-9 rounded-full bg-neutral-200 animate-pulse" />
                {!mobile && (
                  <span className="text-sm font-medium text-neutral-600">Loading...</span>
                )}
              </>
            ) : (
              <>
                <div className="h-9 w-9 rounded-full bg-cyan-100 flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-cyan-600" />
                </div>
                {!mobile && (
                  <span className="text-sm font-medium text-neutral-900">Connect</span>
                )}
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 z-50 border border-neutral-200">
              {isAuthenticated ? (
                <>
                  {/* User Header */}
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold',
                        avatarColor
                      )}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {userName || 'Account'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors gap-3"
                    >
                      <FiUser className="h-4 w-4 text-neutral-500" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors gap-3"
                    >
                      <FiSettings className="h-4 w-4 text-neutral-500" />
                      <span>Settings</span>
                    </button>

                    <Link
                      href="/help"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors gap-3"
                    >
                      <FiHelpCircle className="h-4 w-4 text-neutral-500" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-200 my-1" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors gap-3"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Unauthenticated User Header */}
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-900">Welcome to LancerPay</p>
                    <p className="text-xs text-neutral-500 mt-1">Sign in to access your account</p>
                  </div>

                  {/* Authentication Option */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        redirectToAuth()
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-cyan-600 hover:bg-cyan-50 transition-colors gap-3 font-medium"
                    >
                      <FiUser className="h-4 w-4" />
                      <span>Sign in</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
