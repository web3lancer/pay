# Passkey Error Handling - Expressive Implementation

## Overview
The passkey implementation now includes comprehensive, user-friendly error handling based on the POC pattern.

## Error Categories

### 1. Browser/Device Errors

#### Not Supported
- **Trigger**: Browser doesn't support WebAuthn
- **Error Code**: `not_supported`
- **User Message**: "Your browser does not support passkeys. Please use Chrome, Safari, or Edge."
- **Action**: User should switch browsers

#### User Cancelled
- **Trigger**: User dismisses the passkey prompt or times out
- **Error Name**: `NotAllowedError`
- **Error Code**: `cancelled`
- **Registration Message**: "Passkey creation was cancelled. Please try again."
- **Authentication Message**: "Passkey authentication was cancelled. Please try again."
- **Action**: User can retry

#### Invalid State (Registration)
- **Trigger**: Device already has a passkey for this account
- **Error Name**: `InvalidStateError`
- **Error Code**: `verification_failed`
- **User Message**: "A passkey already exists for this device. Try signing in instead."
- **Action**: User should use authentication instead

#### Invalid State (Authentication)
- **Trigger**: No passkey found on device
- **Error Name**: `InvalidStateError`
- **Error Code**: `no_passkey`
- **User Message**: "No valid passkey found. Please ensure you have registered a passkey for this account."
- **Action**: User should register a passkey first

### 2. Server Errors

#### Wallet Conflict
- **Trigger**: Account already connected with Web3 wallet, no passkeys exist
- **Server Check**: `shouldBlockPasskeyForEmail()` returns true
- **HTTP Status**: 403 Forbidden
- **Error Code**: `wallet_conflict`
- **User Message**: "This account is already connected with a Web3 wallet. Please use wallet authentication instead."
- **Action**: User must use Web3 wallet to sign in

#### No Passkeys Found
- **Trigger**: User tries to authenticate but has no registered passkeys
- **Server Message**: "No passkeys found for user"
- **Error Code**: `no_passkey`
- **User Message**: "No passkey found for this account. Please register a passkey first."
- **Action**: User should register a passkey

#### Unknown Credential
- **Trigger**: Passkey ID doesn't match any stored credentials
- **Server Message**: "Unknown credential"
- **Error Code**: `verification_failed`
- **User Message**: "This passkey is not recognized. Please try a different passkey or register a new one."
- **Action**: User should try another passkey or register

#### Rate Limiting
- **Trigger**: Too many attempts from same IP/user
- **HTTP Status**: 429 Too Many Requests
- **HTTP Header**: `Retry-After: {seconds}`
- **Error Code**: `server_error`
- **User Message**: "Too many attempts. Please wait a moment and try again."
- **Action**: User must wait before retrying

#### Verification Failed
- **Trigger**: Server verification of credential/assertion fails
- **Error Code**: `verification_failed`
- **Generic Message**: "Registration failed" or "Authentication failed"
- **Action**: User should retry

### 3. Network Errors

#### Server Unavailable
- **Trigger**: API route returns 500 or network fails
- **Error Code**: `server_error`
- **User Message**: Error message from server or "Passkey registration/authentication failed. Please try again."
- **Action**: User should retry

## Error Handling Flow

### Registration Flow
```
User clicks "Register Passkey"
         ↓
Check browser support → NOT SUPPORTED → Show error
         ↓ SUPPORTED
Call register()
         ↓
Generate options
         ↓
Show browser prompt → USER CANCELS → NotAllowedError
         ↓ USER APPROVES
Create credential → ALREADY EXISTS → InvalidStateError
         ↓ CREATED
Send to /api/passkey/register
         ↓
Server verification → WALLET CONFLICT → 403 error
                   → RATE LIMITED → 429 error  
                   → VERIFICATION FAILED → 400 error
                   → SUCCESS → Create session ✓
```

