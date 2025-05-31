'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { AppShell } from '@/components/AppShell'
import { FiArrowLeft, FiCreditCard, FiHardDrive, FiDatabase, FiDownload, FiAlertCircle } from 'react-icons/fi'
import Link from 'next/link'

export default function CreateWalletPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createWallet } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    walletName: '',
    walletType: 'hot' as 'hot' | 'cold' | 'hardware' | 'imported',
    blockchain: 'bitcoin',
    walletAddress: '',
    publicKey: '',
    encryptedPrivateKey: '',
    derivationPath: ''
  })

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
      privateKey: 'priv_' + Math.random().toString(36).substring(2, 34)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      let walletData = { ...formData }

      // Generate wallet if creating new hot wallet
      if (formData.walletType === 'hot' && !formData.walletAddress) {
        const generated = generateMockWallet(formData.blockchain)
        walletData = {
          ...formData,
          walletAddress: generated.address,
          publicKey: generated.publicKey,
          encryptedPrivateKey: generated.privateKey // In real app, encrypt this
        }
      }

      await createWallet(walletData)
      router.push('/')
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
      description: 'Import wallet from private key/seed',
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
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">Create Wallet</h1>
          <p className="text-neutral-600 mt-2">
            Add a new wallet to manage your cryptocurrency
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Name */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Wallet Name
            </label>
            <input
              type="text"
              required
              value={formData.walletName}
              onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
              placeholder="My Bitcoin Wallet"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Wallet Type */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-4">
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
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start">
                    <type.icon className="w-5 h-5 text-neutral-600 mt-1 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 flex items-center">
                        {type.name}
                        {type.recommended && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Blockchain */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Blockchain
            </label>
            <select
              value={formData.blockchain}
              onChange={(e) => setFormData({ ...formData, blockchain: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Import Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    placeholder="Enter wallet address"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Private Key (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.encryptedPrivateKey}
                    onChange={(e) => setFormData({ ...formData, encryptedPrivateKey: e.target.value })}
                    placeholder="Enter private key for sending transactions"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Private key will be encrypted and stored securely
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Wallet'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}