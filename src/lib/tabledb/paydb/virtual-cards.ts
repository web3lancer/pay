/**
 * PayDB Virtual Cards Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { PayDBVirtualCard, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.VIRTUAL_CARDS

// ===========================
// Create Virtual Card
// ===========================

export async function createVirtualCard(
  data: CreateRowData<PayDBVirtualCard>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<PayDBVirtualCard>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      cardId: data.cardId || ID.unique(),
      userId: data.userId,
      cardNumber: data.cardNumber,
      expiry: data.expiry,
      cvv: data.cvv,
      cardType: data.cardType,
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
// Get Virtual Card
// ===========================

export async function getVirtualCard(rowId: string) {
  return tablesDB.getRow<PayDBVirtualCard>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getVirtualCardByCardId(cardId: string) {
  const response = await tablesDB.listRows<PayDBVirtualCard>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('cardId', cardId), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update Virtual Card
// ===========================

export async function updateVirtualCard(rowId: string, data: UpdateRowData<PayDBVirtualCard>) {
  const updateData: any = { ...data }
  updateData.updatedAt = new Date().toISOString()
  
  return tablesDB.updateRow<PayDBVirtualCard>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: updateData,
  })
}

// ===========================
// Delete Virtual Card
// ===========================

export async function deleteVirtualCard(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

// ===========================
// List Virtual Cards
// ===========================

export async function listVirtualCards(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<PayDBVirtualCard>> {
  return tablesDB.listRows<PayDBVirtualCard>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listVirtualCardsByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listVirtualCards([Query.equal('userId', userId)], limit, offset)
}

export async function listActiveVirtualCardsByUser(userId: string, limit: number = 25, offset: number = 0) {
  return listVirtualCards(
    [Query.equal('userId', userId), Query.equal('status', 'active')],
    limit,
    offset
  )
}

// ===========================
// Status Operations
// ===========================

export async function activateVirtualCard(cardId: string) {
  const card = await getVirtualCardByCardId(cardId)
  if (!card) {
    throw new Error('Virtual card not found')
  }
  return updateVirtualCard(card.$id, { status: 'active' })
}

export async function deactivateVirtualCard(cardId: string) {
  const card = await getVirtualCardByCardId(cardId)
  if (!card) {
    throw new Error('Virtual card not found')
  }
  return updateVirtualCard(card.$id, { status: 'inactive' })
}

export async function freezeVirtualCard(cardId: string) {
  const card = await getVirtualCardByCardId(cardId)
  if (!card) {
    throw new Error('Virtual card not found')
  }
  return updateVirtualCard(card.$id, { status: 'frozen' })
}
