/**
 * Appwrite PayDB Tokens Table Operations
 * TablesDB operations for token management (BTC, MUSD, tBTC, etc.)
 */

'use client'

import { tablesdb, PAYDB_ID, PAYDB_TABLES } from './client'
import { Query } from 'appwrite'
import type { Tokens } from '@/types/appwrite.d'

/**
 * Get token by ID
 */
export async function getToken(tokenId: string): Promise<Tokens | null> {
  try {
    const result = await tablesdb.getRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.TOKENS,
      rowId: tokenId,
    })
    return result as Tokens
  } catch (error) {
    console.warn(`Failed to get token ${tokenId}:`, error)
    return null
  }
}

/**
 * List all active tokens
 */
export async function listTokens(limit: number = 100): Promise<Tokens[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.TOKENS,
      queries: [
        Query.equal('isActive', true),
        Query.limit(limit),
      ],
    })
    return result.rows as Tokens[]
  } catch (error) {
    console.error('Failed to list tokens:', error)
    return []
  }
}

/**
 * Get token by symbol (e.g., 'BTC', 'MUSD', 'tBTC')
 */
export async function getTokenBySymbol(symbol: string): Promise<Tokens | null> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.TOKENS,
      queries: [Query.equal('symbol', symbol.toUpperCase())],
    })
    
    if (result.total > 0 && result.rows.length > 0) {
      return result.rows[0] as Tokens
    }
    return null
  } catch (error) {
    console.warn(`Failed to get token by symbol ${symbol}:`, error)
    return null
  }
}

/**
 * Get token by blockchain (e.g., 'bitcoin', 'mezo')
 */
export async function getTokensByBlockchain(blockchain: string): Promise<Tokens[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.TOKENS,
      queries: [
        Query.equal('blockchain', blockchain.toLowerCase()),
        Query.equal('isActive', true),
      ],
    })
    return result.rows as Tokens[]
  } catch (error) {
    console.error(`Failed to get tokens for blockchain ${blockchain}:`, error)
    return []
  }
}

/**
 * Check if token is stablecoin
 */
export async function getStablecoins(): Promise<Tokens[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.TOKENS,
      queries: [
        Query.equal('isStablecoin', true),
        Query.equal('isActive', true),
      ],
    })
    return result.rows as Tokens[]
  } catch (error) {
    console.error('Failed to get stablecoins:', error)
    return []
  }
}

export default {
  getToken,
  listTokens,
  getTokenBySymbol,
  getTokensByBlockchain,
  getStablecoins,
}
