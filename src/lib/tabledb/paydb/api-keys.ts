/**
 * PayDB API Keys Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { PayDBAPIKey, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.API_KEYS

// ===========================
// Create API Key
// ===========================

export async function createAPIKey(
  data: CreateRowData<PayDBAPIKey>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<PayDBAPIKey>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      keyId: data.keyId || ID.unique(),
      userId: data.userId,
      keyName: data.keyName,
      publicKey: data.publicKey,
      hashedSecret: data.hashedSecret,
      permissions: data.permissions,
      isActive: data.isActive !== undefined ? data.isActive : true,
      lastUsed: data.lastUsed,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    },
    permissions: [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  })
}

// ===========================
// Get API Key
// ===========================

export async function getAPIKey(rowId: string) {
  return tablesDB.getRow<PayDBAPIKey>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getAPIKeyByPublicKey(publicKey: string) {
  const response = await tablesDB.listRows<PayDBAPIKey>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('publicKey', publicKey), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update API Key
// ===========================

export async function updateAPIKey(rowId: string, data: UpdateRowData<PayDBAPIKey>) {
  return tablesDB.updateRow<PayDBAPIKey>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data,
  })
}

export async function updateAPIKeyLastUsed(publicKey: string) {
  const apiKey = await getAPIKeyByPublicKey(publicKey)
  if (!apiKey) {
    throw new Error('API key not found')
  }
  return updateAPIKey(apiKey.$id, {
    lastUsed: new Date().toISOString(),
  })
}

// ===========================
// Delete API Key
// ===========================

export async function deleteAPIKey(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function deleteAPIKeyByPublicKey(publicKey: string) {
  const apiKey = await getAPIKeyByPublicKey(publicKey)
  if (!apiKey) {
    throw new Error('API key not found')
  }
  return deleteAPIKey(apiKey.$id)
}

// ===========================
// List API Keys
// ===========================

export async function listAPIKeys(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<PayDBAPIKey>> {
  return tablesDB.listRows<PayDBAPIKey>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listAPIKeysByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listAPIKeys([Query.equal('userId', userId)], limit, offset)
}

export async function listActiveAPIKeysByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listAPIKeys(
    [Query.equal('userId', userId), Query.equal('isActive', true)],
    limit,
    offset
  )
}

// ===========================
// Status Operations
// ===========================

export async function activateAPIKey(publicKey: string) {
  const apiKey = await getAPIKeyByPublicKey(publicKey)
  if (!apiKey) {
    throw new Error('API key not found')
  }
  return updateAPIKey(apiKey.$id, { isActive: true })
}

export async function deactivateAPIKey(publicKey: string) {
  const apiKey = await getAPIKeyByPublicKey(publicKey)
  if (!apiKey) {
    throw new Error('API key not found')
  }
  return updateAPIKey(apiKey.$id, { isActive: false })
}

// ===========================
// Validation Operations
// ===========================

export async function validateAPIKey(publicKey: string): Promise<boolean> {
  const apiKey = await getAPIKeyByPublicKey(publicKey)
  
  if (!apiKey || !apiKey.isActive) {
    return false
  }
  
  // Check if expired
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return false
  }
  
  return true
}
