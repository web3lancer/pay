# TableDB Migration & Integration Guide

## Overview

This application has been migrated from Appwrite Collections to **TableDB** (Appwrite's new structured database system). All CRUD operations have been rewritten to use the new TableDB API with proper TypeScript types and comprehensive functionality.

## What Changed

### Old Architecture (Deprecated)
- Used Appwrite `Databases` service with Collections API
- Direct database operations with `databases.createDocument()`, etc.
- Collections: users, wallets, tokens, transactions, payment_requests, exchange_rates
- Located in `/src/lib/appwrite.ts`

### New Architecture (Current)
- Uses Appwrite `TablesDB` service with Row-based API
- Structured CRUD operations in `/src/lib/tabledb/`
- Three primary databases: **PayDB**, **CoreDB**, **ProfilesDB**
- Comprehensive TypeScript types for all tables
- Organized by database and table with dedicated CRUD modules

## Directory Structure

```
src/lib/tabledb/
├── client.ts                 # TableDB client configuration
├── types.ts                  # TypeScript types for all tables
├── index.ts                  # Main export file
├── paydb/                    # PayDB CRUD operations
│   ├── users.ts             # User management
│   ├── tokens.ts            # Token/cryptocurrency management
│   ├── payment-requests.ts  # Payment request operations
│   ├── exchange-rates.ts    # Currency exchange rates
│   ├── api-keys.ts          # API key management
│   ├── virtual-cards.ts     # Virtual card operations
│   ├── virtual-accounts.ts  # Virtual account operations
│   └── index.ts             # PayDB exports
├── profilesdb/              # ProfilesDB CRUD operations
│   ├── profiles.ts          # User profile management
│   └── index.ts             # ProfilesDB exports
└── storage/                 # Storage bucket operations
    ├── files.ts             # File upload/download/management
    └── index.ts             # Storage exports
```

## Database Schema

### PayDB (Primary Database for Pay App)
- **ID**: `683a31960011608eaee5`
- **Tables**:
  - `users` - User accounts with KYC, 2FA, preferences
  - `tokens` - Cryptocurrency tokens with pricing
  - `payment_requests` - Payment request/invoice system
  - `exchange_rates` - Currency conversion rates
  - `api_keys` - API key management
  - `virtual_cards` - Virtual card system
  - `virtual_accounts` - Virtual account system

### ProfilesDB (Shared Ecosystem)
- **ID**: `67b885280000d2cb5411`
- **Tables**:
  - `profiles` - User profiles (public info, skills, portfolio)
  - `profile_verifications` - Verification documents and status

### CoreDB (Shared Ecosystem)
- **ID**: `682481e00032b7373ad0`
- **Tables**:
  - `skills` - Global skills list
  - `categories` - Category taxonomy
  - `platform_settings` - Platform-wide settings

## Usage Examples

### Basic CRUD Operations

```typescript
import { PayDB, ProfilesDB, Storage, account, ID } from '@/lib/tabledb'

// Create a new user
const user = await PayDB.createUser({
  userId: account.$id,
  email: 'user@example.com',
  username: 'johndoe',
  displayName: 'John Doe',
  preferredCurrency: 'USD',
})

// Get user by username
const user = await PayDB.getUserByUsername('johndoe')

// Update user profile
await PayDB.updateUserProfile(userId, {
  displayName: 'Jane Doe',
  profileImage: 'https://example.com/avatar.jpg',
})

// Create payment request
const request = await PayDB.createPaymentRequest({
  fromUserId: userId,
  toEmail: 'recipient@example.com',
  tokenId: 'ethereum',
  amount: '100',
  description: 'Payment for services',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
})

// List user's payment requests
const requests = await PayDB.listPaymentRequestsByUser(userId)

// Upload file to storage
const file = await Storage.uploadUserAsset(fileObject, userId)
```

### Advanced Operations

```typescript
// Check username availability
const isAvailable = await PayDB.checkUsernameAvailability('newuser')

// Set username (with availability check)
await PayDB.setUsername(userId, 'newuser')

// Mark payment request as paid
await PayDB.markPaymentRequestAsPaid(requestId, 'tx_hash_123')

// Update exchange rate
await PayDB.updateExchangeRatePair('USD', 'ETH', 0.00035, 'coingecko')

// Convert amount between currencies
const convertedAmount = await PayDB.convertAmount(100, 'USD', 'EUR')

// Update token price
await PayDB.updateTokenPrice('ETH', 3500.50, 2.5)

// Enable 2FA for user
await PayDB.enableTwoFactor(userId)

// Update KYC status
await PayDB.updateKYCStatus(userId, 'verified', 2)
```

### Profile Management

```typescript
// Create user profile (ProfilesDB)
const profile = await ProfilesDB.createProfile({
  userId: account.$id,
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Full-stack developer',
  skills: ['JavaScript', 'React', 'Node.js'],
  hourlyRate: 50,
  availability: 'available',
})

// Update profile skills
await ProfilesDB.updateProfileSkills(userId, [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
])

// Update profile avatar
await ProfilesDB.updateProfileAvatar(userId, avatarUrl)

// Search profiles by skill
const profiles = await ProfilesDB.listProfilesBySkill('React')
```

### Storage Operations

```typescript
// Upload profile avatar
const avatar = await Storage.uploadProfileAvatar(file, userId)

// Upload verification document
const document = await Storage.uploadVerificationDocument(file, userId)

// Get file URL
const url = Storage.getFileUrl(bucketId, fileId)

// Get preview URL with dimensions
const previewUrl = Storage.getFilePreviewUrl(bucketId, fileId, 400, 400, 90)

// Validate image file before upload
if (Storage.validateImageFile(file, 5)) {
  await Storage.uploadProfileAvatar(file, userId)
}

// Delete file
await Storage.deleteFile(bucketId, fileId)
```

### Transaction Support

```typescript
import { tablesDB } from '@/lib/tabledb'

// Create transaction
const transaction = await tablesDB.createTransaction({ ttl: 60 })

// Perform operations within transaction
await PayDB.createUser(userData, ID.unique())
await PayDB.createPaymentRequest(requestData, ID.unique())

// Commit transaction
await tablesDB.updateTransaction({
  transactionId: transaction.$id,
  commit: true,
})

// Or rollback
await tablesDB.updateTransaction({
  transactionId: transaction.$id,
  rollback: true,
})
```

## Query Operations

All list functions support Appwrite queries:

```typescript
import { Query } from '@/lib/tabledb'

// List with custom queries
const activeUsers = await PayDB.listUsers([
  Query.equal('isActive', true),
  Query.greaterThan('kycLevel', 1),
  Query.orderDesc('createdAt'),
], 25, 0)

// Search operations
const requests = await PayDB.searchPaymentRequestsByDescription('invoice')

// Complex queries
const filteredRequests = await PayDB.listPaymentRequests([
  Query.equal('status', 'pending'),
  Query.greaterThan('amount', '100'),
  Query.lessThan('dueDate', new Date().toISOString()),
])
```

## Permissions

All operations use Appwrite's permission system:

```typescript
// User-specific permissions (default for most user data)
Permission.read(Role.user(userId))
Permission.update(Role.user(userId))
Permission.delete(Role.user(userId))

// Public read (for profiles, public data)
Permission.read(Role.any())

// Examples in code:
// - Users: Can only be read/updated by owner
// - Payment Requests: Can be read/updated by both sender and receiver
// - Profiles: Public read, owner can update
// - Tokens: Public read
// - Exchange Rates: Public read
```

## Environment Variables

Required in `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

# Web3 Authentication
NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID=your_function_id

# Database IDs
NEXT_PUBLIC_PAYDB_ID=683a31960011608eaee5
NEXT_PUBLIC_COREDB_ID=682481e00032b7373ad0
NEXT_PUBLIC_PROFILESDB_ID=67b885280000d2cb5411
```

## TypeScript Types

All tables have comprehensive TypeScript types:

```typescript
import type {
  PayDBUser,
  PayDBToken,
  PayDBPaymentRequest,
  PayDBExchangeRate,
  ProfilesDBProfile,
} from '@/lib/tabledb/types'

// Use types in your components
interface Props {
  user: PayDBUser
  requests: PayDBPaymentRequest[]
}
```

## Migration from Old System

If you have code using the old Collections API:

```typescript
// Old (Deprecated)
import { databases, DATABASE_ID, COLLECTION_IDS } from '@/lib/appwrite'
const user = await databases.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId)

// New (Current)
import { PayDB } from '@/lib/tabledb'
const user = await PayDB.getUserByUserId(userId)
```

## Best Practices

1. **Use specific getter functions** instead of raw `getRow`:
   ```typescript
   // Good
   const user = await PayDB.getUserByUsername('john')
   
   // Avoid
   const user = await tablesDB.getRow(DB_ID, TABLE_ID, rowId)
   ```

2. **Handle errors appropriately**:
   ```typescript
   try {
     await PayDB.setUsername(userId, 'taken')
   } catch (error) {
     if (error.message === 'Username already taken') {
       // Handle duplicate username
     }
   }
   ```

3. **Use transactions for atomic operations**:
   ```typescript
   const tx = await tablesDB.createTransaction({ ttl: 60 })
   try {
     // Multiple operations
     await tablesDB.updateTransaction({ transactionId: tx.$id, commit: true })
   } catch (error) {
     await tablesDB.updateTransaction({ transactionId: tx.$id, rollback: true })
   }
   ```

4. **Validate files before upload**:
   ```typescript
   if (!Storage.validateImageFile(file, 5)) {
     throw new Error('Invalid image file or too large')
   }
   ```

## Key Differences from Collections API

1. **Rows instead of Documents**: `createRow()` instead of `createDocument()`
2. **Increment/Decrement**: Built-in support for atomic operations
3. **Transactions**: Native transaction support for atomic multi-row operations
4. **Column-based**: Schema enforced at database level
5. **Relationships**: Proper foreign key relationships

## Testing

```typescript
// Example test
import { PayDB } from '@/lib/tabledb'

describe('User Operations', () => {
  it('should create and retrieve user', async () => {
    const userData = {
      userId: 'test123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
    }
    
    const user = await PayDB.createUser(userData)
    expect(user.username).toBe('testuser')
    
    const retrieved = await PayDB.getUserByUsername('testuser')
    expect(retrieved.$id).toBe(user.$id)
  })
})
```

## Support

For issues or questions:
1. Check Appwrite TableDB documentation: https://appwrite.io/docs/products/databases/tablesdb
2. Review type definitions in `/src/lib/tabledb/types.ts`
3. Check function implementation in respective CRUD files

---

**Status**: ✅ Complete and Ready for Use
**Last Updated**: January 2025
**TableDB Version**: Latest
**Appwrite SDK**: 15.0.0+
