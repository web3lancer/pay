/**
 * Appwrite PayDB Exchange Rates Table Operations
 * TablesDB operations for currency exchange rate management
 */

'use client'

import { tablesdb, PAYDB_ID, PAYDB_TABLES } from './client'
import { Query } from 'appwrite'
import type { ExchangeRates } from '@/types/appwrite.d'

/**
 * Fallback hardcoded rates for offline availability
 */
const FALLBACK_RATES: Record<string, number> = {
  'USD_EUR': 0.92,
  'USD_GBP': 0.79,
  'USD_JPY': 149.5,
  'BTC_USD': 65000,
  'ETH_USD': 3500,
  'MUSD_USD': 1.0,
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  try {
    const key = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`
    
    // Query for active rate
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.EXCHANGE_RATES,
      queries: [
        Query.equal('fromCurrency', fromCurrency.toUpperCase()),
        Query.equal('toCurrency', toCurrency.toUpperCase()),
        Query.equal('isActive', true),
      ],
    })
    
    if (result.total > 0 && result.rows.length > 0) {
      return (result.rows[0] as ExchangeRates).rate
    }
    
    // Fallback to hardcoded rate
    if (FALLBACK_RATES[key]) {
      return FALLBACK_RATES[key]
    }
    
    console.warn(`No exchange rate found for ${key}`)
    return null
  } catch (error) {
    console.warn(`Failed to get exchange rate ${fromCurrency}/${toCurrency}:`, error)
    // Return fallback if available
    const key = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`
    return FALLBACK_RATES[key] || null
  }
}

/**
 * List all active exchange rates
 */
export async function listExchangeRates(): Promise<ExchangeRates[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.EXCHANGE_RATES,
      queries: [Query.equal('isActive', true)],
    })
    return result.rows as ExchangeRates[]
  } catch (error) {
    console.error('Failed to list exchange rates:', error)
    return []
  }
}

/**
 * Get rates for a specific currency (as base)
 */
export async function getExchangeRatesFor(baseCurrency: string): Promise<ExchangeRates[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.EXCHANGE_RATES,
      queries: [
        Query.equal('fromCurrency', baseCurrency.toUpperCase()),
        Query.equal('isActive', true),
      ],
    })
    return result.rows as ExchangeRates[]
  } catch (error) {
    console.error(`Failed to get rates for ${baseCurrency}:`, error)
    return []
  }
}

/**
 * Create or update exchange rate
 */
export async function upsertExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  source: string = 'manual'
): Promise<ExchangeRates | null> {
  try {
    const rateId = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`
    
    const result = await tablesdb.upsertRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.EXCHANGE_RATES,
      rowId: rateId,
      data: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate,
        source,
        lastUpdated: new Date().toISOString(),
        isActive: true,
      },
    })
    return result as ExchangeRates
  } catch (error) {
    console.error('Failed to upsert exchange rate:', error)
    return null
  }
}

export default {
  getExchangeRate,
  listExchangeRates,
  getExchangeRatesFor,
  upsertExchangeRate,
}
