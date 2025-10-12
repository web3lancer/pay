# Authentication Quick Start Guide

Quick reference for using the corrected authentication system.

## Setup (One-time)

### 1. Add Environment Variables

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_PASSKEY_FUNCTION_ID=your-passkey-function-id
NEXT_PUBLIC_PASSKEY_RP_ID=your-domain.com
NEXT_PUBLIC_PASSKEY_RP_NAME=Your App Name
NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID=your-web3-function-id
```

### 2. Wrap App with AuthProvider

```typescript
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Usage

### Option 1: Using Authentication Context (Recommended)

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { 
    user,              // Current user or null
    isAuthenticated,   // Boolean
    loginWithPasskey,  // Function
    loginWithWallet,   // Function
    sendOTP,           // Function
    verifyOTP,         // Function
    logout             // Function
  } = useAuth()

  // Passkey login
  const handlePasskeyLogin = async () => {
    const result = await loginWithPasskey('user@example.com')
    if (result.success) {
      console.log('Logged in!')
    } else {
      console.error(result.error)
    }
  }

  // Wallet login
  const handleWalletLogin = async () => {
    const result = await loginWithWallet('user@example.com')
    if (result.success) {
      console.log('Logged in!')
    } else {
      console.error(result.error)
    }
  }

  // OTP login
  const [otpUserId, setOtpUserId] = useState('')
  
  const handleSendOTP = async () => {
    const result = await sendOTP('user@example.com')
    if (result.success) {
      setOtpUserId(result.userId!)
      console.log('OTP sent!')
    }
  }
  
  const handleVerifyOTP = async (code: string) => {
    const result = await verifyOTP(otpUserId, code)
    if (result.success) {
      console.log('Logged in!')
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handlePasskeyLogin}>Login with Passkey</button>
          <button onClick={handleWalletLogin}>Login with Wallet</button>
          <button onClick={handleSendOTP}>Send OTP</button>
        </div>
      )}
    </div>
  )
}
```

### Option 2: Using Helper Functions Directly

```typescript
import {
  authenticateWithPasskey,
  authenticateWithWallet,
  sendEmailOTP,
  verifyEmailOTP,
  getCurrentUser,
  logout
} from '@/lib/auth/helpers'

// Passkey
const result = await authenticateWithPasskey({ email: 'user@example.com' })

// Wallet
const result = await authenticateWithWallet({ email: 'user@example.com' })

// OTP
const sendResult = await sendEmailOTP({ email: 'user@example.com' })
const verifyResult = await verifyEmailOTP({ 
  userId: sendResult.userId!, 
  otp: '123456' 
})

// Check current user
const user = await getCurrentUser()

// Logout
await logout()
```

## Common Patterns

### Protected Route

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return null

  return <div>Protected content</div>
}
```

### Login Form

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<'passkey' | 'wallet' | 'otp'>('passkey')
  const { loginWithPasskey, loginWithWallet, sendOTP } = useAuth()

  const handleLogin = async () => {
    let result
    
    switch (method) {
      case 'passkey':
        result = await loginWithPasskey(email)
        break
      case 'wallet':
        result = await loginWithWallet(email)
        break
      case 'otp':
        result = await sendOTP(email)
        break
    }

    if (result.success) {
      // Handle success
    } else {
      alert(result.error)
    }
  }

  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <select value={method} onChange={e => setMethod(e.target.value as any)}>
        <option value="passkey">Passkey</option>
        <option value="wallet">Wallet</option>
        <option value="otp">Email OTP</option>
      </select>
      
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
```

### User Profile Display

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {user?.name}</p>
      <p>ID: {user?.$id}</p>
    </div>
  )
}
```

### Logout Button

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function LogoutButton() {
  const { logout } = useAuth()

  return (
    <button onClick={logout}>
      Logout
    </button>
  )
}
```

## Utility Functions

### Check Browser Support

```typescript
import { supportsWebAuthn, isMetaMaskInstalled } from '@/lib/auth/helpers'

if (!supportsWebAuthn()) {
  alert('Your browser does not support passkeys')
}

if (!isMetaMaskInstalled()) {
  alert('MetaMask is not installed')
}
```

### Get MetaMask Download Link

```typescript
import { getMetaMaskDownloadLink } from '@/lib/auth/helpers'

const downloadLink = getMetaMaskDownloadLink()
// Returns browser-specific MetaMask download URL
```

## Error Handling

All authentication functions return structured results:

```typescript
{
  success: boolean
  error?: string
  // ... other data
}
```

Example:
```typescript
const result = await loginWithPasskey(email)

if (!result.success) {
  // Show error to user
  toast.error(result.error)
  return
}

// Continue with success flow
console.log('Logged in!')
```

## TypeScript Types

```typescript
import type { 
  PasskeyAuthResult,
  WalletAuthResult,
  EmailOTPSendResult,
  EmailOTPVerifyResult
} from '@/lib/auth/helpers'

import type { Models } from 'appwrite'

// User type
type User = Models.User<Models.Preferences>
```

## Complete Example

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { loginWithPasskey, loginWithWallet, sendOTP, verifyOTP } = useAuth()
  const router = useRouter()

  const handlePasskey = async () => {
    setLoading(true)
    const result = await loginWithPasskey(email)
    setLoading(false)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      alert(result.error)
    }
  }

  const handleWallet = async () => {
    setLoading(true)
    const result = await loginWithWallet(email)
    setLoading(false)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      alert(result.error)
    }
  }

  const handleSendOTP = async () => {
    setLoading(true)
    const result = await sendOTP(email)
    setLoading(false)
    
    if (result.success) {
      setOtpUserId(result.userId!)
      setShowOtpInput(true)
    } else {
      alert(result.error)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    const result = await verifyOTP(otpUserId, otp)
    setLoading(false)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Login</h1>
      
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="border p-2 mb-4 w-full"
      />

      {showOtpInput && (
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter 6-digit code"
          className="border p-2 mb-4 w-full"
          maxLength={6}
        />
      )}

      <div className="space-x-2">
        {!showOtpInput ? (
          <>
            <button 
              onClick={handlePasskey}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Passkey
            </button>
            
            <button 
              onClick={handleWallet}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Wallet
            </button>
            
            <button 
              onClick={handleSendOTP}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Send OTP
            </button>
          </>
        ) : (
          <button 
            onClick={handleVerifyOTP}
            disabled={loading || otp.length < 6}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Verify OTP
          </button>
        )}
      </div>
    </div>
  )
}
```

## Troubleshooting

### Passkey not working
- Check `supportsWebAuthn()` returns true
- Verify RP_ID matches your domain
- Ensure HTTPS in production

### Wallet not connecting
- Check `isMetaMaskInstalled()` returns true
- Verify function ID is correct
- Check user approved connection

### OTP not arriving
- Check spam folder
- Verify Appwrite email configuration
- Check rate limits

## Need Help?

See full documentation:
- `AUTHENTICATION.md` - Complete guide
- `AUTHENTICATION_FIXES_SUMMARY.md` - What was fixed
- `ignore1/function_appwrite_passkey/QUICKSTART.md` - Passkey function docs
- `ignore1/function_appwrite_web3/USAGE_NEXT.md` - Web3 function docs
