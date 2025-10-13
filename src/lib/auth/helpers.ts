/**
 * Authentication Helper Utilities
 * Using SimplePasskeyAuth with separate register/authenticate methods (POC pattern)
 */

import { account, functions } from '@/lib/appwrite'
import { SimplePasskeyAuth } from '@/lib/simple-passkeys'

// ============================================
// PASSKEY AUTHENTICATION
// Uses SimplePasskeyAuth class with Next.js API routes
// No Appwrite Functions required
// Separate methods for registration and authentication
// ============================================

export interface PasskeyAuthOptions {
  email: string
}

export interface PasskeyAuthResult {
  success: boolean
  token?: {
    userId: string
    secret: string
  }
  error?: string
  code?: 'no_passkey' | 'cancelled' | 'not_supported' | 'verification_failed' | 'server_error' | 'wallet_conflict'
}

/**
 * Register a new passkey for the user
 */
export async function registerPasskey(
  options: PasskeyAuthOptions
): Promise<PasskeyAuthResult> {
  const { email } = options

  // Check browser support FIRST
  if (!supportsWebAuthn()) {
    console.error('❌ Browser does not support WebAuthn')
    return {
      success: false,
      error: 'Your browser does not support passkeys',
      code: 'not_supported'
    }
  }

  try {
    const passkeyAuth = new SimplePasskeyAuth();
    
    console.log('📝 Registering passkey for:', email);
    const result = await passkeyAuth.register(email);
    
    if (result.success) {
      console.log('✅ Passkey registration successful');
      return {
        success: true,
        token: result.token
      };
    }
    
    return {
      success: false,
      error: result.error || 'Registration failed',
      code: 'verification_failed'
    };
    
  } catch (error: any) {
    console.error('❌ Passkey registration error:', error);
    
    // Handle specific WebAuthn errors
    if (error.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Passkey registration was cancelled or timed out',
        code: 'cancelled'
      };
    }
    
    if (error.name === 'NotSupportedError') {
      return {
        success: false,
        error: 'Passkeys are not supported on this device or browser',
        code: 'not_supported'
      };
    }
    
    // Generic error
    return {
      success: false,
      error: error.message || 'Passkey registration failed. Please try again.',
      code: 'server_error'
    };
  }
}

/**
 * Authenticate with an existing passkey
 */
export async function authenticateWithPasskey(
  options: PasskeyAuthOptions
): Promise<PasskeyAuthResult> {
  const { email } = options

  // Check browser support FIRST
  if (!supportsWebAuthn()) {
    console.error('❌ Browser does not support WebAuthn')
    return {
      success: false,
      error: 'Your browser does not support passkeys',
      code: 'not_supported'
    }
  }

  try {
    const passkeyAuth = new SimplePasskeyAuth();
    
    console.log('🔐 Authenticating passkey for:', email);
    const result = await passkeyAuth.authenticate(email);
    
    if (result.success) {
      console.log('✅ Passkey authentication successful');
      return {
        success: true,
        token: result.token
      };
    }
    
    return {
      success: false,
      error: result.error || 'Authentication failed',
      code: 'verification_failed'
    };
    
  } catch (error: any) {
    console.error('❌ Passkey authentication error:', error);
    
    // Handle specific WebAuthn errors
    if (error.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Passkey authentication was cancelled or timed out',
        code: 'cancelled'
      };
    }
    
    if (error.name === 'NotSupportedError') {
      return {
        success: false,
        error: 'Passkeys are not supported on this device or browser',
        code: 'not_supported'
      };
    }
    
    // Generic error
    return {
      success: false,
      error: error.message || 'Passkey authentication failed. Please try again.',
      code: 'server_error'
    };
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
  code?: 'metamask_not_installed' | 'no_account' | 'signature_rejected' | 'passkey_conflict' | 'wallet_mismatch' | 'account_exists' | 'invalid_signature' | 'server_error'
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
        error: 'MetaMask not installed. Please install MetaMask to continue.',
        code: 'metamask_not_installed'
      }
    }

    // Connect wallet
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    })
    
    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No wallet account selected',
        code: 'no_account'
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
        error: 'Web3 authentication is not configured. Please contact support.',
        code: 'server_error'
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
      let errorCode: WalletAuthResult['code'] = 'server_error'
      
      // Map HTTP status codes to error codes
      if (execution.responseStatusCode === 401) {
        errorCode = 'invalid_signature'
      } else if (execution.responseStatusCode === 403) {
        if (response.error?.includes('passkey')) {
          errorCode = 'passkey_conflict'
        } else if (response.error?.includes('different wallet')) {
          errorCode = 'wallet_mismatch'
        } else if (response.error?.includes('Account already exists')) {
          errorCode = 'account_exists'
        }
      }
      
      return {
        success: false,
        error: response.error || 'Authentication failed',
        code: errorCode
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
    let errorCode: WalletAuthResult['code'] = 'server_error'
    
    if (error.code === 4001) {
      errorMessage = 'You rejected the signature request'
      errorCode = 'signature_rejected'
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode
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
