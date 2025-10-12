/**
 * Authentication Helper Utilities
 * Based on Appwrite Functions documentation
 */

import { account, functions } from '@/lib/appwrite'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

// ============================================
// PASSKEY AUTHENTICATION (Two-Step Flow)
// Follows ignore1/function_appwrite_passkey/USAGE.md EXACTLY
// Uses SimpleWebAuthn for automatic ArrayBuffer conversions
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
  isRegistration?: boolean // Track if this was a registration or authentication
}

/**
 * Unified "Continue with Passkey" flow
 * Follows the EXACT pattern from USAGE.md Example 5 (lines 595-694)
 * Single button that intelligently handles both registration and authentication
 * 
 * CRITICAL: This function must complete WITHOUT any external interference
 * No hooks, no state resets, no interruptions during execution
 */
export async function authenticateWithPasskey(
  options: PasskeyAuthOptions
): Promise<PasskeyAuthResult> {
  const { email } = options
  const functionId = process.env.NEXT_PUBLIC_PASSKEY_FUNCTION_ID

  if (!functionId) {
    console.error('❌ Passkey function ID not configured')
    return {
      success: false,
      error: 'Passkey function not configured. Please contact support.',
      code: 'server_error'
    }
  }

  // Check browser support FIRST (USAGE.md lines 167-186)
  if (!supportsWebAuthn()) {
    console.error('❌ Browser does not support WebAuthn')
    return {
      success: false,
      error: 'Your browser does not support passkeys',
      code: 'not_supported'
    }
  }

  try {
    console.log('🔐 Step 1: Checking if user has existing passkeys for:', email)
    
    // Step 1: Try to get auth options (check if user has passkeys)
    const authExec = await functions.createExecution(
      functionId,
      JSON.stringify({ userId: email }),
      false,
      '/auth/options',
      'POST'
    )
    
    const authOptions = JSON.parse(authExec.responseBody)
    console.log('📋 Got auth options:', { 
      hasCredentials: authOptions.allowCredentials?.length > 0,
      credentialCount: authOptions.allowCredentials?.length || 0
    })
    
    // Step 2: Check if user has existing passkeys
    if (authOptions.allowCredentials?.length > 0) {
      // ============================================
      // AUTHENTICATION FLOW (User has passkeys)
      // ============================================
      console.log('🔓 Step 2: User has passkeys, attempting authentication...')
      
      // Step 2a: Show browser passkey prompt for authentication
      // ⚠️ THIS IS THE CRITICAL LINE - This shows the prompt!
      console.log('👆 Step 2a: Calling startAuthentication() - passkey prompt will show now')
      const assertion = await startAuthentication(authOptions)
      console.log('✅ User provided assertion')
      
      // Step 2b: Verify the assertion with server
      console.log('📤 Step 2b: Verifying assertion with server...')
      const verifyExec = await functions.createExecution(
        functionId,
        JSON.stringify({
          userId: email,
          assertion,
          challenge: authOptions.challenge,
          challengeToken: authOptions.challengeToken
        }),
        false,
        '/auth/verify',
        'POST'
      )
      
      const authResult = JSON.parse(verifyExec.responseBody)
      console.log('📥 Verification result:', { 
        hasToken: !!authResult.token,
        success: !!authResult.token?.secret 
      })
      
      // Step 2c: Create Appwrite session
      if (authResult.token?.secret) {
        console.log('🎫 Step 2c: Creating Appwrite session...')
        await account.createSession(authResult.token.userId, authResult.token.secret)
        console.log('✅ SUCCESS! User authenticated with passkey')
        return {
          success: true,
          token: authResult.token,
          isRegistration: false
        }
      } else {
        console.error('❌ No token received from server')
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
          code: 'verification_failed'
        }
      }
      
    } else {
      // ============================================
      // REGISTRATION FLOW (New user, no passkeys)
      // ============================================
      console.log('📝 Step 3: No passkeys found, attempting registration...')
      
      // Step 3a: Get registration options
      console.log('📋 Step 3a: Getting registration options...')
      const regExec = await functions.createExecution(
        functionId,
        JSON.stringify({ 
          userId: email, 
          userName: email.split('@')[0] 
        }),
        false,
        '/register/options',
        'POST'
      )
      
      const regOptions = JSON.parse(regExec.responseBody)
      console.log('📋 Got registration options')
      
      // Step 3b: Show browser passkey prompt for registration
      // ⚠️ THIS IS THE CRITICAL LINE - This shows the prompt!
      console.log('👆 Step 3b: Calling startRegistration() - passkey prompt will show now')
      const credential = await startRegistration(regOptions)
      console.log('✅ User created credential')
      
      // Step 3c: Verify the credential with server
      console.log('📤 Step 3c: Verifying credential with server...')
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
      
      const regResult = JSON.parse(verifyExec.responseBody)
      console.log('📥 Verification result:', { 
        hasToken: !!regResult.token,
        success: !!regResult.token?.secret 
      })
      
      // Step 3d: Create Appwrite session
      if (regResult.token?.secret) {
        console.log('🎫 Step 3d: Creating Appwrite session...')
        await account.createSession(regResult.token.userId, regResult.token.secret)
        console.log('✅ SUCCESS! User registered and logged in with passkey')
        return {
          success: true,
          token: regResult.token,
          isRegistration: true
        }
      } else {
        console.error('❌ No token received from server')
        return {
          success: false,
          error: regResult.error || 'Registration failed',
          code: 'verification_failed'
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ Passkey error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    })
    
    // Handle specific WebAuthn errors (USAGE.md lines 706-741)
    if (error.name === 'NotAllowedError') {
      console.log('User cancelled or timeout')
      return {
        success: false,
        error: 'Passkey authentication was cancelled or timed out',
        code: 'cancelled'
      }
    }
    
    if (error.name === 'NotSupportedError') {
      console.log('WebAuthn not supported')
      return {
        success: false,
        error: 'Passkeys are not supported on this device or browser',
        code: 'not_supported'
      }
    }
    
    // Handle server errors
    if (error.message?.includes('wallet')) {
      console.log('Wallet conflict error')
      return {
        success: false,
        error: error.message,
        code: 'wallet_conflict'
      }
    }
    
    if (error.message?.includes('Too many')) {
      console.log('Rate limit error')
      return {
        success: false,
        error: 'Too many attempts. Please wait a moment and try again.',
        code: 'server_error'
      }
    }
    
    // Generic error
    console.error('Unknown error during passkey flow')
    return {
      success: false,
      error: error.message || 'Passkey authentication failed. Please try again.',
      code: 'server_error'
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
