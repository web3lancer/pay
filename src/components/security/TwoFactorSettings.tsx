// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/components/security/TwoFactorSettings.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FiShield, FiKey, FiSmartphone, FiDownload, FiCheck, FiX, FiLoader } from 'react-icons/fi'

interface TwoFactorSettingsProps {
  onClose?: () => void
}

export function TwoFactorSettings({ onClose }: TwoFactorSettingsProps) {
  const { user, userProfile, enableTwoFactor, disableTwoFactor, verifyTwoFactor, createRecoveryCodes } = useAuth()
  const [step, setStep] = useState<'overview' | 'setup' | 'verify' | 'recovery' | 'disable'>('overview')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isEnabled = userProfile?.twoFactorEnabled || false

  useEffect(() => {
    if (step === 'setup') {
      generateQRCode()
    }
  }, [step])

  const generateQRCode = async () => {
    if (!user) return
    
    try {
      // Generate secret key
      const secret = generateSecretKey()
      setSecretKey(secret)
      
      // Create QR code URL for authenticator apps
      const appName = 'Pay by Web3Lancer'
      const userEmail = user.email
      const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      setError('Failed to generate QR code')
    }
  }

  const generateSecretKey = (): string => {
    // Generate a base32 secret key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const handleEnable2FA = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await verifyTwoFactor(verificationCode)
      await enableTwoFactor()
      setSuccess('Two-factor authentication enabled successfully!')
      setStep('recovery')
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!verificationCode) {
      setError('Please enter your current 2FA code to disable')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await verifyTwoFactor(verificationCode)
      await disableTwoFactor()
      setSuccess('Two-factor authentication disabled successfully!')
      setStep('overview')
      setVerificationCode('')
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRecoveryCodes = async () => {
    setIsLoading(true)
    try {
      const codes = await createRecoveryCodes()
      setRecoveryCodes(codes)
      setSuccess('Recovery codes generated successfully!')
    } catch (error) {
      console.error('Failed to generate recovery codes:', error)
      setError('Failed to generate recovery codes')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'web3lancer-recovery-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${
          isEnabled ? 'bg-green-100' : 'bg-neutral-100'
        } mb-4`}>
          <FiShield className={`h-8 w-8 ${isEnabled ? 'text-green-600' : 'text-neutral-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-neutral-600">
          {isEnabled 
            ? 'Your account is protected with 2FA' 
            : 'Add an extra layer of security to your account'
          }
        </p>
      </div>

      <div className="bg-neutral-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiShield className="h-5 w-5 text-cyan-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">Enhanced Security</h4>
            <p className="text-sm text-neutral-600">
              Protect your crypto assets with time-based one-time passwords (TOTP) 
              using apps like Google Authenticator or Authy.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!isEnabled ? (
          <button
            onClick={() => setStep('setup')}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Enable 2FA
          </button>
        ) : (
          <>
            <button
              onClick={() => setStep('recovery')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Recovery Codes
            </button>
            <button
              onClick={() => setStep('disable')}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Disable 2FA
            </button>
          </>
        )}
      </div>
    </div>
  )

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Set up Two-Factor Authentication
        </h3>
        <p className="text-neutral-600">
          Scan the QR code with your authenticator app
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border text-center">
        {qrCodeUrl && (
          <div className="mb-4">
            <QRCode value={qrCodeUrl} size={200} />
          </div>
        )}
        
        <p className="text-sm text-neutral-600 mb-2">Can't scan? Enter this key manually:</p>
        <code className="bg-neutral-100 px-3 py-1 rounded text-sm font-mono break-all">
          {secretKey}
        </code>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center text-lg font-mono"
          maxLength={6}
        />
        <p className="text-xs text-neutral-500 mt-1">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleEnable2FA}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Enable 2FA'
          )}
        </button>
      </div>
    </div>
  )

  const renderRecovery = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Recovery Codes
        </h3>
        <p className="text-neutral-600">
          Save these codes in a secure location. You can use them to access your account if you lose your device.
        </p>
      </div>

      {recoveryCodes.length > 0 ? (
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {recoveryCodes.map((code, index) => (
              <code key={index} className="bg-white px-3 py-2 rounded border text-sm font-mono text-center">
                {code}
              </code>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadRecoveryCodes}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              Download Codes
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={handleGenerateRecoveryCodes}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-300 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FiKey className="h-4 w-4" />
                Generate Recovery Codes
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )

  const renderDisable = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <FiX className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Disable Two-Factor Authentication
        </h3>
        <p className="text-neutral-600">
          This will remove the extra layer of security from your account
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiShield className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-1">Security Warning</h4>
            <p className="text-sm text-red-700">
              Disabling 2FA will make your account less secure. Make sure your password is strong and unique.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Current 2FA Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center text-lg font-mono"
          maxLength={6}
        />
        <p className="text-xs text-neutral-500 mt-1">
          Enter your current 2FA code to confirm
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDisable2FA}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-neutral-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <FiLoader className="h-4 w-4 animate-spin" />
              Disabling...
            </>
          ) : (
            'Disable 2FA'
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      {/* Error/Success Messages */}
      <>
        {error && (
          <div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <FiX className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <FiCheck className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

      {/* Main Content */}
        <div key={step}>
          {step === 'overview' && renderOverview()}
          {step === 'setup' && renderSetup()}
          {step === 'recovery' && renderRecovery()}
          {step === 'disable' && renderDisable()}
        </div>
    </div>
  )
}

export default TwoFactorSettings