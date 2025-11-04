'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { FiArrowLeft, FiCreditCard, FiHardDrive, FiDatabase, FiDownload, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import Link from 'next/link'
import type { Wallets } from '@/types/appwrite.d'
import { createWalletWithFunction, createWallet } from '@/lib/appwrite'

export default function CreateWalletPage() {
  const router = useRouter()
  const { userProfile, isAuthenticated } = useAuth()
  const { createWallet: createWalletContext } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Only include fields defined in Wallets type (except system fields)
  const [formData, setFormData] = useState<Omit<Wallets, 'walletId' | '$id' | '$createdAt' | '$updatedAt' | 'users' | 'transactions'>>({
    userId: '',
    walletName: '',
    walletType: 'hot',
    blockchain: 'bitcoin',
    publicKey: '',
    encryptedPrivateKey: '',
    walletAddress: '',
    derivationPath: '',
    isDefault: false,
    isActive: true,
    balance: 0,
    lastSyncAt: null,
  })

  // For imported wallets, use mnemonic (not private key)
  const [mnemonic, setMnemonic] = useState('')

  // Add walletPassword state for inbuilt/imported wallets
  const [walletPassword, setWalletPassword] = useState('')

  // Advanced dropdown state for derivation path
  const [showAdvanced, setShowAdvanced] = useState(false)

  const generateMockWallet = (blockchain: string) => {
    // Mock wallet generation - in real app, use proper crypto libraries
    const mockAddresses: Record<string, string> = {
      bitcoin: 'bc1q' + Math.random().toString(36).substring(2, 34),
      ethereum: '0x' + Math.random().toString(16).substring(2, 42),
      polygon: '0x' + Math.random().toString(16).substring(2, 42),
      bsc: '0x' + Math.random().toString(16).substring(2, 42)
    }
    return {
      address: mockAddresses[blockchain] || mockAddresses.bitcoin,
      publicKey: 'pub_' + Math.random().toString(36).substring(2, 34),
      encryptedPrivateKey: 'priv_' + Math.random().toString(36).substring(2, 34)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !userProfile) return

    setIsLoading(true)
    setError('')

    try {
      let walletData: any = {
        ...formData,
        userId: userProfile.userId,
      }

      // Prepare input for Appwrite function
      let functionInput: any = {
        walletType: formData.walletType === 'hot' ? 'inbuilt' : formData.walletType,
        blockchain: formData.blockchain,
        walletPassword,
        walletName: formData.walletName,
      }
      if (formData.walletType === 'imported') {
        functionInput.mnemonic = mnemonic
      }
      // Optionally add derivationPath if present
      if (formData.derivationPath) functionInput.derivationPath = formData.derivationPath

      // Call Appwrite function for inbuilt/imported wallets
      if (['hot', 'imported'].includes(formData.walletType)) {
        const result = await createWalletWithFunction(functionInput)
        walletData = {
          ...walletData,
          walletAddress: result.walletAddress,
          publicKey: result.publicKey,
          encryptedPrivateKey: result.encryptedPrivateKey,
          derivationPath: result.derivationPath,
          creationMethod: result.creationMethod,
        }
      } else if (formData.walletType === 'external') {
        // For external wallets, set creationMethod
        walletData.creationMethod = 'external'
      }

      // Remove mnemonic from walletData if present
      delete walletData.mnemonic

      await createWalletContext(walletData)
      router.push('/wallets')
    } catch (error: any) {
      setError(error.message || 'Failed to create wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const walletTypes = [
    {
      id: 'hot',
      name: 'Hot Wallet',
      description: 'Online wallet for frequent transactions',
      icon: FiCreditCard,
      recommended: true
    },
    {
      id: 'cold',
      name: 'Cold Wallet', 
      description: 'Offline storage for maximum security',
      icon: FiDatabase,
      recommended: false
    },
    {
      id: 'hardware',
      name: 'Hardware Wallet',
      description: 'Physical device for secure storage',
      icon: FiHardDrive,
      recommended: false
    },
    {
      id: 'imported',
      name: 'Import Existing',
      description: 'Import wallet from mnemonic phrase',
      icon: FiDownload,
      recommended: false
    }
  ]

  const blockchains = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'bsc', name: 'BSC', symbol: 'BNB' }
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 dark:text-white hover:text-neutral-900 dark:hover:text-orange-300 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Create Wallet</h1>
        <p className="text-neutral-600 dark:text-white mt-2">
          Add a new wallet to manage your cryptocurrency
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wallet Name */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-blue-300 dark:bg-clip-text mb-2">
            Wallet Name
          </label>
          <input
            type="text"
            required
            value={formData.walletName}
            onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
            placeholder="My Bitcoin Wallet"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Wallet Type */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-blue-300 dark:bg-clip-text mb-4">
            Wallet Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {walletTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, walletType: type.id as any })}
                className={`relative p-4 border rounded-lg text-left transition-all ${
                  formData.walletType === type.id
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-500/10'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-700'
                }`}
              >
                <div className="flex items-start">
                  <type.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-300 mt-1 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-white flex items-center">
                      {type.name}
                      {type.recommended && (
                        <span className="ml-2 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Blockchain */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-blue-300 dark:bg-clip-text mb-2">
            Blockchain
          </label>
          <select
            value={formData.blockchain}
            onChange={(e) => setFormData({ ...formData, blockchain: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {blockchains.map((blockchain) => (
              <option key={blockchain.id} value={blockchain.id}>
                {blockchain.name} ({blockchain.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Import Fields (only for imported wallets) */}
        {formData.walletType === 'imported' && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-4">Import Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Mnemonic Phrase
                </label>
                <input
                  type="text"
                  required
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter mnemonic phrase"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Your mnemonic phrase will be used to derive the wallet address and public key.
                </p>
              </div>
              {/* Advanced dropdown for derivation path */}
              <div>
                <button
                  type="button"
                  className="flex items-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline focus:outline-none"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  {showAdvanced ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                  Advanced
                </button>
                {showAdvanced && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Derivation Path (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.derivationPath || ''}
                      onChange={(e) => setFormData({ ...formData, derivationPath: e.target.value })}
                      placeholder="e.g. m/44'/60'/0'/0/0"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Leave blank for default path.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add password field for inbuilt/imported wallets */}
        {(formData.walletType === 'hot' || formData.walletType === 'imported') && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-blue-300 dark:bg-clip-text mb-2">
              Wallet Password
            </label>
            <input
              type="password"
              required
              value={walletPassword}
              onChange={(e) => setWalletPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              This password will be used to encrypt your wallet's private key.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
        </div>
      </form>
    </div>
  )
}