/**
 * PayDB Exchange Rates Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query } from '../client'
import type { PayDBExchangeRate, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.EXCHANGE_RATES

// ===========================
// Create Exchange Rate
// ===========================

export async function createExchangeRate(
  data: CreateRowData<PayDBExchangeRate>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      rateId: data.rateId || ID.unique(),
      fromCurrency: data.fromCurrency,
      toCurrency: data.toCurrency,
      rate: data.rate,
      source: data.source,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  })
}

// ===========================
// Get Exchange Rate
// ===========================

export async function getExchangeRate(rowId: string) {
  return tablesDB.getRow<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getExchangeRatePair(fromCurrency: string, toCurrency: string) {
  const response = await tablesDB.listRows<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal('fromCurrency', fromCurrency),
      Query.equal('toCurrency', toCurrency),
      Query.equal('isActive', true),
      Query.orderDesc('lastUpdated'),
      Query.limit(1),
    ],
  })
  return response.rows[0] || null
}

// ===========================
// Update Exchange Rate
// ===========================

export async function updateExchangeRate(rowId: string, data: UpdateRowData<PayDBExchangeRate>) {
  const updateData: any = { ...data }
  if (data.rate !== undefined) {
    updateData.lastUpdated = new Date().toISOString()
  }
  
  return tablesDB.updateRow<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: updateData,
  })
}

export async function updateExchangeRatePair(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  source: string
) {
  const existingRate = await getExchangeRatePair(fromCurrency, toCurrency)
  
  if (existingRate) {
    return updateExchangeRate(existingRate.$id, {
      rate,
      source,
      lastUpdated: new Date().toISOString(),
    })
  } else {
    return createExchangeRate({
      fromCurrency,
      toCurrency,
      rate,
      source,
      lastUpdated: new Date().toISOString(),
      isActive: true,
    })
  }
}

// ===========================
// Delete Exchange Rate
// ===========================

export async function deleteExchangeRate(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

// ===========================
// List Exchange Rates
// ===========================

export async function listExchangeRates(
  queries: string[] = [],
  limit: number = 50,
  offset: number = 0
): Promise<TableDBListResponse<PayDBExchangeRate>> {
  return tablesDB.listRows<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listActiveExchangeRates(limit: number = 50, offset: number = 0) {
  return listExchangeRates([Query.equal('isActive', true)], limit, offset)
}

export async function listExchangeRatesForCurrency(currency: string, limit: number = 50, offset: number = 0) {
  return listExchangeRates(
    [Query.equal('fromCurrency', currency)],
    limit,
    offset
  )
}

export async function listExchangeRatesBySource(source: string, limit: number = 50, offset: number = 0) {
  return listExchangeRates([Query.equal('source', source)], limit, offset)
}

// ===========================
// Conversion Operations
// ===========================

export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }
  
  const rate = await getExchangeRatePair(fromCurrency, toCurrency)
  if (!rate) {
    throw new Error(`Exchange rate not found for ${fromCurrency}/${toCurrency}`)
  }
  
  return amount * rate.rate
}

// ===========================
// Bulk Operations
// ===========================

export async function bulkUpdateExchangeRates(
  rates: Array<{
    fromCurrency: string
    toCurrency: string
    rate: number
    source: string
  }>
) {
  const promises = rates.map(r => 
    updateExchangeRatePair(r.fromCurrency, r.toCurrency, r.rate, r.source)
  )
  
  return Promise.all(promises)
}

// ===========================
// Status Operations
// ===========================

export async function deactivateExchangeRate(fromCurrency: string, toCurrency: string) {
  const rate = await getExchangeRatePair(fromCurrency, toCurrency)
  if (!rate) {
    throw new Error('Exchange rate not found')
  }
  return updateExchangeRate(rate.$id, { isActive: false })
}

export async function activateExchangeRate(fromCurrency: string, toCurrency: string) {
  const response = await tablesDB.listRows<PayDBExchangeRate>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal('fromCurrency', fromCurrency),
      Query.equal('toCurrency', toCurrency),
      Query.limit(1),
    ],
  })
  
  const rate = response.rows[0]
  if (!rate) {
    throw new Error('Exchange rate not found')
  }
  return updateExchangeRate(rate.$id, { isActive: true })
}