### Authentication Flow
```
User clicks "Sign In with Passkey"
         ↓
Check browser support → NOT SUPPORTED → Show error
         ↓ SUPPORTED
Call authenticate()
         ↓
Generate options
         ↓
Show browser prompt → USER CANCELS → NotAllowedError
         ↓ USER APPROVES
Get assertion → NO CREDENTIALS → InvalidStateError
         ↓ GOT ASSERTION
Send to /api/passkey/auth
         ↓
Server verification → NO PASSKEYS → "No passkeys found"
                   → WALLET CONFLICT → 403 error
                   → UNKNOWN CREDENTIAL → "Unknown credential"
                   → RATE LIMITED → 429 error
                   → VERIFICATION FAILED → 400 error
                   → SUCCESS → Create session ✓
```

## UI Display Guidelines

### Error Message Colors

**Red (Errors that block):**
- Browser not supported
- Wallet conflict
- No passkeys found
- Unknown credential
- Verification failed

**Yellow/Warning (Temporary issues):**
- User cancelled
- Rate limited
- Network errors

**Info/Blue (Helpful suggestions):**
- "Try signing in instead" (when passkey exists)
- "Register a passkey first" (when none found)

### Example UI Implementation

```tsx
if (result.code === 'wallet_conflict') {
  // Show info message with suggestion
  setMessage({
    type: 'info',
    text: result.error,
    action: 'Try Web3 Wallet instead'
  });
}

if (result.code === 'cancelled') {
  // Show gentle warning
  setMessage({
    type: 'warning',
    text: result.error,
    action: 'Try again'
  });
}

if (result.code === 'no_passkey') {
  // Show info with action button
  setMessage({
    type: 'info',
    text: result.error,
    action: 'Register Passkey',
    onClick: () => switchToRegister()
  });
}
```

## Console Logging

### Registration
- ✅ Success: "Passkey registration successful"
- ❌ Error: "Passkey registration error: {details}"

### Authentication
- ✅ Success: "Passkey authentication successful"
- ❌ Error: "Passkey authentication error: {details}"

### Debug Info
- 📝 "Registering passkey for: {email}"
- 🔐 "Authenticating passkey for: {email}"

## Testing Error Scenarios

### Test User Cancellation
1. Click "Register Passkey"
2. When browser prompt appears, click "Cancel"
3. Should see: "Passkey creation was cancelled. Please try again."

### Test No Passkeys
1. Enter email that has no passkeys
2. Click "Sign In with Passkey"
3. Should see: "No passkey found for this account. Please register a passkey first."

### Test Wallet Conflict
1. Create account with Web3 wallet
2. Try to register passkey
3. Should see: "This account is already connected with a Web3 wallet. Please use wallet authentication instead."

### Test Already Exists
1. Register passkey on a device
2. Try to register again on same device/browser
3. Should see: "A passkey already exists for this device. Try signing in instead."

## Best Practices

1. **Always show specific errors** - No generic "Something went wrong"
2. **Provide next steps** - Tell user what to do (retry, switch auth method, etc.)
3. **Log to console** - Help developers debug issues
4. **Use appropriate severity** - Errors vs warnings vs info
5. **Be user-friendly** - Avoid technical jargon
6. **Test all scenarios** - Ensure every error path works

## Error Codes Reference

| Code | Meaning | User Action |
|------|---------|-------------|
| `not_supported` | Browser doesn't support WebAuthn | Switch browser |
| `cancelled` | User cancelled prompt | Try again |
| `wallet_conflict` | Account uses Web3 wallet | Use wallet auth |
| `no_passkey` | No passkeys registered | Register first |
| `verification_failed` | Server verification failed | Retry or contact support |
| `server_error` | Server/network issue | Retry later |

## Implementation Checklist

✅ Browser support check
✅ NotAllowedError handling (user cancellation)
✅ InvalidStateError handling (already exists / not found)
✅ Wallet conflict detection
✅ Rate limit handling
✅ No passkeys error
✅ Unknown credential error
✅ Expressive user messages
✅ Console logging
✅ Error code classification
