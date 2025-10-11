/**
 * PayDB Tokens Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query } from '../client'
import type { PayDBToken, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.TOKENS

// ===========================
// Create Token
// ===========================

export async function createToken(data: CreateRowData<PayDBToken>, rowId: string = ID.unique()) {
  return tablesDB.createRow<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      tokenId: data.tokenId || ID.unique(),
      symbol: data.symbol,
      name: data.name,
      blockchain: data.blockchain,
      contractAddress: data.contractAddress,
      decimals: data.decimals,
      logoUrl: data.logoUrl,
      isStablecoin: data.isStablecoin || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      marketCap: data.marketCap,
      currentPrice: data.currentPrice,
      priceChange24h: data.priceChange24h,
      lastPriceUpdate: data.lastPriceUpdate,
      createdAt: new Date().toISOString(),
    },
  })
}

// ===========================
// Get Token
// ===========================

export async function getToken(rowId: string) {
  return tablesDB.getRow<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getTokenBySymbol(symbol: string) {
  const response = await tablesDB.listRows<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('symbol', symbol), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getTokenByContractAddress(contractAddress: string, blockchain: string) {
  const response = await tablesDB.listRows<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal('contractAddress', contractAddress),
      Query.equal('blockchain', blockchain),
      Query.limit(1)
    ],
  })
  return response.rows[0] || null
}

// ===========================
// Update Token
// ===========================

export async function updateToken(rowId: string, data: UpdateRowData<PayDBToken>) {
  return tablesDB.updateRow<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data,
  })
}

export async function updateTokenBySymbol(symbol: string, data: UpdateRowData<PayDBToken>) {
  const token = await getTokenBySymbol(symbol)
  if (!token) {
    throw new Error('Token not found')
  }
  return updateToken(token.$id, data)
}

// ===========================
// Delete Token
// ===========================

export async function deleteToken(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function deleteTokenBySymbol(symbol: string) {
  const token = await getTokenBySymbol(symbol)
  if (!token) {
    throw new Error('Token not found')
  }
  return deleteToken(token.$id)
}

// ===========================
// List Tokens
// ===========================

export async function listTokens(
  queries: string[] = [],
  limit: number = 50,
  offset: number = 0
): Promise<TableDBListResponse<PayDBToken>> {
  return tablesDB.listRows<PayDBToken>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listActiveTokens(limit: number = 50, offset: number = 0) {
  return listTokens([Query.equal('isActive', true)], limit, offset)
}

export async function listTokensByBlockchain(blockchain: string, limit: number = 50, offset: number = 0) {
  return listTokens([Query.equal('blockchain', blockchain)], limit, offset)
}

export async function listStablecoins(limit: number = 50, offset: number = 0) {
  return listTokens([Query.equal('isStablecoin', true)], limit, offset)
}

// ===========================
// Price Operations
// ===========================

export async function updateTokenPrice(symbol: string, price: number, priceChange24h?: number) {
  return updateTokenBySymbol(symbol, {
    currentPrice: price,
    priceChange24h,
    lastPriceUpdate: new Date().toISOString(),
  })
}

export async function updateTokenMarketData(
  symbol: string,
  data: {
    currentPrice?: number
    priceChange24h?: number
    marketCap?: number
  }
) {
  return updateTokenBySymbol(symbol, {
    ...data,
    lastPriceUpdate: new Date().toISOString(),
  })
}

// ===========================
// Search Operations
// ===========================

export async function searchTokensByName(searchTerm: string, limit: number = 25, offset: number = 0) {
  return listTokens([Query.search('name', searchTerm)], limit, offset)
}

// ===========================
// Status Operations
// ===========================

export async function activateToken(symbol: string) {
  return updateTokenBySymbol(symbol, { isActive: true })
}

export async function deactivateToken(symbol: string) {
  return updateTokenBySymbol(symbol, { isActive: false })
}
