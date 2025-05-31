'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCopy, FiCheck, FiShare2, FiExternalLink, FiCamera, FiUser } from 'react-icons/fi'
import QRCode from 'react-qr-code'
import { formatCryptoAmount } from '@/lib/utils'

interface PaymentProfileProps {
  username: string
  displayName: string
  profileImage?: string
  wallets: Array<{
    id: string
    name: string
    symbol: string
    address: string
    qrData: string
  }>
  web3lancerProfile?: string
  isOwnProfile?: boolean
}

export function PaymentProfile({ 
  username, 
  displayName, 
  profileImage, 
  wallets = [], 
  web3lancerProfile,
  isOwnProfile = false 
}: PaymentProfileProps) {
  const [selectedWallet, setSelectedWallet] = useState(wallets[0])
  const [copySuccess, setCopySuccess] = useState('')
  const [showBrowserWalletPrompt, setShowBrowserWalletPrompt] = useState(false)
  const [detectedWallets, setDetectedWallets] = useState<string[]>([])

  // Detect browser wallets
  useEffect(() => {
    const detectWallets = () => {
      const detected = []
      
      // Check for common wallet extensions
      if (typeof window !== 'undefined') {
        if ((window as any).ethereum) detected.push('MetaMask')
        if ((window as any).solana) detected.push('Phantom')
        if ((window as any).bitcoin) detected.push('Hiro')
        // Add more wallet detections as needed
      }
      
      setDetectedWallets(detected)
      
      // Show subtle prompt if wallets detected and not own profile
      if (detected.length > 0 && !isOwnProfile) {
        setTimeout(() => setShowBrowserWalletPrompt(true), 2000)
      }
    }

    detectWallets()
  }, [isOwnProfile])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopySuccess(address)
    setTimeout(() => setCopySuccess(''), 3000)
  }

  const handleShare = async () => {
    const shareData = {
      title: `Pay ${displayName}`,
      text: `Send crypto payments to ${displayName}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Fallback to copy URL
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleConnectWallet = () => {
    // Trigger wallet connection
    if ((window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_requestAccounts' })
    }
    setShowBrowserWalletPrompt(false)
  }

  const profileUrl = `https://pay.web3lancer.website/pay/${username}`
  const web3lancerUrl = web3lancerProfile ? `https://web3lancer.website/u/${username}` : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50">
      {/* Browser Wallet Detection Prompt */}
      {showBrowserWalletPrompt && !isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-primary-200 p-4 z-50 max-w-sm"
        >
          <div className="flex items-start">
            <FiUser className="h-5 w-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Wallet Detected</p>
              <p className="text-xs text-neutral-600 mt-1">
                Connect {detectedWallets.join(', ')} to pay instantly
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleConnectWallet}
                  className="text-xs px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                >
                  Connect
                </button>
                <button
                  onClick={() => setShowBrowserWalletPrompt(false)}
                  className="text-xs px-3 py-1 text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-600 text-2xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">{displayName}</h1>
                  <p className="text-neutral-600">@{username}</p>
                  {web3lancerUrl && (
                    <a
                      href={web3lancerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-1"
                    >
                      <FiExternalLink className="h-3 w-3 mr-1" />
                      View Freelancer Profile
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
                  title="Share Profile"
                >
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-lg p-4 text-center">
                <FiCamera className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-primary-900">Scan to Pay</p>
                <p className="text-xs text-primary-700">Use any wallet app</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <FiCopy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-900">Copy Address</p>
                <p className="text-xs text-green-700">Manual transfer</p>
              </div>
            </div>
          </div>

          {/* Wallet Selection */}
          {wallets.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Select Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedWallet?.id === wallet.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-neutral-900">{wallet.symbol}</p>
                      <p className="text-sm text-neutral-600">{wallet.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Interface */}
          {selectedWallet && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Scan QR Code
                </h2>
                
                <div className="text-center">
                  <div className="bg-white p-6 rounded-lg mx-auto w-fit shadow-inner border">
                    <QRCode 
                      value={selectedWallet.qrData}
                      size={200}
                      className="mx-auto"
                    />
                  </div>
                  
                  <p className="text-sm text-neutral-600 mt-4">
                    Scan with any {selectedWallet.symbol} wallet
                  </p>
                  
                  <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Address</p>
                    <p className="text-sm font-mono text-neutral-900 break-all">
                      {selectedWallet.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Transfer */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Manual Transfer
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {selectedWallet.symbol} Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedWallet.address}
                        readOnly
                        className="w-full p-3 pr-12 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-mono"
                      />
                      <button
                        onClick={() => handleCopyAddress(selectedWallet.address)}
                        className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                        title="Copy Address"
                      >
                        {copySuccess === selectedWallet.address ? (
                          <FiCheck className="text-green-500" />
                        ) : (
                          <FiCopy />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> Only send {selectedWallet.symbol} to this address. 
                      Sending other cryptocurrencies may result in permanent loss.
                    </p>
                  </div>

                  {/* Network Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Network</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedWallet.symbol === 'BTC' ? 'Bitcoin' : 
                         selectedWallet.symbol === 'ETH' ? 'Ethereum' : 
                         selectedWallet.symbol === 'USDC' ? 'Ethereum (ERC-20)' : 
                         'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Confirmations</span>
                      <span className="text-neutral-900 font-medium">
                        {selectedWallet.symbol === 'BTC' ? '1-3 blocks' : '12-15 blocks'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-neutral-500">
            <p>
              Powered by{' '}
              <a 
                href="https://web3lancer.website" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                Web3Lancer
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}