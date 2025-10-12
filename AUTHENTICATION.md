# Authentication Implementation Guide

This document describes the corrected authentication implementation for the LancerPay application, following the official Appwrite Functions documentation patterns.

## Overview

The authentication system supports three methods:
1. **Passkey Authentication** - WebAuthn/FIDO2 biometric authentication
2. **Web3 Wallet Authentication** - MetaMask and other Web3 wallets
3. **Email OTP Authentication** - One-time password sent via email

## Architecture

### Files Structure

```
src/
├── lib/
│   ├── auth/
│   │   └── helpers.ts          # Core authentication functions
│   ├── appwrite.ts              # Appwrite client configuration
│   └── middleware/
│       └── auth.ts              # Middleware authentication checks
├── components/
│   └── auth/
│       ├── UnifiedAuthModal.tsx # Main authentication modal
│       └── Web3AuthModal.tsx    # Web3-specific modal
└── contexts/
    └── AuthContext.tsx          # Authentication context provider
```

## Implementation Details

### 1. Passkey Authentication

Based on `ignore1/function_appwrite_passkey/QUICKSTART.md`

#### How It Works

1. **User enters email** - Email is used to identify the user
2. **WebAuthn challenge** - Random challenge is generated client-side
3. **Try authentication first** - Attempts to authenticate with existing passkey
4. **Fallback to registration** - If no passkey exists, creates a new one
5. **Call Appwrite Function** - Sends credential to backend for verification
6. **Create session** - Backend returns token to create Appwrite session

#### Key Changes Made

**Before (Incorrect):**
```typescript
// ❌ Wrong: Using optionsJSON wrapper
credential = await startAuthentication({
  optionsJSON: {
    challenge,
    rpId,
    // ...
  }
})
```

**After (Correct):**
```typescript
// ✅ Correct: Direct options object
credential = await startAuthentication({
  challenge,
  rpId,
  timeout: 60000,
  userVerification: 'preferred',
})
```

**Function Call:**
```typescript
// ✅ Correct: Proper function execution with endpoint and method
const execution = await functions.createExecution(
  functionId,
  JSON.stringify(payload),
  false,
  endpoint,  // '/register' or '/authenticate'
  'POST'
)
```

#### Configuration Required

```env
NEXT_PUBLIC_PASSKEY_FUNCTION_ID=your-function-id
NEXT_PUBLIC_PASSKEY_RP_ID=your-domain.com
NEXT_PUBLIC_PASSKEY_RP_NAME=Your App Name
```

### 2. Web3 Wallet Authentication

Based on `ignore1/function_appwrite_web3/USAGE_NEXT.md`

#### How It Works

1. **User enters email** - Email links wallet to user account
2. **Connect wallet** - Requests MetaMask connection
3. **Generate message** - Creates timestamped authentication message
4. **Sign message** - User signs message with wallet
5. **Call Appwrite Function** - Backend verifies signature
6. **Create session** - Backend returns token to create Appwrite session

#### Key Changes Made

**Before (Incorrect):**
```typescript
// ❌ Wrong: Missing method parameter
const execution = await functions.createExecution(
  functionId,
  JSON.stringify(payload),
  false
)
```

**After (Correct):**
```typescript
// ✅ Correct: Proper function execution with path and method
const execution = await functions.createExecution(
  functionId,
  JSON.stringify({ email, address, signature, message }),
  false,
  '/',      // Path
  'POST'    // Method
)
```

#### Configuration Required

```env
NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID=your-function-id
```

### 3. Email OTP Authentication

Uses Appwrite's built-in email token system

#### How It Works

1. **Send OTP** - Calls `account.createEmailToken()` to send code
2. **User enters code** - Receives 6-digit code via email
3. **Verify OTP** - Calls `account.createSession()` with userId and code
4. **Session created** - User is authenticated

#### Key Changes Made

**Before:**
- Basic implementation with minimal error handling

**After:**
- Proper error handling for expired codes
- Better user feedback
- Auto-reset on expiration

#### No Configuration Required

Uses Appwrite's built-in authentication, no function deployment needed.

## Helper Functions

### `src/lib/auth/helpers.ts`

This file provides clean, reusable authentication functions:

#### Passkey Functions

```typescript
authenticateWithPasskey({ email }): Promise<PasskeyAuthResult>
```

Handles both registration and authentication in one call.

#### Wallet Functions

```typescript
authenticateWithWallet({ email }): Promise<WalletAuthResult>
```

Manages the full Web3 authentication flow.

#### OTP Functions

```typescript
sendEmailOTP({ email }): Promise<EmailOTPSendResult>
verifyEmailOTP({ userId, otp }): Promise<EmailOTPVerifyResult>
```

Separate functions for sending and verifying OTP codes.

#### Utility Functions

```typescript
supportsWebAuthn(): boolean
isMetaMaskInstalled(): boolean
getMetaMaskDownloadLink(): string
getCurrentUser(): Promise<User | null>
logout(): Promise<void>
```

