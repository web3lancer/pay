'use client'
import React, { useState } from 'react'
import { useAccountContext } from '@/contexts/AccountContext'

export default function CreateClient() {
  const { createAccount, loading } = useAccountContext()
  const [accountNumber, setAccountNumber] = useState('')
  const [currency, setCurrency] = useState('')
  const [status, setStatus] = useState('active')
  const [linkedWalletId, setLinkedWalletId] = useState('')
  const [balance, setBalance] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createAccount({ userId: '', accountNumber, currency, balance, status, linkedWalletId })
    setAccountNumber('')
    setCurrency('')
    setStatus('active')
    setLinkedWalletId('')
    setBalance(0)
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Create Virtual Account</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
        <input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} required />
        <input placeholder="Balance" type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} />
        <input placeholder="Linked Wallet ID" value={linkedWalletId} onChange={e => setLinkedWalletId(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  )
}
