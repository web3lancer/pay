'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import type { Users } from '@/types/appwrite.d'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiPlus,
  FiSend,
  FiLogOut,
  FiSettings,
  FiShield
} from 'react-icons/fi'

interface TopBarProps {
  onMenuClick: () => void
  mobile?: boolean
}

export function TopBar({ onMenuClick, mobile = false }: TopBarProps) {
  const { account, userProfile, logout, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  // Get username and email from userProfile (database), fallback to account
  const username = userProfile?.username || account?.name || ''
  const email = userProfile?.email || account?.email || ''
  const displayName = userProfile?.displayName || account?.name || ''
  
  // Get first letter of name for avatar
  const firstLetter = displayName.charAt(0).toUpperCase()

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

        {/* Logo and App Name - Always on the left */}
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

        {/* Profile Circle - Always visible */}
        <div className="relative">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
              {isAuthenticated && account?.prefs?.profileImage ? (
                <img 
                  src={account.prefs.profileImage} 
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover" 
                />
              ) : (
                <FiUser className="h-4 w-4 text-cyan-600" />
              )}
            </div>
            {!mobile && (
              <span className="text-sm font-medium text-neutral-900">
                {isLoading
                  ? '...'
                  : (isAuthenticated
                      ? (username || 'Account')
                      : 'Account')}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-1 z-50 border border-neutral-200">
              {isAuthenticated ? (
                <>
                  {/* Authenticated User Header */}
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">{email}</p>
                  </div>
                  
                  {/* Authenticated Menu Items */}
                  <div className="py-1">
                    {/* Removed 'Your Profile' and 'Security' menu items */}
                    <Link 
                      href="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiSettings className="mr-3 h-4 w-4 text-neutral-500" />
                      Settings
                    </Link>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="py-1 border-t border-neutral-200">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        handleSignOut()
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-neutral-100"
                    >
                      <FiLogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Unauthenticated User Header */}
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">Welcome to Web3Lancer Pay</p>
                    <p className="text-xs text-neutral-500">Sign in to access your account</p>
                  </div>
                  
                  {/* Authentication Options */}
                  <div className="py-1">
                    <Link 
                      href="/auth/login" 
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiUser className="mr-3 h-4 w-4 text-neutral-500" />
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FiPlus className="mr-3 h-4 w-4 text-neutral-500" />
                      Sign Up
                    </Link>
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