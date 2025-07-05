import React from 'react'
import { VirtualAccounts } from '@/types/appwrite.d'

const AccountDetails: React.FC<{ account: VirtualAccounts }> = ({ account }) => (
  <div className="border p-4 rounded">
    <h2 className="font-bold mb-2">Account Details</h2>
    <div>Account Number: {account.accountNumber}</div>
    <div>Currency: {account.currency}</div>
    <div>Status: {account.status}</div>
    <div>Balance: {account.balance}</div>
    <div>Linked Wallet: {account.linkedWalletId}</div>
  </div>
)
export default AccountDetails
