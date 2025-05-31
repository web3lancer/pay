'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { AppShell } from '@/components/AppShell'
import { generateWalletAddressQR } from '@/lib/qr'
import { FiCopy, FiCheck, FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi'
import Link from 'next/link'

export default function ReceivePage() {
  const { user } = useAuth()
  const { wallets, isLoading } = useWallet()
  const { getRate } = useExchangeRate()
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const selectedWallet = wallets.find(w => w.walletId === selectedWalletId)

  const handleWalletSelect = async (walletId: string) => {
    setSelectedWalletId(walletId)
    const wallet = wallets.find(w => w.walletId === walletId)
    if (wallet) {
      const qrUrl = await generateWalletAddressQR(wallet.address, wallet.blockchain.toUpperCase())
      setQrCodeUrl(qrUrl)
    }
  }

  const copyAddress = async () => {
    if (selectedWallet) {
      try {
        await navigator.clipboard.writeText(selectedWallet.address)
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const shareAddress = async () => {
    if (selectedWallet && navigator.share) {
      try {
        await navigator.share({
          title: `${selectedWallet.blockchain.toUpperCase()} Wallet Address`,
          text: `Send ${selectedWallet.blockchain.toUpperCase()} to this address:`,
          url: selectedWallet.address
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    }
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Please Sign In</h1>
            <p className="text-neutral-600">You need to sign in to receive money</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Receive Money</h1>
              <p className="text-neutral-600">Share your wallet address to receive payments</p>
            </div>
          </div>
          <FiDownload className="w-8 h-8 text-cyan-600" />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Wallet Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Select Wallet</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="text-neutral-500 mt-4">Loading wallets...</p>
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No wallets found</p>
                <Link
                  href="/wallets/create"
                  className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Create Wallet
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {wallets.map((wallet) => {
                  const rate = getRate(wallet.blockchain)
                  const balance = parseFloat(wallet.balance?.toString() || '0')
                  
                  return (
                    <button
                      key={wallet.walletId}
                      onClick={() => handleWalletSelect(wallet.walletId)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedWalletId === wallet.walletId
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-neutral-900">
                            {wallet.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {wallet.blockchain.toUpperCase()} • {wallet.address.slice(0, 12)}...
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-neutral-900">
                            {balance.toFixed(4)} {wallet.blockchain.toUpperCase()}
                          </div>
                          {rate && (
                            <div className="text-sm text-neutral-500">
                              ${(balance * rate.price_usd).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Wallet Details */}
          {selectedWallet && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Receive {selectedWallet.blockchain.toUpperCase()}
              </h2>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center mb-6">
                  <img 
                    src={qrCodeUrl} 
                    alt="Wallet Address QR Code" 
                    className="mx-auto border border-neutral-200 rounded-lg"
                    width={200}
                    height={200}
                  />
                  <p className="text-sm text-neutral-600 mt-2">
                    Scan this QR code to get the wallet address
                  </p>
                </div>
              )}

              {/* Address Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm break-all">
                    {selectedWallet.address}
                  </div>
                  <button
                    onClick={copyAddress}
                    className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <FiCopy className="w-5 h-5" />
                    )}
                  </button>
                  {navigator.share && (
                    <button
                      onClick={shareAddress}
                      className="p-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                      title="Share address"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {copiedAddress && (
                  <p className="text-sm text-green-600 mt-2">Address copied to clipboard!</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-cyan-50 rounded-lg p-4">
                <h3 className="font-medium text-cyan-900 mb-2">How to receive payments:</h3>
                <ol className="text-sm text-cyan-800 space-y-1">
                  <li>1. Share this address with the sender</li>
                  <li>2. Or let them scan the QR code</li>
                  <li>3. They can send {selectedWallet.blockchain.toUpperCase()} to this address</li>
                  <li>4. Transactions will appear in your wallet shortly</li>
                </ol>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Security tip:</strong> This address can be safely shared publicly. 
                  Only send {selectedWallet.blockchain.toUpperCase()} tokens to this address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}