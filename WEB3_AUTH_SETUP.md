# Web3 Wallet Authentication Setup

This document explains how to set up wallet-based authentication (MetaMask) for sign in and sign up functionality using Appwrite Functions.

## Overview

Instead of using traditional login/signup pages, the application now uses modal overlays with Web3 wallet authentication. Users simply:
1. Enter their email address
2. Connect their MetaMask wallet
3. Sign a message to prove wallet ownership
4. Get authenticated via Appwrite session

## Prerequisites

- Appwrite project set up
- MetaMask or compatible Web3 wallet
- Appwrite Function deployed (see below)

## Setup Instructions

### 1. Deploy the Appwrite Web3 Auth Function

Follow the guide in `ignore1/function_appwrite_web3/USAGE_NEXT.md` to deploy the Web3 authentication function.

The function should:
- Accept email, wallet address, signature, and message
- Verify the signature
- Create or find the user in Appwrite
- Store the wallet address in user preferences
- Return userId and secret for session creation

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Web3 Authentication Function
NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID=your-web3-auth-function-id
```

Get the function ID from your Appwrite dashboard after deploying the function.

### 3. How It Works

#### Component Structure

- **`Web3AuthModal`** (`/src/components/auth/Web3AuthModal.tsx`): Modal component for authentication
- **TopBar**: Uses the modal for sign in/sign up buttons in the dropdown
- **Landing Page**: Uses the modal for CTAs

#### Authentication Flow

1. User clicks "Sign In" or "Sign Up" from any page
2. Modal opens with email input field
3. User enters email and clicks "Connect Wallet & Sign"
4. MetaMask prompts to connect wallet
5. MetaMask prompts to sign authentication message
6. Request sent to Appwrite Function with:
   ```json
   {
     "email": "user@example.com",
     "address": "0x...",
     "signature": "0x...",
     "message": "auth-1234567890"
   }
   ```
7. Function verifies signature and creates/updates user
8. Session created with returned userId and secret
9. User redirected to dashboard

#### Key Features

- **No separate auth pages**: Everything happens in modals with page blur
- **Wallet-only authentication**: No passwords, magic links, or OAuth
- **Email for user identification**: Wallet address stored in user preferences
- **Automatic account creation**: First-time users automatically get an account
- **Session management**: Standard Appwrite sessions used

## File Changes Made

### New Files

1. `/src/components/auth/Web3AuthModal.tsx` - Main auth modal component
2. `/src/types/web3.d.ts` - TypeScript definitions for window.ethereum

### Modified Files

1. `/src/components/layout/TopBar.tsx`
   - Replaced auth links with modal triggers
   - Added state for modal control

2. `/src/app/page.tsx` (Landing page)
   - Replaced auth links with modal triggers
   - Added Web3AuthModal component

3. `/env.sample`
   - Added NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID

### Deprecated Files (Can be removed)

- `/src/app/auth/login/page.tsx`
- `/src/app/auth/signup/page.tsx`
- `/src/components/auth/AuthClient.tsx` (if not used elsewhere)
- Any other auth method components (OAuth, Magic Links, Email OTP, etc.)

## Testing

1. Ensure MetaMask is installed in your browser
2. Start the development server: `npm run dev`
3. Navigate to landing page (`/`)
4. Click "Sign In" or "Get Started" button
5. Enter an email address in the modal
6. Click "Connect Wallet & Sign"
7. Approve MetaMask connection
8. Sign the authentication message
9. Verify you're redirected to `/home`

## Troubleshooting

### "MetaMask not installed" Error

- Install MetaMask browser extension from https://metamask.io/download/
- Refresh the page after installation

### "Web3 authentication is not configured" Error

- Verify `NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID` is set in `.env.local`
- Ensure the Appwrite Function is deployed and active

### Signature Verification Failed

- Check that the function is properly verifying signatures using eth_recover
- Ensure the message format matches between client and function

### Session Not Created

- Verify the function returns correct `userId` and `secret`
- Check Appwrite project permissions allow session creation

## Security Considerations

1. **Message Signing**: Each authentication generates a unique timestamped message
2. **Wallet Binding**: Wallet addresses are stored in user preferences for future verification
3. **No Password Storage**: No passwords to leak or compromise
4. **Session Security**: Standard Appwrite session security applies

## Next Steps

1. Deploy the Web3 auth function to Appwrite
2. Add the function ID to environment variables
3. Test the authentication flow
4. Remove old auth pages and components
5. Update any links still pointing to `/auth/login` or `/auth/signup`

## Support

For issues with:
- Web3 wallet integration: See `ignore1/function_appwrite_web3/USAGE_NEXT.md`
- Appwrite setup: Check Appwrite documentation
- Modal UI: Check `/src/components/ui/Modal.tsx`
