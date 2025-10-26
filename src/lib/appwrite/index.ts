/**
 * Appwrite Library - Main Export
 * Provides all Appwrite/PayDB operations for PayLancer Capital
 */

// Core client
export { account, tablesdb, client, PAYDB_ID, PAYDB_TABLES } from './client'

// Auth
export {
  getCurrentUserId,
  getCurrentUser,
  isAuthenticated,
  logout,
  createEmailPasswordSession,
  createAnonymousSession,
} from './auth'

// Users
export {
  getUser,
  upsertUser,
  updateUserProfile,
  getUserByEmail,
  getUserByUsername,
  listActiveUsers,
  deleteUser,
} from './users'

// Legacy exports for backwards compatibility
export { default as Appwrite } from './client'
