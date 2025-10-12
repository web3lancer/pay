# Authentication Error Codes Guide

This document describes all error codes returned by the authentication system and how they're handled.

## Overview

The authentication system now returns structured error codes based on the actual Appwrite Function responses. This provides clear, actionable feedback to users about what went wrong and how to fix it.

## Error Code Structure

All authentication functions return results with this structure:

```typescript
{
  success: boolean
  error?: string      // User-friendly error message
  code?: string       // Machine-readable error code
  // ... other data
}
```

## Passkey Authentication Error Codes

### `no_passkey`
**Meaning**: User has no passkey registered for this email

**User Message**: "No passkey found. Creating a new one..."

**Action**: System automatically triggers passkey registration

**When it occurs**: First-time passkey authentication

---

### `cancelled`
**Meaning**: User cancelled the passkey prompt

**User Message**: "Passkey authentication cancelled"

**Action**: User dismisses the browser passkey prompt

**When it occurs**: User clicks cancel on the WebAuthn prompt

---

### `not_supported`
**Meaning**: Browser doesn't support WebAuthn

**User Message**: "Your browser doesn't support passkeys. Please try Email OTP or Wallet authentication."

**Action**: Suggest alternative authentication methods

**When it occurs**: Using an unsupported browser (very old browsers)

---

### `verification_failed`
**Meaning**: Backend verification of passkey failed

**User Message**: "Passkey verification failed. Please try again."

**Action**: Ask user to try again

**When it occurs**: 
- Passkey data corrupted
- RP_ID mismatch
- Challenge mismatch
- Signature verification failure

---

### `server_error`
**Meaning**: Unexpected error in authentication flow

**User Message**: Custom error message from server

**Action**: Contact support if persists

**When it occurs**: Configuration errors, network issues, etc.

---

## Web3 Wallet Authentication Error Codes

### `metamask_not_installed`
**Meaning**: MetaMask extension not detected

**User Message**: "MetaMask not installed. Opening download page..."

**Action**: Automatically opens MetaMask download link

**When it occurs**: `window.ethereum` is undefined

**HTTP Status**: N/A (client-side check)

---

### `no_account`
**Meaning**: No wallet account selected in MetaMask

**User Message**: "No wallet account selected. Please select an account in MetaMask."

**Action**: User needs to unlock MetaMask and select an account

**When it occurs**: `eth_requestAccounts` returns empty array

**HTTP Status**: N/A (client-side check)

---

### `signature_rejected`
**Meaning**: User rejected the signature request in MetaMask

**User Message**: "Signature rejected. You must sign the message to authenticate."

**Action**: User needs to accept the signature request

**When it occurs**: User clicks "Cancel" on MetaMask signature prompt

**HTTP Status**: N/A (client-side check, error code 4001 from MetaMask)

---

### `invalid_signature`
**Meaning**: Signature verification failed on backend

**User Message**: "Invalid signature. Please try again."

**Action**: Try again with correct wallet

**When it occurs**: 
- Wrong wallet signed the message
- Message was tampered with
- Signature is malformed

**HTTP Status**: 401

**Backend Error**: "Invalid signature"

---

### `passkey_conflict`
**Meaning**: Email is linked to a passkey account

**User Message**: "⚠️ This email is linked to a passkey account. Please sign in with your passkey first, then link your wallet from settings."

**Action**: User must:
1. Sign in with passkey
2. Go to settings
3. Link wallet from there

**When it occurs**: 
- Account created with passkey
- No wallet linked yet
- Trying to authenticate with wallet

**HTTP Status**: 403

**Backend Error**: "Account already connected with passkey. Sign in with passkey to link wallet."

**Security Reason**: Prevents unauthorized wallet linking to passkey accounts

---

### `wallet_mismatch`
**Meaning**: Email is already linked to a different wallet

**User Message**: "⚠️ This email is already linked to a different wallet address. Please use the original wallet or a different email."

**Action**: User must either:
1. Use the original wallet address
2. Use a different email address

**When it occurs**:
- Account exists with wallet A
- Trying to authenticate with wallet B

**HTTP Status**: 403

**Backend Error**: "Email already bound to a different wallet"

**Security Reason**: Prevents account hijacking by linking different wallets

---

### `account_exists`
**Meaning**: Email has an account created via Email OTP

**User Message**: "⚠️ This email already has an account. Please sign in with Email OTP or Passkey first."

**Action**: User must:
1. Sign in with Email OTP first
2. Then link wallet from settings

**When it occurs**:
- Account created via Email OTP
- No wallet or passkey linked
- Trying to authenticate with wallet

**HTTP Status**: 403

**Backend Error**: "Account already exists"

**Security Reason**: Prevents unauthorized wallet linking to Email OTP accounts

---

### `server_error`
**Meaning**: Unexpected server error

**User Message**: Custom error message from server

**Action**: Contact support if persists

**When it occurs**: Configuration errors, network issues, etc.

**HTTP Status**: 500

---

## Email OTP Error Codes

