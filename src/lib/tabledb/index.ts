/**
 * TableDB Main Export
 * 
 * Complete CRUD operations for all TableDB databases and storage buckets
 * 
 * Usage:
 * ```ts
 * import { PayDB, ProfilesDB, Storage, account } from '@/lib/tabledb'
 * 
 * // Create a user
 * const user = await PayDB.createUser({ ... })
 * 
 * // Create payment request
 * const request = await PayDB.createPaymentRequest({ ... })
 * 
 * // Upload file
 * const file = await Storage.uploadUserAsset(file, userId)
 * ```
 */

// Export client and utilities
export * from './client'
export * from './types'

// Export all PayDB operations
import * as PayDB from './paydb'
export { PayDB }

// Export all ProfilesDB operations
import * as ProfilesDB from './profilesdb'
export { ProfilesDB }

// Export all Storage operations
import * as Storage from './storage'
export { Storage }

// Re-export commonly used items for convenience
export { account, tablesDB, storage, functions } from './client'
export { ID, Query, Permission, Role } from './client'
