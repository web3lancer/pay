'use client'
import React, { useState } from 'react'
import AccountList from '@/components/accounts/AccountList'
import { useAccountContext } from '@/contexts/AccountContext'
import Button from '@/components/ui/Button'
import { updateVirtualAccount, deleteVirtualAccount, freezeVirtualAccount, reactivateVirtualAccount } from '@/lib/appwrite'

export default function AccountsClient() {
  const [showCreate, setShowCreate] = useState(false)
  const { accounts, fetchAccounts, loading } = useAccountContext()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleFreeze = async (accountId: string) => {
    setActionLoading(accountId)
    await freezeVirtualAccount(accountId)
    await fetchAccounts()
    setActionLoading(null)
  }
  const handleUnfreeze = async (accountId: string) => {
    setActionLoading(accountId)
    await reactivateVirtualAccount(accountId)
    await fetchAccounts()
    setActionLoading(null)
  }
  const handleDelete = async (accountId: string) => {
    setActionLoading(accountId)
    await deleteVirtualAccount(accountId)
    await fetchAccounts()
    setActionLoading(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Virtual Accounts</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreate(v => !v)}
        >
          {showCreate ? 'Close' : 'Create Account'}
        </Button>
      </div>
      {showCreate && (
        <div className="mb-6 border rounded p-4 bg-white shadow">
          {/* Use the createClient form directly here for inline creation */}
          {/*
            You can import and use the CreateClient form here if you want inline creation,
            or keep the separate /accounts/create page for full-page creation.
          */}
        </div>
      )}
      <AccountList
        onFreeze={handleFreeze}
        onUnfreeze={handleUnfreeze}
        onDelete={handleDelete}
        actionLoading={actionLoading}
      />
    </div>
  )
}
