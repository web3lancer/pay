'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCamera, FiUpload, FiArrowLeft, FiUser, FiDollarSign } from 'react-icons/fi'
import { QRScanner } from '@/components/scanner/QRScanner'
import { AppShell } from '@/components/layout/AppShell'

interface ScannedData {
  type: 'address' | 'payment_request' | 'profile' | 'unknown'
  address?: string
  amount?: string
  currency?: string
  username?: string
  message?: string
  raw: string
}

export function ScanClient() {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const parseQRData = (data: string): ScannedData => {
    try {
      // Payment request format: bitcoin:address?amount=0.001&message=payment
      if (data.includes(':') && data.includes('?')) {
        const [protocol, rest] = data.split(':')
        const [address, queryString] = rest.split('?')
        const params = new URLSearchParams(queryString)
        
        return {
          type: 'payment_request',
          address,
          amount: params.get('amount') || undefined,
          currency: protocol.toUpperCase(),
          message: params.get('message') || undefined,
          raw: data
        }
      }
      
      // Simple address format: bitcoin:address or just address
      if (data.includes(':')) {
        const [protocol, address] = data.split(':')
        return {
          type: 'address',
          address,
          currency: protocol.toUpperCase(),
          raw: data
        }
      }

      // Profile URL format: https://pay.web3lancer.website/pay/username
      if (data.includes('pay.web3lancer.website/pay/')) {
        const username = data.split('/pay/')[1]?.split('?')[0]
        return {
          type: 'profile',
          username,
          raw: data
        }
      }

      // Direct address (assume Bitcoin if looks like valid address)
      if (data.length > 25 && data.length < 100) {
        return {
          type: 'address',
          address: data,
          currency: 'BTC', // Default assumption
          raw: data
        }
      }

      return {
        type: 'unknown',
        raw: data
      }
    } catch {
      return {
        type: 'unknown',
        raw: data
      }
    }
  }

  const handleScan = (data: string) => {
    setIsProcessing(true)
    const parsed = parseQRData(data)
    setScannedData(parsed)
    setShowScanner(false)
    
    // Auto-navigate for certain types
    setTimeout(() => {
      setIsProcessing(false)
      
      if (parsed.type === 'profile' && parsed.username) {
        router.push(`/pay/${parsed.username}`)
      } else if (parsed.type === 'payment_request' || parsed.type === 'address') {
        // Navigate to send page with pre-filled data
        const params = new URLSearchParams()
        if (parsed.address) params.set('to', parsed.address)
        if (parsed.amount) params.set('amount', parsed.amount)
        if (parsed.currency) params.set('currency', parsed.currency)
        if (parsed.message) params.set('message', parsed.message)
        
        router.push(`/send?${params.toString()}`)
      }
    }, 1000)
  }

  const handleManualEntry = () => {
    // Could open a modal for manual address entry
    router.push('/send')
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Scan to Pay</h1>
              <p className="text-sm text-neutral-500">Scan QR codes to send payments or visit profiles</p>
            </div>
          </div>

          {/* Scan Options */}
          {!scannedData && !isProcessing && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Scan QR Code</h2>
                <p className="text-neutral-600 mb-6">
                  Scan any crypto payment QR code or user profile to get started
                </p>
                
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FiCamera className="mr-2 h-5 w-5" />
                  Open Camera Scanner
                </button>
              </div>

              {/* What You Can Scan */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">What you can scan:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 rounded-lg p-2 mr-3">
                      <FiDollarSign className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Payment Requests</p>
                      <p className="text-sm text-neutral-600">QR codes with amount and recipient</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-lg p-2 mr-3">
                      <FiUser className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">User Profiles</p>
                      <p className="text-sm text-neutral-600">Links to payment profiles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="text-center">
                <p className="text-neutral-600 mb-4">Can't scan? Enter details manually</p>
                <button
                  onClick={handleManualEntry}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Enter Address Manually
                </button>
              </div>
            </>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processing QR Code</h3>
              <p className="text-neutral-600">Analyzing scanned data...</p>
            </div>
          )}

          {/* Scanned Result */}
          {scannedData && !isProcessing && (
            <div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Scanned Successfully</h3>
              
              {scannedData.type === 'payment_request' && (
                <div className="space-y-3">
                  <p className="text-neutral-600">Payment Request Detected</p>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Address:</span>
                      <span className="font-mono text-sm">{scannedData.address?.slice(0, 20)}...</span>
                    </div>
                    {scannedData.amount && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Amount:</span>
                        <span className="font-medium">{scannedData.amount} {scannedData.currency}</span>
                      </div>
                    )}
                    {scannedData.message && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Message:</span>
                        <span>{scannedData.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scannedData.type === 'profile' && (
                <div className="space-y-3">
                  <p className="text-neutral-600">User Profile Detected</p>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Username:</span>
                      <span className="font-medium">@{scannedData.username}</span>
                    </div>
                  </div>
                </div>
              )}

              {scannedData.type === 'address' && (
                <div className="space-y-3">
                  <p className="text-neutral-600">Crypto Address Detected</p>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Currency:</span>
                      <span className="font-medium">{scannedData.currency}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-neutral-600">Address:</span>
                      <span className="font-mono text-sm">{scannedData.address?.slice(0, 20)}...</span>
                    </div>
                  </div>
                </div>
              )}

              {scannedData.type === 'unknown' && (
                <div className="space-y-3">
                  <p className="text-red-600">Unrecognized QR Code</p>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      The scanned QR code format is not recognized. Please try again with a valid payment QR code.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Scan Again
                </button>
                {scannedData.type !== 'unknown' && (
                  <button
                    onClick={() => {
                      if (scannedData.type === 'profile' && scannedData.username) {
                        router.push(`/pay/${scannedData.username}`)
                      } else {
                        const params = new URLSearchParams()
                        if (scannedData.address) params.set('to', scannedData.address)
                        if (scannedData.amount) params.set('amount', scannedData.amount)
                        if (scannedData.currency) params.set('currency', scannedData.currency)
                        if (scannedData.message) params.set('message', scannedData.message)
                        router.push(`/send?${params.toString()}`)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Scan Payment QR Code"
      />
    </AppShell>
  )
}