### `invalid_code`
**Meaning**: Wrong OTP entered

**User Message**: "Invalid code. Please check and try again."

**Action**: User re-enters the code

**When it occurs**: User enters wrong 6-digit code

---

### `expired_code`
**Meaning**: OTP has expired

**User Message**: "Code has expired. Please request a new one."

**Action**: Form automatically resets to request new code

**When it occurs**: User waited too long to enter code (default: 15 minutes)

---

## Implementation Examples

### Handling Passkey Errors

```typescript
const result = await authenticateWithPasskey({ email })

if (!result.success) {
  switch (result.code) {
    case 'no_passkey':
      // System handles automatically
      break
    case 'cancelled':
      // Just inform user, no action needed
      break
    case 'not_supported':
      // Show alternative auth methods
      break
    case 'verification_failed':
      // Ask to try again
      break
  }
}
```

### Handling Wallet Errors

```typescript
const result = await authenticateWithWallet({ email })

if (!result.success) {
  switch (result.code) {
    case 'passkey_conflict':
      // Show instructions to sign in with passkey first
      // Guide user to settings page for wallet linking
      break
    case 'wallet_mismatch':
      // Explain they need to use original wallet
      // Or use different email
      break
    case 'account_exists':
      // Explain they need to sign in with OTP first
      // Then link wallet from settings
      break
    case 'signature_rejected':
      // Just ask to try again and accept signature
      break
  }
}
```

## User Flow Diagrams

### Wallet Authentication with Passkey Conflict

```
User enters email → Connects wallet → Signs message
    ↓
Backend checks user
    ↓
Has passkey credentials? YES
    ↓
Has wallet linked? NO
    ↓
❌ Return 403: passkey_conflict
    ↓
Frontend shows: "Sign in with passkey first, then link wallet from settings"
```

### Wallet Authentication with Wallet Mismatch

```
User enters email → Connects wallet B → Signs message
    ↓
Backend checks user
    ↓
Has wallet linked? YES (wallet A)
    ↓
Same wallet? NO (trying wallet B)
    ↓
❌ Return 403: wallet_mismatch
    ↓
Frontend shows: "Email already linked to different wallet"
```

### Wallet Authentication with Email OTP Account

```
User enters email → Connects wallet → Signs message
    ↓
Backend checks user
    ↓
Has wallet? NO
Has passkey? NO
    ↓
Account exists via Email OTP
    ↓
❌ Return 403: account_exists
    ↓
Frontend shows: "Sign in with Email OTP first, then link wallet from settings"
```

## Security Rationale

### Why `passkey_conflict` exists
Prevents unauthorized wallet linking to passkey accounts. Passkey authentication proves identity, so wallet linking should happen after passkey auth.

### Why `wallet_mismatch` exists
Prevents account hijacking by linking a different wallet to an existing email. Once a wallet is linked, it cannot be changed without proper authentication.

### Why `account_exists` exists
Prevents unauthorized wallet linking to Email OTP accounts. Email OTP authentication proves email ownership, so wallet linking should happen after OTP auth.

## Testing Scenarios

### Test Passkey Authentication

1. **First-time registration**
   - Enter new email → Expect passkey creation
   - Should get `no_passkey` code (handled automatically)

2. **Existing passkey**
   - Enter existing email → Expect passkey prompt
   - Should succeed without errors

3. **Cancel prompt**
   - Enter email → Cancel passkey prompt
   - Should get `cancelled` code

### Test Wallet Authentication

1. **Fresh email**
   - New email + wallet signature → Should succeed
   - Account created, wallet linked

2. **Existing passkey account**
   - Passkey account email + wallet → Should get `passkey_conflict`
   - Should guide to sign in with passkey first

3. **Different wallet**
   - Account with wallet A, try wallet B → Should get `wallet_mismatch`
   - Should prompt to use original wallet or different email

4. **Email OTP account**
   - OTP account email + wallet → Should get `account_exists`
   - Should guide to sign in with OTP first

## Error Message Best Practices

✅ **DO:**
- Use clear, actionable language
- Explain WHY the error occurred
- Tell users HOW to fix it
- Use emojis for visual emphasis (⚠️, ✅, 🔐, 🦊)
- Show longer duration for complex messages

❌ **DON'T:**
- Use technical jargon
- Just say "failed" without explanation
- Leave users confused about next steps
- Use all-caps or aggressive language

## Monitoring & Analytics

Track these error codes to identify issues:

- High `verification_failed` rate → Check RP_ID configuration
- High `wallet_mismatch` rate → Users confused about wallet linking
- High `passkey_conflict` rate → Need better onboarding for passkey users
- High `signature_rejected` rate → Users confused about signing

## Related Documentation

- [AUTHENTICATION.md](../AUTHENTICATION.md) - Main authentication guide
- [AUTH_QUICK_START.md](./AUTH_QUICK_START.md) - Quick start guide
- [AUTHENTICATION_FIXES_SUMMARY.md](../AUTHENTICATION_FIXES_SUMMARY.md) - What was fixed
