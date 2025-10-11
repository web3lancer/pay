/**
 * PayDB Payment Requests Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PAYDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { PayDBPaymentRequest, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PAY_DB
const TABLE_ID = PAYDB_TABLES.PAYMENT_REQUESTS

// ===========================
// Create Payment Request
// ===========================

export async function createPaymentRequest(
  data: CreateRowData<PayDBPaymentRequest>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      requestId: data.requestId || ID.unique(),
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      toEmail: data.toEmail,
      tokenId: data.tokenId,
      amount: data.amount,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status || 'pending',
      paymentTxId: data.paymentTxId,
      invoiceNumber: data.invoiceNumber,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      paidAt: data.paidAt,
    },
    permissions: [
      Permission.read(Role.user(data.fromUserId)),
      Permission.update(Role.user(data.fromUserId)),
      Permission.delete(Role.user(data.fromUserId)),
      ...(data.toUserId ? [
        Permission.read(Role.user(data.toUserId)),
        Permission.update(Role.user(data.toUserId)),
      ] : []),
    ],
  })
}

// ===========================
// Get Payment Request
// ===========================

export async function getPaymentRequest(rowId: string) {
  return tablesDB.getRow<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getPaymentRequestByRequestId(requestId: string) {
  const response = await tablesDB.listRows<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('requestId', requestId), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getPaymentRequestByInvoiceNumber(invoiceNumber: string) {
  const response = await tablesDB.listRows<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('invoiceNumber', invoiceNumber), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update Payment Request
// ===========================

export async function updatePaymentRequest(
  rowId: string,
  data: UpdateRowData<PayDBPaymentRequest>
) {
  return tablesDB.updateRow<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data,
  })
}

export async function updatePaymentRequestByRequestId(
  requestId: string,
  data: UpdateRowData<PayDBPaymentRequest>
) {
  const request = await getPaymentRequestByRequestId(requestId)
  if (!request) {
    throw new Error('Payment request not found')
  }
  return updatePaymentRequest(request.$id, data)
}

// ===========================
// Delete Payment Request
// ===========================

export async function deletePaymentRequest(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function deletePaymentRequestByRequestId(requestId: string) {
  const request = await getPaymentRequestByRequestId(requestId)
  if (!request) {
    throw new Error('Payment request not found')
  }
  return deletePaymentRequest(request.$id)
}

// ===========================
// List Payment Requests
// ===========================

export async function listPaymentRequests(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<PayDBPaymentRequest>> {
  return tablesDB.listRows<PayDBPaymentRequest>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listPaymentRequestsByUser(
  userId: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.or([
      Query.equal('fromUserId', userId),
      Query.equal('toUserId', userId)
    ])],
    limit,
    offset
  )
}

export async function listPaymentRequestsCreatedByUser(
  userId: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.equal('fromUserId', userId)],
    limit,
    offset
  )
}

export async function listPaymentRequestsReceivedByUser(
  userId: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.equal('toUserId', userId)],
    limit,
    offset
  )
}

export async function listPaymentRequestsByEmail(
  email: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.equal('toEmail', email)],
    limit,
    offset
  )
}

export async function listPaymentRequestsByStatus(
  status: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.equal('status', status)],
    limit,
    offset
  )
}

export async function listPendingPaymentRequests(
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequestsByStatus('pending', limit, offset)
}

export async function listPaidPaymentRequests(
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequestsByStatus('paid', limit, offset)
}

// ===========================
// Status Operations
// ===========================

export async function markPaymentRequestAsPaid(
  requestId: string,
  paymentTxId: string
) {
  return updatePaymentRequestByRequestId(requestId, {
    status: 'paid',
    paymentTxId,
    paidAt: new Date().toISOString(),
  })
}

export async function markPaymentRequestAsCancelled(requestId: string) {
  return updatePaymentRequestByRequestId(requestId, {
    status: 'cancelled',
  })
}

export async function markPaymentRequestAsExpired(requestId: string) {
  return updatePaymentRequestByRequestId(requestId, {
    status: 'expired',
  })
}

// ===========================
// Search Operations
// ===========================

export async function searchPaymentRequestsByDescription(
  searchTerm: string,
  limit: number = 25,
  offset: number = 0
) {
  return listPaymentRequests(
    [Query.search('description', searchTerm)],
    limit,
    offset
  )
}

// ===========================
// Statistics
// ===========================

export async function getTotalPaymentRequestsByUser(userId: string) {
  const response = await listPaymentRequestsByUser(userId, 1, 0)
  return response.total
}

export async function getTotalAmountRequestedByUser(userId: string): Promise<number> {
  const requests = await listPaymentRequestsCreatedByUser(userId, 100, 0)
  return requests.rows.reduce((sum, req) => sum + parseFloat(req.amount), 0)
}

export async function getTotalAmountPaidToUser(userId: string): Promise<number> {
  const requests = await listPaymentRequestsReceivedByUser(userId, 100, 0)
  const paidRequests = requests.rows.filter(req => req.status === 'paid')
  return paidRequests.reduce((sum, req) => sum + parseFloat(req.amount), 0)
}
