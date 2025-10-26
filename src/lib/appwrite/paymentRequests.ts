/**
 * Appwrite PayDB Payment Requests Table Operations
 * TablesDB operations for payment request management
 */

'use client'

import { tablesdb, PAYDB_ID, PAYDB_TABLES } from './client'
import { Query, ID } from 'appwrite'
import type { PaymentRequests } from '@/types/appwrite.d'

/**
 * Get payment request by ID
 */
export async function getPaymentRequest(requestId: string): Promise<PaymentRequests | null> {
  try {
    const result = await tablesdb.getRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      rowId: requestId,
    })
    return result as PaymentRequests
  } catch (error) {
    console.warn(`Failed to get payment request ${requestId}:`, error)
    return null
  }
}

/**
 * List payment requests from a user (sender)
 */
export async function listUserPaymentRequests(
  userId: string,
  limit: number = 50
): Promise<PaymentRequests[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      queries: [
        Query.equal('fromUserId', userId),
        Query.limit(limit),
        Query.orderDesc('createdAt'),
      ],
    })
    return result.rows as PaymentRequests[]
  } catch (error) {
    console.error(`Failed to list payment requests for user ${userId}:`, error)
    return []
  }
}

/**
 * List payment requests received by a user
 */
export async function listReceivedPaymentRequests(
  toEmail: string,
  limit: number = 50
): Promise<PaymentRequests[]> {
  try {
    const result = await tablesdb.listRows({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      queries: [
        Query.equal('toEmail', toEmail),
        Query.limit(limit),
        Query.orderDesc('createdAt'),
      ],
    })
    return result.rows as PaymentRequests[]
  } catch (error) {
    console.error(`Failed to list received payment requests for ${toEmail}:`, error)
    return []
  }
}

/**
 * Create payment request
 */
export async function createPaymentRequest(
  data: Partial<PaymentRequests>
): Promise<PaymentRequests | null> {
  try {
    // Validate required fields
    if (!data.fromUserId || !data.tokenId || !data.amount) {
      throw new Error('Missing required fields: fromUserId, tokenId, amount')
    }
    
    if (!data.toEmail && !data.toUserId) {
      throw new Error('Must provide either toEmail or toUserId')
    }

    const result = await tablesdb.createRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      rowId: ID.unique(),
      data: {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId || null,
        toEmail: data.toEmail || null,
        tokenId: data.tokenId,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
        status: 'pending',
        paymentTxId: null,
        invoiceNumber: data.invoiceNumber || null,
        metadata: data.metadata || null,
        createdAt: new Date().toISOString(),
        paidAt: null,
      },
    })
    return result as PaymentRequests
  } catch (error) {
    console.error('Failed to create payment request:', error)
    return null
  }
}

/**
 * Update payment request status
 */
export async function updatePaymentRequestStatus(
  requestId: string,
  status: 'pending' | 'submitted_for_approval' | 'approved' | 'rejected' | 'paid',
  paymentTxId?: string
): Promise<PaymentRequests | null> {
  try {
    const updateData: any = {
      status,
    }
    
    if (status === 'paid') {
      updateData.paidAt = new Date().toISOString()
      if (paymentTxId) {
        updateData.paymentTxId = paymentTxId
      }
    }

    const result = await tablesdb.updateRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      rowId: requestId,
      data: updateData,
    })
    return result as PaymentRequests
  } catch (error) {
    console.error(`Failed to update payment request ${requestId}:`, error)
    return null
  }
}

/**
 * Delete payment request
 */
export async function deletePaymentRequest(requestId: string): Promise<boolean> {
  try {
    await tablesdb.deleteRow({
      databaseId: PAYDB_ID,
      tableId: PAYDB_TABLES.PAYMENT_REQUESTS,
      rowId: requestId,
    })
    return true
  } catch (error) {
    console.error(`Failed to delete payment request ${requestId}:`, error)
    return false
  }
}

export default {
  getPaymentRequest,
  listUserPaymentRequests,
  listReceivedPaymentRequests,
  createPaymentRequest,
  updatePaymentRequestStatus,
  deletePaymentRequest,
}
