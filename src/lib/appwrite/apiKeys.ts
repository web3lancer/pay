/**
 * Appwrite PayDB API Keys Table Operations
 * TablesDB operations for API key management
 */

'use client'

import { tablesdb, PAYDB_ID, PAYDB_TABLES } from './client'
import { Query, ID } from 'appwrite'
import type { ApiKeys } from '@/types/appwrite.d'
import crypto from 'crypto'

/**
 * Generate random API key pair
 */
function generateKeyPair(): { publicKey: string; secretKey: string } {
  const publicKey = `pk_${crypto.randomBytes(16).toString('hex')}`
  const secretKey = `sk_${crypto.randomBytes(32).toString('hex')}`
  return { publicKey, secretKey }
}

/**
 * Hash secret key (simple bcrypt-like hash)
 * In production, use actual bcrypt: `await bcrypt.hash(secret, 10)`
 */
function hashSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex')
}

/**
 * Get API key by ID
 */
export async function getApiKey(keyId: string): Promise<ApiKeys | null> {
  try {
    const result = await tablesdb.getRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      rowId: keyId,
    })
    return result as ApiKeys
  } catch (error) {
    console.warn(`Failed to get API key ${keyId}:`, error)
    return null
  }
}

/**
 * List all API keys for a user
 */
export async function listUserApiKeys(userId: string): Promise<ApiKeys[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      queries: [
        Query.equal('userId', userId),
        Query.equal('isActive', true),
      ],
    })
    return result.rows as ApiKeys[]
  } catch (error) {
    console.error(`Failed to list API keys for user ${userId}:`, error)
    return []
  }
}

/**
 * Create new API key
 */
export async function createApiKey(
  userId: string,
  keyName: string,
  permissions: string = 'read'
): Promise<{ key: ApiKeys; secretKey: string } | null> {
  try {
    const { publicKey, secretKey } = generateKeyPair()
    const hashedSecret = hashSecret(secretKey)
    const keyId = ID.unique()

    const result = await tablesdb.createRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      rowId: keyId,
      data: {
        userId,
        keyName,
        publicKey,
        hashedSecret,
        permissions,
        isActive: true,
        lastUsed: null,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      },
    })

    // Return the full key once (secret won't be retrievable after this)
    return {
      key: result as ApiKeys,
      secretKey,
    }
  } catch (error) {
    console.error('Failed to create API key:', error)
    return null
  }
}

/**
 * Verify API key (check if secret matches)
 */
export async function verifyApiKey(publicKey: string, secretKey: string): Promise<ApiKeys | null> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      queries: [
        Query.equal('publicKey', publicKey),
        Query.equal('isActive', true),
      ],
    })

    if (result.total > 0 && result.rows.length > 0) {
      const key = result.rows[0] as ApiKeys
      const hashedProvidedSecret = hashSecret(secretKey)
      
      if (key.hashedSecret === hashedProvidedSecret) {
        // Update lastUsed timestamp
        await updateApiKeyLastUsed(key.$id!)
        return key
      }
    }

    return null
  } catch (error) {
    console.error('Failed to verify API key:', error)
    return null
  }
}

/**
 * Update API key last used timestamp
 */
export async function updateApiKeyLastUsed(keyId: string): Promise<ApiKeys | null> {
  try {
    const result = await tablesdb.updateRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      rowId: keyId,
      data: {
        lastUsed: new Date().toISOString(),
      },
    })
    return result as ApiKeys
  } catch (error) {
    console.error(`Failed to update API key ${keyId}:`, error)
    return null
  }
}

/**
 * Revoke API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  try {
    await tablesdb.updateRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      rowId: keyId,
      data: {
        isActive: false,
      },
    })
    return true
  } catch (error) {
    console.error(`Failed to revoke API key ${keyId}:`, error)
    return false
  }
}

/**
 * Delete API key permanently
 */
export async function deleteApiKey(keyId: string): Promise<boolean> {
  try {
    await tablesdb.deleteRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.API_KEYS,
      rowId: keyId,
    })
    return true
  } catch (error) {
    console.error(`Failed to delete API key ${keyId}:`, error)
    return false
  }
}

export default {
  getApiKey,
  listUserApiKeys,
  createApiKey,
  verifyApiKey,
  updateApiKeyLastUsed,
  revokeApiKey,
  deleteApiKey,
}
