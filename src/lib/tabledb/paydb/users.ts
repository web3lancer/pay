/**
 * PayDB Users Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { PayDBUser, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.USERS

// ===========================
// Create User
// ===========================

export async function createUser(data: CreateRowData<PayDBUser>, rowId: string = ID.unique()) {
  return tablesDB.createRow<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      userId: data.userId,
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      profileImage: data.profileImage,
      phoneNumber: data.phoneNumber,
      kycStatus: data.kycStatus || 'unverified',
      kycLevel: data.kycLevel || 0,
      twoFactorEnabled: data.twoFactorEnabled || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      country: data.country,
      timezone: data.timezone,
      preferredCurrency: data.preferredCurrency || 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    permissions: [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  })
}

// ===========================
// Get User
// ===========================

export async function getUser(rowId: string) {
  return tablesDB.getRow<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getUserByUserId(userId: string) {
  const response = await tablesDB.listRows<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('userId', userId), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getUserByEmail(email: string) {
  const response = await tablesDB.listRows<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('email', email), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getUserByUsername(username: string) {
  const response = await tablesDB.listRows<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('username', username), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update User
// ===========================

export async function updateUser(rowId: string, data: UpdateRowData<PayDBUser>) {
  const updateData: any = { ...data }
  if (Object.keys(data).length > 0) {
    updateData.updatedAt = new Date().toISOString()
  }
  
  return tablesDB.updateRow<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: updateData,
  })
}

export async function updateUserByUserId(userId: string, data: UpdateRowData<PayDBUser>) {
  const user = await getUserByUserId(userId)
  if (!user) {
    throw new Error('User not found')
  }
  return updateUser(user.$id, data)
}

// ===========================
// Delete User
// ===========================

export async function deleteUser(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function deleteUserByUserId(userId: string) {
  const user = await getUserByUserId(userId)
  if (!user) {
    throw new Error('User not found')
  }
  return deleteUser(user.$id)
}

// ===========================
// List Users
// ===========================

export async function listUsers(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<PayDBUser>> {
  return tablesDB.listRows<PayDBUser>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listActiveUsers(limit: number = 25, offset: number = 0) {
  return listUsers([Query.equal('isActive', true)], limit, offset)
}

// ===========================
// Username Operations
// ===========================

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const user = await getUserByUsername(username)
  return !user
}

export async function setUsername(userId: string, username: string) {
  // Check if username is available
  const isAvailable = await checkUsernameAvailability(username)
  if (!isAvailable) {
    throw new Error('Username already taken')
  }
  
  return updateUserByUserId(userId, { username })
}

// ===========================
// Profile Operations
// ===========================

export async function updateUserProfile(userId: string, data: {
  displayName?: string
  profileImage?: string
  phoneNumber?: string
  country?: string
  timezone?: string
  preferredCurrency?: string
}) {
  return updateUserByUserId(userId, data)
}

export async function setUserProfileImage(userId: string, profileImageUrl: string) {
  return updateUserByUserId(userId, { profileImage: profileImageUrl })
}

// ===========================
// Security Operations
// ===========================

export async function enableTwoFactor(userId: string) {
  return updateUserByUserId(userId, { twoFactorEnabled: true })
}

export async function disableTwoFactor(userId: string) {
  return updateUserByUserId(userId, { twoFactorEnabled: false })
}

export async function updateKYCStatus(userId: string, status: string, level?: number) {
  const updateData: any = { kycStatus: status }
  if (level !== undefined) {
    updateData.kycLevel = level
  }
  return updateUserByUserId(userId, updateData)
}

// ===========================
// Account Status Operations
// ===========================

export async function deactivateUser(userId: string) {
  return updateUserByUserId(userId, { isActive: false })
}

export async function activateUser(userId: string) {
  return updateUserByUserId(userId, { isActive: true })
}
