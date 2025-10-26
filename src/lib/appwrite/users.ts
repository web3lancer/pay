/**
 * PayDB Users Table Operations
 * TablesDB operations for user management in PayDB
 */

'use client'

import { tablesdb, PAYDB_ID, PAYDB_TABLES } from './client'
import { Query, ID } from 'appwrite'
import type { Users } from '@/types/appwrite.d'

/**
 * Get user by ID from PayDB
 */
export async function getUser(userId: string): Promise<Users | null> {
  try {
    const result = await tablesdb.getRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      rowId: userId,
    })
    return result as Users
  } catch (error) {
    console.warn(`Failed to get user ${userId}:`, error)
    return null
  }
}

/**
 * Create or update user in PayDB
 */
export async function upsertUser(
  userId: string,
  userData: Partial<Users>
): Promise<Users | null> {
  try {
    const result = await tablesdb.upsertRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      rowId: userId,
      data: {
        userId,
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        profileImage: userData.profileImage,
        phoneNumber: userData.phoneNumber,
        kycStatus: userData.kycStatus || 'pending',
        kycLevel: userData.kycLevel || 0,
        twoFactorEnabled: userData.twoFactorEnabled || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        country: userData.country,
        timezone: userData.timezone,
        preferredCurrency: userData.preferredCurrency || 'USD',
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    return result as Users
  } catch (error) {
    console.error(`Failed to upsert user ${userId}:`, error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Users>
): Promise<Users | null> {
  try {
    const result = await tablesdb.updateRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      rowId: userId,
      data: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    })
    return result as Users
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error)
    return null
  }
}

/**
 * Search users by email
 */
export async function getUserByEmail(email: string): Promise<Users | null> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      queries: [Query.equal('email', email)],
    })
    
    if (result.total > 0 && result.rows.length > 0) {
      return result.rows[0] as Users
    }
    return null
  } catch (error) {
    console.warn(`Failed to get user by email ${email}:`, error)
    return null
  }
}

/**
 * Search users by username
 */
export async function getUserByUsername(username: string): Promise<Users | null> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      queries: [Query.equal('username', username)],
    })
    
    if (result.total > 0 && result.rows.length > 0) {
      return result.rows[0] as Users
    }
    return null
  } catch (error) {
    console.warn(`Failed to get user by username ${username}:`, error)
    return null
  }
}

/**
 * List all active users (paginated)
 */
export async function listActiveUsers(
  limit: number = 25,
  offset: number = 0
): Promise<{ users: Users[]; total: number }> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      queries: [
        Query.equal('isActive', true),
        Query.limit(limit),
        Query.offset(offset),
      ],
    })
    
    return {
      users: result.rows as Users[],
      total: result.total,
    }
  } catch (error) {
    console.error('Failed to list active users:', error)
    return { users: [], total: 0 }
  }
}

/**
 * Delete user from PayDB
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await tablesdb.deleteRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.USERS,
      rowId: userId,
    })
    return true
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error)
    return false
  }
}

export default {
  getUser,
  upsertUser,
  updateUserProfile,
  getUserByEmail,
  getUserByUsername,
  listActiveUsers,
  deleteUser,
}
