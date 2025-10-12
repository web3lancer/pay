/**
 * Authentication Helper Utilities
 * Based on Appwrite Functions documentation
 */

import { account, functions } from '@/lib/appwrite'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

// ============================================
// PASSKEY AUTHENTICATION
// ============================================

export interface PasskeyAuthOptions {
  email: string
  rpId?: string
  rpName?: string
}

export interface PasskeyAuthResult {
  success: boolean
  token?: {
    userId: string
    secret: string
  }
  error?: string
}

/**
 * Authenticate or register with passkey
 * Follows ignore1/function_appwrite_passkey/QUICKSTART.md
 */
export async function authenticateWithPasskey(
  options: PasskeyAuthOptions
): Promise<PasskeyAuthResult> {
  const { email, rpId: customRpId, rpName: customRpName } = options

  try {
    // Generate random challenge
    const challengeArray = crypto.getRandomValues(new Uint8Array(32))
    const challenge = btoa(String.fromCharCode(...challengeArray))

    // Get configuration from environment
    const rpId = customRpId || process.env.NEXT_PUBLIC_PASSKEY_RP_ID || window.location.hostname
    const rpName = customRpName || process.env.NEXT_PUBLIC_PASSKEY_RP_NAME || 'LancerPay'
    const functionId = process.env.NEXT_PUBLIC_PASSKEY_FUNCTION_ID

    if (!functionId) {
      return {
        success: false,
        error: 'Passkey authentication is not configured. Please contact support.'
      }
    }

    let credential
    let isRegistration = false

    // Try authentication first
    try {
      credential = await startAuthentication({
        challenge,
        rpId,
        timeout: 60000,
        userVerification: 'preferred',
      })
    } catch (authError: any) {
      // If authentication fails, try registration
      if (authError.name === 'NotAllowedError' || 
          authError.message?.includes('No credentials') ||
          authError.message?.includes('not found')) {
        isRegistration = true
        
        credential = await startRegistration({
          challenge,
          rp: {
            name: rpName,
            id: rpId,
          },
          user: {
            id: email,
            name: email,
            displayName: email,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        })
      } else {
        throw authError
      }
    }

    // Call Appwrite function with appropriate endpoint
    const endpoint = isRegistration ? '/register' : '/authenticate'
    const payload = isRegistration
      ? { email, credentialData: credential, challenge }
      : { email, assertion: credential, challenge }

    const execution = await functions.createExecution(
      functionId,
      JSON.stringify(payload),
      false,
      endpoint,
      'POST'
    )

    const result = JSON.parse(execution.responseBody)

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Authentication failed'
      }
    }

    // Create Appwrite session with the token
    await account.createSession(result.token.userId, result.token.secret)

    return {
      success: true,
      token: result.token
    }

  } catch (error: any) {
    console.error('Passkey authentication error:', error)
    
    let errorMessage = 'Passkey authentication failed'
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Passkey authentication was cancelled'
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Passkeys are not supported on this device/browser'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

// ============================================
// WEB3 WALLET AUTHENTICATION
// ============================================

export interface WalletAuthOptions {
  email: string
}

export interface WalletAuthResult {
  success: boolean
  userId?: string
  secret?: string
  error?: string
}

/**
 * Authenticate with Web3 wallet (MetaMask)
 * Follows ignore1/function_appwrite_web3/USAGE_NEXT.md
 */
export async function authenticateWithWallet(
  options: WalletAuthOptions
): Promise<WalletAuthResult> {
  const { email } = options

  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      return {
        success: false,
        error: 'MetaMask not installed. Please install MetaMask to continue.'
      }
    }

    // Connect wallet
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    })
    
    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No wallet account selected'
      }
    }

    const address = accounts[0]

    // Generate authentication message
    const timestamp = Date.now()
    const message = `auth-${timestamp}`
    const fullMessage = `Sign this message to authenticate: ${message}`

    // Request signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [fullMessage, address]
    })

    // Get function ID
    const functionId = process.env.NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID
    if (!functionId) {
      return {
        success: false,
        error: 'Web3 authentication is not configured. Please contact support.'
      }
    }

    // Call Appwrite Function
    const execution = await functions.createExecution(
      functionId,
      JSON.stringify({ email, address, signature, message }),
      false,
      '/',
      'POST'
    )

    const response = JSON.parse(execution.responseBody)

    if (execution.responseStatusCode !== 200) {
      return {
        success: false,
        error: response.error || 'Authentication failed'
      }
    }

    // Create Appwrite session
    await account.createSession(response.userId, response.secret)

    return {
      success: true,
      userId: response.userId,
      secret: response.secret
    }

  } catch (error: any) {
    console.error('Web3 authentication error:', error)
    
    let errorMessage = 'Authentication failed'
    
    if (error.code === 4001) {
      errorMessage = 'You rejected the signature request'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

// ============================================
// EMAIL OTP AUTHENTICATION
// ============================================

export interface EmailOTPSendOptions {
  email: string
}

export interface EmailOTPSendResult {
  success: boolean
  userId?: string
  error?: string
}

export interface EmailOTPVerifyOptions {
  userId: string
  otp: string
}

export interface EmailOTPVerifyResult {
  success: boolean
  error?: string
}

/**
 * Send email OTP
 * Uses Appwrite's built-in email token system
 */
export async function sendEmailOTP(
  options: EmailOTPSendOptions
): Promise<EmailOTPSendResult> {
  const { email } = options

  try {
    // Create email token (sends OTP to email)
    const token = await account.createEmailToken(email, email)
    
    return {
      success: true,
      userId: token.userId
    }
  } catch (error: any) {
    console.error('Send email OTP error:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to send OTP'
    }
  }
}

/**
 * Verify email OTP
 * Creates session after successful verification
 */
export async function verifyEmailOTP(
  options: EmailOTPVerifyOptions
): Promise<EmailOTPVerifyResult> {
  const { userId, otp } = options

  try {
    // Create session with OTP
    await account.createSession(userId, otp)
    
    return {
      success: true
    }
  } catch (error: any) {
    console.error('Verify email OTP error:', error)
    
    let errorMessage = 'Invalid code'
    
    if (error.message?.includes('Invalid')) {
      errorMessage = 'Invalid code. Please check and try again.'
    } else if (error.message?.includes('expired')) {
      errorMessage = 'Code has expired. Please request a new one.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.get()
    return true
  } catch {
    return false
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    return await account.get()
  } catch {
    return null
  }
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    await account.deleteSession('current')
    return { success: true }
  } catch (error: any) {
    console.error('Logout error:', error)
    return { 
      success: false, 
      error: error.message || 'Logout failed' 
    }
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

/**
 * Get MetaMask download link based on browser
 */
export function getMetaMaskDownloadLink(): string {
  if (typeof window === 'undefined') {
    return 'https://metamask.io/download/'
  }

  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('firefox')) {
    return 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'
  }
  
  if (userAgent.includes('chrome') || userAgent.includes('brave')) {
    return 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn'
  }
  
  return 'https://metamask.io/download/'
}

/**
 * Check if browser supports WebAuthn/Passkeys
 */
export function supportsWebAuthn(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.PublicKeyCredential !== 'undefined'
}
