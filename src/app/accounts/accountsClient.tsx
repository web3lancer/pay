'use client'
import AccountList from '@/components/accounts/AccountList'

export default function AccountsClient() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Virtual Accounts</h1>
      <AccountList />
    </div>
  )
}
