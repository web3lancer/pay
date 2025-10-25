'use client'

import { useAuth } from '@/contexts/AuthContext'
import { FiLogOut } from 'react-icons/fi'
import { AppShell } from '@/components/layout/AppShell'

export function HomeClient() {
  const { isAuthenticated, isLoading, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut?.()
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
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-neutral-900">
              {isAuthenticated ? 'Dashboard' : 'Welcome to LancerPay'}
            </h1>
            {isAuthenticated && (
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

        {isAuthenticated ? (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Account authenticated via external service
            </h2>
            <p className="text-neutral-600">
              Your account information is managed by the authentication service. 
              User data would appear here once integrated with the external auth service.
            </p>
          </div>
        ) : (
          <>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Not authenticated</h2>
              <p className="text-blue-700">
                Please log in using the Connect button in the top menu to access your dashboard.
              </p>
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
              : 'A modern payment platform for freelancers and businesses. Sign in through the Connect button to unlock all features and manage your payments.'
            }
          </p>
        </div>
      </div>
    </AppShell>
  )
}
