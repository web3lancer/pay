/**
 * PayDB Virtual Accounts Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { PayDBVirtualAccount, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.VIRTUAL_ACCOUNTS

// ===========================
// Create Virtual Account
// ===========================

export async function createVirtualAccount(
  data: CreateRowData<PayDBVirtualAccount>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      accountId: data.accountId || ID.unique(),
      userId: data.userId,
      accountNumber: data.accountNumber,
      currency: data.currency || 'USD',
      balance: data.balance || 0,
      status: data.status || 'active',
      linkedWalletId: data.linkedWalletId,
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
// Get Virtual Account
// ===========================

export async function getVirtualAccount(rowId: string) {
  return tablesDB.getRow<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getVirtualAccountByAccountId(accountId: string) {
  const response = await tablesDB.listRows<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('accountId', accountId), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getVirtualAccountByAccountNumber(accountNumber: string) {
  const response = await tablesDB.listRows<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('accountNumber', accountNumber), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update Virtual Account
// ===========================

export async function updateVirtualAccount(rowId: string, data: UpdateRowData<PayDBVirtualAccount>) {
  const updateData: any = { ...data }
  updateData.updatedAt = new Date().toISOString()
  
  return tablesDB.updateRow<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: updateData,
  })
}

// ===========================
// Delete Virtual Account
// ===========================

export async function deleteVirtualAccount(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

// ===========================
// List Virtual Accounts
// ===========================

export async function listVirtualAccounts(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<PayDBVirtualAccount>> {
  return tablesDB.listRows<PayDBVirtualAccount>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listVirtualAccountsByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listVirtualAccounts([Query.equal('userId', userId)], limit, offset)
}

export async function listActiveVirtualAccountsByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listVirtualAccounts(
    [Query.equal('userId', userId), Query.equal('status', 'active')],
    limit,
    offset
  )
}

export async function listVirtualAccountsByCurrency(
  userId: string,
  currency: string,
  limit: number = 25,
  offset: number = 0
) {
  return listVirtualAccounts(
    [Query.equal('userId', userId), Query.equal('currency', currency)],
    limit,
    offset
  )
}

// ===========================
// Balance Operations
// ===========================

export async function incrementAccountBalance(accountId: string, amount: number) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  
  return tablesDB.incrementRowColumn({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId: account.$id,
    column: 'balance',
    value: amount,
  })
}

export async function decrementAccountBalance(accountId: string, amount: number) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  
  return tablesDB.decrementRowColumn({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId: account.$id,
    column: 'balance',
    value: amount,
    min: 0, // Don't allow negative balance
  })
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  return updateVirtualAccount(account.$id, { balance: newBalance })
}

// ===========================
// Status Operations
// ===========================

export async function activateVirtualAccount(accountId: string) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  return updateVirtualAccount(account.$id, { status: 'active' })
}

export async function deactivateVirtualAccount(accountId: string) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  return updateVirtualAccount(account.$id, { status: 'inactive' })
}

export async function freezeVirtualAccount(accountId: string) {
  const account = await getVirtualAccountByAccountId(accountId)
  if (!account) {
    throw new Error('Virtual account not found')
  }
  return updateVirtualAccount(account.$id, { status: 'frozen' })
}
