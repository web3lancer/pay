'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { VirtualAccounts } from '@/types/appwrite.d'
import { tablesdb, PAYDB_ID } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'

type AccountContextType = {
  accounts: VirtualAccounts[]
  loading: boolean
  fetchAccounts: () => Promise<void>
  createAccount: (data: Omit<VirtualAccounts, 'accountId' | '$id' | '$createdAt' | '$updatedAt'>) => Promise<void>
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export const AccountProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [accounts, setAccounts] = useState<VirtualAccounts[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const res = await tablesdb.listRows({
        databaseId: PAYDB_ID,
        tableId: 'virtualAccounts',
        queries: [Query.orderDesc('$createdAt')]
      })
      setAccounts(res.rows as VirtualAccounts[])
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (data: Omit<VirtualAccounts, 'accountId' | '$id' | '$createdAt' | '$updatedAt'>) => {
    setLoading(true)
    try {
      await tablesdb.createRow({
        databaseId: PAYDB_ID,
        tableId: 'virtualAccounts',
        rowId: ID.unique(),
        data: { ...data }
      })
      await fetchAccounts()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAccounts() }, [])

  return (
    <AccountContext.Provider value={{ accounts, loading, fetchAccounts, createAccount }}>
      {children}
    </AccountContext.Provider>
  )
}

export const useAccountContext = () => {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccountContext must be used within AccountProvider')
  return ctx
}