## Authentication Context

### `src/contexts/AuthContext.tsx`

Provides authentication state throughout the app:

```typescript
const { 
  user,              // Current user or null
  loading,           // Initial loading state
  isAuthenticated,   // Boolean authentication status
  loginWithPasskey,  // Passkey login function
  loginWithWallet,   // Wallet login function
  sendOTP,           // Send OTP function
  verifyOTP,         // Verify OTP function
  logout,            // Logout function
  refreshUser        // Refresh user data
} = useAuth()
```

### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, loginWithPasskey } = useAuth()

  const handleLogin = async () => {
    const result = await loginWithPasskey('user@example.com')
    if (result.success) {
      console.log('Logged in!')
    } else {
      console.error(result.error)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

## Middleware Authentication

### `src/lib/middleware/auth.ts`

Updated to check for Appwrite session cookies:

```typescript
export function isAuthenticated(request: NextRequest): boolean {
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const sessionCookie = request.cookies.get(`a_session_${projectId}`)?.value
  return !!sessionCookie
}
```

## Error Handling

All authentication functions return structured results:

```typescript
{
  success: boolean
  error?: string      // User-friendly error message
  // ... other result data
}
```

### Common Errors

#### Passkey Errors
- `NotAllowedError` - User cancelled authentication
- `NotSupportedError` - Browser doesn't support WebAuthn
- `No credentials` - No passkey registered (triggers registration)

#### Wallet Errors
- `4001` - User rejected signature request
- `MetaMask not installed` - MetaMask extension not detected

#### OTP Errors
- `Invalid code` - Wrong OTP entered
- `expired` - Code has expired (auto-resets form)

## Testing Checklist

### Passkey Authentication
- [ ] First-time registration creates new passkey
- [ ] Subsequent logins use existing passkey
- [ ] Error shown if user cancels
- [ ] Error shown if browser doesn't support WebAuthn

### Wallet Authentication
- [ ] MetaMask installation check works
- [ ] Download link opens if not installed
- [ ] Wallet connection request appears
- [ ] Signature request appears
- [ ] Session created after signature

### Email OTP
- [ ] OTP email received
- [ ] Code verification works
- [ ] Invalid code shows error
- [ ] Expired code resets form
- [ ] Session created after verification

## Security Considerations

1. **Passkey Security**
   - Challenge is randomly generated client-side
   - Verification happens server-side in Appwrite Function
   - No credential data stored client-side

2. **Wallet Security**
   - Message includes timestamp to prevent replay attacks
   - Signature verification happens server-side
   - Only signature is sent to backend, never private keys

3. **OTP Security**
   - OTP expires after a set time
   - Uses Appwrite's built-in rate limiting
   - Code is sent via email, not returned in response

## Troubleshooting

### Passkey not working

1. Check browser support: `supportsWebAuthn()`
2. Verify RP_ID matches your domain
3. Ensure HTTPS (required in production)
4. Check function ID is correct

### Wallet authentication failing

1. Verify MetaMask is installed
2. Check function ID configuration
3. Ensure user signed the message
4. Check backend function logs

### OTP not arriving

1. Check spam/junk folder
2. Verify Appwrite email configuration
3. Check rate limits not exceeded

## Environment Variables

Required variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Passkey Function
NEXT_PUBLIC_PASSKEY_FUNCTION_ID=your-passkey-function-id
NEXT_PUBLIC_PASSKEY_RP_ID=your-domain.com
NEXT_PUBLIC_PASSKEY_RP_NAME=Your App Name

# Web3 Function
NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID=your-web3-function-id
```

## Migration from Old Implementation

If you have existing authentication code:

1. **Replace direct function calls** with helper functions
2. **Update imports** to use `@/lib/auth/helpers`
3. **Remove duplicate error handling** - it's in helpers now
4. **Use AuthContext** instead of manual session management
5. **Update middleware** to check Appwrite session cookies

## Additional Resources

- [Appwrite Passkey Function Docs](ignore1/function_appwrite_passkey/QUICKSTART.md)
- [Appwrite Web3 Auth Docs](ignore1/function_appwrite_web3/USAGE_NEXT.md)
- [Appwrite Functions Documentation](https://appwrite.io/docs/products/functions)
- [WebAuthn Guide](https://webauthn.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

## Summary of Corrections

1. ✅ **Fixed WebAuthn API calls** - Removed incorrect `optionsJSON` wrapper
2. ✅ **Fixed function execution** - Added proper path and method parameters
3. ✅ **Improved error handling** - Structured error responses with user-friendly messages
4. ✅ **Created helper utilities** - Centralized authentication logic
5. ✅ **Added authentication context** - Proper state management
6. ✅ **Updated middleware** - Correct Appwrite session detection
7. ✅ **Better user experience** - Loading states, proper error messages, auto-retries

All implementations now follow the official Appwrite Functions documentation patterns.
