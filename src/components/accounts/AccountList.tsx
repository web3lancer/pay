import React from 'react'
import { useAccountContext } from '@/contexts/AccountContext'

const AccountList: React.FC = () => {
  const { accounts, loading } = useAccountContext()
  if (loading) return <div>Loading accounts...</div>
  if (!accounts.length) return <div>No accounts found.</div>
  return (
    <div>
      {accounts.map(account => (
        <div key={account.$id} className="border p-3 mb-2 rounded">
          <div>Account Number: {account.accountNumber}</div>
          <div>Currency: {account.currency}</div>
          <div>Status: {account.status}</div>
          <div>Balance: {account.balance}</div>
        </div>
      ))}
    </div>
  )
}
export default AccountList
