'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiShield, FiLogOut } from 'react-icons/fi'
import { AppShell } from '@/components/layout/AppShell'
import { GuestSessionButton } from '@/components/auth/GuestSessionButton'
import { GuestConversion } from '@/components/auth/GuestConversion'

export function HomeClient() {
  const { user, isAuthenticated, isGuest, isLoading, signOut } = useAuth()

  // Debug logging
  console.log('HomeClient - Auth State:', {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    userExists: !!user
  })

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-neutral-900">
                {isAuthenticated && !isGuest ? 'Dashboard' : isGuest ? 'Dashboard (Guest)' : 'Welcome to LancerPay'}
              </h1>
              {(isAuthenticated || isGuest) && (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {isAuthenticated && user ? (
            <>
              {/* Guest Conversion Banner - Show for guest users */}
              {isGuest && (
                <div className="mb-8">
                  <GuestConversion />
                </div>
              )}

              {/* User Info Card - Only shown when authenticated */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-full p-2 mr-3">
                      <FiUser className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Full Name</p>
                      <p className="text-sm text-neutral-600">
                        {user.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-full p-2 mr-3">
                      <FiMail className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Email</p>
                      <p className="text-sm text-neutral-600">{user.email}</p>
                      {user.emailVerification && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-full p-2 mr-3">
                      <FiShield className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">KYC Status</p>
                      <p className="text-sm text-neutral-600">
                        {user.prefs?.kycStatus || 'Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-full p-2 mr-3">
                      <FiShield className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">2FA Enabled</p>
                      <p className="text-sm text-neutral-600">
                        {user.prefs?.twoFactorEnabled ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug Info (only in development and when authenticated) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Info</h3>
                  <pre className="text-xs bg-white p-4 rounded border overflow-auto">
                    {JSON.stringify({ user, isAuthenticated }, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Public Dashboard - Show when not authenticated */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Secure Payments</h3>
                  <p className="text-sm text-neutral-600">
                    Send and receive payments with blockchain security
                  </p>
                </div>
                
                <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Multi-Currency</h3>
                  <p className="text-sm text-neutral-600">
                    Support for multiple cryptocurrencies and tokens
                  </p>
                </div>
                
                <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-2">Instant Transfers</h3>
                  <p className="text-sm text-neutral-600">
                    Fast and reliable cross-border transactions
                  </p>
                </div>
              </div>

              {/* Call to Action for non-authenticated users */}
              <div className="text-center mb-8">
                <div className="inline-flex gap-4">
                  <GuestSessionButton 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onSuccess={() => window.location.reload()}
                  >
                    Try as Guest
                  </GuestSessionButton>
                  <a 
                    href="/auth/login"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Sign In / Sign Up
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Welcome Message */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              {isAuthenticated ? 'Welcome back!' : 'Welcome to Pay by Web3Lancer!'}
            </h3>
            <p className="text-primary-700">
              {isAuthenticated 
                ? 'Your account is ready. Manage your payments and transactions from this dashboard.'
                : 'A modern payment platform for freelancers and businesses. Sign in through the account menu to unlock all features and manage your payments.'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}