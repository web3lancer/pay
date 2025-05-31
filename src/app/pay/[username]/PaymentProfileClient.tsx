'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PaymentProfile } from '@/components/profile/PaymentProfile'
import { DatabaseService } from '@/lib/database'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiUser } from 'react-icons/fi'

interface PaymentProfileClientProps {
  username: string
}

interface UserProfile {
  userId: string
  username: string
  displayName: string
  profileImage?: string
  isActive: boolean
}

interface TransformedWallet {
  id: string
  name: string
  symbol: string
  address: string
  qrData: string
}

export function PaymentProfileClient({ username }: PaymentProfileClientProps) {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [wallets, setWallets] = useState<TransformedWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get user profile by username
        const userProfile = await DatabaseService.getUserByUsername(username)
        
        if (!userProfile) {
          setError('User not found')
          return
        }

        if (!userProfile.isActive) {
          setError('This user profile is not available')
          return
        }

        setProfile(userProfile)

        // Get user's active wallets
        const userWallets = await DatabaseService.getUserWallets(userProfile.userId)
        const activeWallets = userWallets.filter(wallet => wallet.isActive)
        
        // Transform wallets for PaymentProfile component
        const transformedWallets = activeWallets.map(wallet => ({
          id: wallet.walletId,
          name: wallet.walletName,
          symbol: getTokenSymbol(wallet.blockchain),
          address: wallet.walletAddress,
          qrData: generateQRData(wallet)
        }))

        setWallets(transformedWallets)

      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [username])

  // Helper function to get token symbol from blockchain
  const getTokenSymbol = (blockchain: string): string => {
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'polygon': 'MATIC',
      'bsc': 'BNB'
    }
    return symbolMap[blockchain.toLowerCase()] || blockchain.toUpperCase()
  }

  // Helper function to generate QR data
  const generateQRData = (wallet: any): string => {
    const symbol = getTokenSymbol(wallet.blockchain).toLowerCase()
    return `${symbol}:${wallet.walletAddress}`
  }

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser?.name === profile?.displayName || false

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading payment profile...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Profile Not Found</h2>
            <p className="text-neutral-600 mb-6">
              {error || `The user @${username} could not be found or is not available for payments.`}
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiUser className="mr-2 h-4 w-4" />
              Go to Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  if (wallets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <FiUser className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-2">No Payment Methods</h2>
            <p className="text-neutral-600 mb-6">
              {isOwnProfile 
                ? "You haven't set up any wallets yet. Add a wallet to start receiving payments."
                : `@${username} hasn't set up any payment methods yet.`
              }
            </p>
            {isOwnProfile && (
              <a
                href="/wallets"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add Wallet
              </a>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <PaymentProfile
      username={username}
      displayName={profile.displayName}
      profileImage={profile.profileImage}
      wallets={wallets}
      web3lancerProfile={`https://web3lancer.website/u/${username}`}
      isOwnProfile={isOwnProfile}
    />
  )
}