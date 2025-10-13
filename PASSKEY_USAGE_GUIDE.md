# Passkey Authentication - Usage Guide

## Quick Start

The new passkey implementation uses Next.js API routes instead of Appwrite Functions, making it simpler and more reliable.

## Environment Setup

### Required Environment Variables

Create a `.env.local` file (or update your `.env` file) with:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Appwrite API Key (Server-side only)
# Required permissions: users.read, users.write
APPWRITE_API_KEY=your-api-key-here

# Passkey Configuration
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_RP_NAME=Web3 Pay
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

### Creating an Appwrite API Key

1. Go to your Appwrite Console
2. Navigate to "Project Settings" → "API Keys"
3. Click "Create API Key"
4. Name: "Passkey Server Key"
5. Scopes: Enable `users.read` and `users.write`
6. Copy the API key and add to your `.env.local`

### Production Configuration

For production, update:

```bash
NEXT_PUBLIC_RP_ID=yourdomain.com
NEXT_PUBLIC_ORIGIN=https://yourdomain.com
```

**Important**: The RP_ID must match your domain (without protocol).

## How to Use

### In Your Application

The passkey authentication is already integrated into `UnifiedAuthModal`. Simply use it:

```tsx
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'

function MyComponent() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setAuthModalOpen(true)}>
        Sign In
      </button>
      
      <UnifiedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}
```

### Direct Usage (Advanced)

You can also use the passkey auth directly:

```tsx
import { authenticateWithPasskey } from '@/lib/auth/helpers'

async function handlePasskeyAuth() {
  const result = await authenticateWithPasskey({
    email: 'user@example.com'
  })
  
  if (result.success) {
    console.log('Authenticated!', result.token)
    // User is now logged in, redirect or update UI
    if (result.isRegistration) {
      console.log('New passkey registered')
    } else {
      console.log('Authenticated with existing passkey')
    }
  } else {
    console.error('Failed:', result.error)
    // Handle error based on result.code:
    // - 'not_supported': Browser doesn't support passkeys
    // - 'cancelled': User cancelled the prompt
    // - 'verification_failed': Invalid credential
    // - 'server_error': Server-side error
  }
}
```

## Flow Explanation

### Registration (New User)
1. User enters email
2. Clicks "Continue with Passkey"
3. Browser checks for existing passkeys
4. None found → Creates new passkey
5. Browser shows "Create a passkey?" prompt
6. User approves (Touch ID, Face ID, etc.)
7. Credential sent to `/api/passkey/register`
8. Server verifies and stores in user prefs
9. Session created, user logged in

### Authentication (Existing User)
1. User enters email
2. Clicks "Continue with Passkey"
3. Browser checks for existing passkeys
4. Found → Requests authentication
5. Browser shows "Use passkey?" prompt
6. User approves (Touch ID, Face ID, etc.)
7. Assertion sent to `/api/passkey/auth`
8. Server verifies against stored credential
9. Session created, user logged in

## API Routes

### POST /api/passkey/register
Register a new passkey for a user.

**Request:**
```json
{
  "email": "user@example.com",
  "credentialData": { /* WebAuthn credential */ },
  "challenge": "base64url-challenge"
}
```

**Response:**
```json
{
  "success": true,
  "token": {
    "userId": "user-id",
    "secret": "session-secret"
  }
}
```

### POST /api/passkey/auth
Authenticate with an existing passkey.

**Request:**
```json
{
  "email": "user@example.com",
  "assertion": { /* WebAuthn assertion */ },
  "challenge": "base64url-challenge"
}
```

**Response:**
```json
{
  "success": true,
  "token": {
    "userId": "user-id",
    "secret": "session-secret"
  }
}
```

## Testing

### Local Testing

1. Start the dev server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Click sign in button
4. Enter an email address
5. Click "Continue with Passkey"
6. Browser will show passkey prompt
7. Follow the prompt to create/use passkey

### Testing Tips

- **Chrome**: Works best, supports all passkey features
- **Safari**: Full support on macOS/iOS
- **Firefox**: Limited support, may require flags
- **Android**: Use fingerprint or screen lock
- **iOS**: Use Face ID or Touch ID

### Common Issues

**"WebAuthn is not supported in this browser"**
- Use Chrome, Safari, or Edge
- Ensure you're on HTTPS (or localhost)

**"Passkey authentication was cancelled or timed out"**
- User cancelled the browser prompt
- Prompt timed out (60 seconds)
- Try again

**"No passkeys found for user"**
- User hasn't registered a passkey yet
- System will automatically attempt registration

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 67+ | ✅ Full |
| Safari 13+ | ✅ Full |
| Edge 18+ | ✅ Full |
| Firefox 60+ | ⚠️ Limited |
| Android Chrome | ✅ Full |
| iOS Safari | ✅ Full |

## Security Notes

1. **Passkeys are device-specific**: Users create separate passkeys on each device
2. **No password required**: Passkeys replace passwords entirely
3. **Phishing-resistant**: Credentials are bound to your domain
4. **Private key never leaves device**: Only public key is stored on server
5. **Synced across devices**: Most platforms sync passkeys via cloud (iCloud, Google)

## Troubleshooting

### Dev Server Issues

If you see "Cannot find module 'tailwindcss'":
```bash
npm install
```

### API Key Issues

If you see "Missing APPWRITE_API or APPWRITE_API_KEY":
1. Check `.env.local` has `APPWRITE_API_KEY`
2. Ensure the key has `users.read` and `users.write` permissions
3. Restart dev server after adding env vars

### CORS Issues

Ensure your Appwrite project allows your origin:
1. Go to Appwrite Console
2. Project Settings → Platforms
3. Add your domain (e.g., http://localhost:3000)

## Migration from Old Implementation

No migration needed! The new implementation:
- Uses the same user preferences storage
- Works with existing passkey credentials
- Only changes the verification method (API routes instead of Functions)

## Further Reading

- [WebAuthn Guide](https://webauthn.guide/)
- [Appwrite Users API](https://appwrite.io/docs/server/users)
- [Passkey Developer Guide](https://developers.google.com/identity/passkeys)
