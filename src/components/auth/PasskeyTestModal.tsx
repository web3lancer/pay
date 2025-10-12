/**
 * MINIMAL Passkey Test Modal
 * Following USAGE.md lines 392-571 EXACTLY
 * NO complexity, NO abstractions, DIRECT calls only
 */

'use client'

import React, { useState } from 'react'
import { functions, account } from '@/lib/appwrite'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

interface PasskeyTestModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PasskeyTestModal({ isOpen, onClose }: PasskeyTestModalProps) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handlePasskeyClick = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      setMessage('❌ Please enter a valid email')
      return
    }

    // Check browser support
    if (!window.PublicKeyCredential) {
      setMessage('❌ Your browser does not support passkeys')
      return
    }

    setLoading(true)
    setMessage('⏳ Processing...')

    const functionId = process.env.NEXT_PUBLIC_PASSKEY_FUNCTION_ID

    if (!functionId) {
      setMessage('❌ Function ID not configured')
      setLoading(false)
      return
    }

    try {
      console.log('=== PASSKEY TEST START ===')
      console.log('Email:', email)
      console.log('Function ID:', functionId)

      // Step 1: Get options
      console.log('Step 1: Getting auth options...')
      setMessage('Step 1: Checking for existing passkeys...')
      
      const optionsExec = await functions.createExecution(
        functionId,
        JSON.stringify({ userId: email }),
        false,
        '/auth/options',
        'POST'
      )
      
      console.log('Options execution status:', optionsExec.responseStatusCode)
      console.log('Options response:', optionsExec.responseBody)
      
      const options = JSON.parse(optionsExec.responseBody)
      
      // Check if user has passkeys
      if (!options.allowCredentials || options.allowCredentials.length === 0) {
        // ===== REGISTRATION FLOW =====
        console.log('No passkeys found. Starting REGISTRATION...')
        setMessage('Step 2: Creating new passkey...')
        
        // Get registration options
        console.log('Getting registration options...')
        const regExec = await functions.createExecution(
          functionId,
          JSON.stringify({ userId: email, userName: email.split('@')[0] }),
          false,
          '/register/options',
          'POST'
        )
        
        console.log('Registration options status:', regExec.responseStatusCode)
        console.log('Registration options:', regExec.responseBody)
        
        const regOptions = JSON.parse(regExec.responseBody)
        
        // ⚠️⚠️⚠️ THIS IS THE CRITICAL LINE ⚠️⚠️⚠️
        console.log('🚨🚨🚨 CALLING startRegistration() NOW 🚨🚨🚨')
        console.log('About to call startRegistration with options:', regOptions)
        setMessage('👆 TOUCH YOUR DEVICE TO CREATE PASSKEY')
        
        const credential = await startRegistration(regOptions)
        
        console.log('✅ GOT CREDENTIAL FROM BROWSER:', credential)
        setMessage('Step 3: Verifying credential...')
        
        // Verify
        const verifyExec = await functions.createExecution(
          functionId,
          JSON.stringify({
            userId: email,
            attestation: credential,
            challenge: regOptions.challenge,
            challengeToken: regOptions.challengeToken
          }),
          false,
          '/register/verify',
          'POST'
        )
        
        console.log('Verify status:', verifyExec.responseStatusCode)
        console.log('Verify response:', verifyExec.responseBody)
        
        const result = JSON.parse(verifyExec.responseBody)
        
        if (result.token?.secret) {
          await account.createSession(result.token.userId, result.token.secret)
          setMessage('✅ Passkey created and logged in!')
          setTimeout(() => window.location.href = '/home', 1000)
        } else {
          setMessage('❌ No token received')
        }
        
      } else {
        // ===== AUTHENTICATION FLOW =====
        console.log('Passkeys found. Starting AUTHENTICATION...')
        setMessage('Step 2: Authenticating with passkey...')
        
        // ⚠️⚠️⚠️ THIS IS THE CRITICAL LINE ⚠️⚠️⚠️
        console.log('🚨🚨🚨 CALLING startAuthentication() NOW 🚨🚨🚨')
        console.log('About to call startAuthentication with options:', options)
        setMessage('👆 TOUCH YOUR DEVICE TO AUTHENTICATE')
        
        const assertion = await startAuthentication(options)
        
        console.log('✅ GOT ASSERTION FROM BROWSER:', assertion)
        setMessage('Step 3: Verifying assertion...')
        
        // Verify
        const verifyExec = await functions.createExecution(
          functionId,
          JSON.stringify({
            userId: email,
            assertion,
            challenge: options.challenge,
            challengeToken: options.challengeToken
          }),
          false,
          '/auth/verify',
          'POST'
        )
        
        console.log('Verify status:', verifyExec.responseStatusCode)
        console.log('Verify response:', verifyExec.responseBody)
        
        const result = JSON.parse(verifyExec.responseBody)
        
        if (result.token?.secret) {
          await account.createSession(result.token.userId, result.token.secret)
          setMessage('✅ Authenticated successfully!')
          setTimeout(() => window.location.href = '/home', 1000)
        } else {
          setMessage('❌ No token received')
        }
      }
      
    } catch (error: any) {
      console.error('❌❌❌ ERROR:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.name === 'NotAllowedError') {
        setMessage('❌ Cancelled or timed out')
      } else {
        setMessage(`❌ Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
      console.log('=== PASSKEY TEST END ===')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">🔐 Passkey Test</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handlePasskeyClick}
            disabled={loading || !email}
            className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Processing...' : '🔐 Test Passkey'}
          </button>
          
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('❌') ? 'bg-red-50 text-red-800' :
              message.includes('✅') ? 'bg-green-50 text-green-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Open browser console (F12) to see detailed logs</p>
            <p>• Look for 🚨 CALLING startRegistration/Authentication</p>
            <p>• Browser passkey prompt should appear immediately after</p>
          </div>
          
          {!loading && (
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
