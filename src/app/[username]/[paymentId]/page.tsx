'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { findUserByUsername, getPaymentRequest } from '@/lib/appwrite'
import type { Users, PaymentRequests } from '@/types/appwrite.d'

export default function PaymentRequestPage() {
  const params = useParams()
  const username = Array.isArray(params?.username) ? params.username[0] : params?.username
  const paymentId = Array.isArray(params?.paymentId) ? params.paymentId[0] : params?.paymentId
  const [user, setUser] = useState<Users | null>(null)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequests | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username || !paymentId) return
    setLoading(true)
    findUserByUsername(username)
      .then((u) => {
        if (!u) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setUser(u)
        getPaymentRequest(paymentId)
          .then((pr) => {
            if (pr && pr.fromUserId === u.userId) {
              setPaymentRequest(pr)
              setNotFound(false)
            } else {
              setPaymentRequest(null)
              setNotFound(true)
            }
          })
          .finally(() => setLoading(false))
      })
  }, [username, paymentId])

  if (loading) {
    return <div className="p-8 text-center">Loading payment request...</div>
  }

  if (notFound || !user || !paymentRequest) {
    return <div className="p-8 text-center text-red-600">Payment request not found</div>
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="flex flex-col items-center gap-4">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.displayName || user.username}
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-cyan-100 flex items-center justify-center text-3xl font-bold text-cyan-600">
            {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-xl font-bold text-neutral-900">{user.displayName || user.username}</h1>
        <div className="text-neutral-500 text-lg">@{user.username}</div>
      </div>
      <div className="mt-8 bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="text-neutral-700 mb-2 font-medium">Payment Request</div>
        <div className="text-2xl font-bold text-cyan-700 mb-2">
          {paymentRequest.amount} {paymentRequest.tokenId?.toUpperCase()}
        </div>
        {paymentRequest.description && (
          <div className="mb-2 text-neutral-600">{paymentRequest.description}</div>
        )}
        <div className="text-sm text-neutral-500 mb-2">
          Status: <span className="font-medium">{paymentRequest.status}</span>
        </div>
        {paymentRequest.dueDate && (
          <div className="text-sm text-neutral-500 mb-2">
            Due: {new Date(paymentRequest.dueDate).toLocaleDateString()}
          </div>
        )}
        <div className="text-xs text-neutral-400 mt-4">
          Payment ID: {paymentRequest.requestId}
        </div>
      </div>
    </div>
  )
}
