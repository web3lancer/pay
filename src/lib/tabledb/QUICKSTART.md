# TableDB Quick Start Guide

## Installation & Setup

The TableDB module is already installed and configured. No additional packages needed!

## Basic Usage

### 1. Import the Module

```typescript
// Import everything you need
import { PayDB, ProfilesDB, Storage, account, ID, Query } from '@/lib/tabledb'

// Or import specific operations
import { createUser, getUserByUsername, updateUserProfile } from '@/lib/tabledb/paydb/users'
```

### 2. User Management

```typescript
// Create a new user
const user = await PayDB.createUser({
  userId: currentUser.$id,
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
  phoneNumber: '+1234567890',
})

// Check username availability
const available = await PayDB.checkUsernameAvailability('newusername')
```

### 3. Payment Requests

```typescript
// Create payment request/invoice
const request = await PayDB.createPaymentRequest({
  fromUserId: userId,
  toEmail: 'client@example.com',
  tokenId: 'ethereum',
  amount: '100',
  description: 'Consulting services',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
})

// Get user's payment requests
const { rows, total } = await PayDB.listPaymentRequestsByUser(userId)

// Mark as paid
await PayDB.markPaymentRequestAsPaid(requestId, 'tx_hash_123')
```

### 4. File Uploads

```typescript
// Upload profile avatar
const file = await Storage.uploadProfileAvatar(fileObject, userId)
const avatarUrl = Storage.getFileUrl(file.bucketId, file.$id)

// Upload document
const doc = await Storage.uploadDocument(fileObject, userId)

// Validate before upload
if (Storage.validateImageFile(file, 5)) {
  await Storage.uploadProfileAvatar(file, userId)
}
```

### 5. Profiles

```typescript
// Create profile
const profile = await ProfilesDB.createProfile({
  userId,
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Full-stack developer',
  skills: ['JavaScript', 'React', 'Node.js'],
})

// Update profile
await ProfilesDB.updateProfileByUserId(userId, {
  bio: 'Senior full-stack developer',
  hourlyRate: 75,
})

// Search by skill
const profiles = await ProfilesDB.listProfilesBySkill('React')
```

## Common Patterns

### Error Handling

```typescript
try {
  await PayDB.setUsername(userId, 'existingname')
} catch (error) {
  if (error.message === 'Username already taken') {
    // Handle duplicate username
  }
}
```

### Querying with Filters

```typescript
import { Query } from '@/lib/tabledb'

const requests = await PayDB.listPaymentRequests([
  Query.equal('status', 'pending'),
  Query.greaterThan('amount', '50'),
  Query.orderDesc('createdAt'),
], 25, 0)
```

### Atomic Balance Updates

```typescript
// Increment balance (thread-safe)
await PayDB.incrementAccountBalance(accountId, 100)

// Decrement with minimum check
await PayDB.decrementAccountBalance(accountId, 50)
```

## Next Steps

1. Read the full documentation: `/src/lib/tabledb/README.md`
2. Check examples: `/src/lib/tabledb/examples.ts`
3. Review types: `/src/lib/tabledb/types.ts`

## Need Help?

All functions are fully typed and documented with JSDoc comments. Your IDE will show you:
- Available parameters
- Return types
- Usage examples

Just start typing `PayDB.` or `ProfilesDB.` and your IDE autocomplete will guide you!
