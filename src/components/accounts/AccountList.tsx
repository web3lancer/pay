import React from 'react'
import { useAccountContext } from '@/contexts/AccountContext'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface AccountListProps {
  onFreeze?: (accountId: string) => void
  onUnfreeze?: (accountId: string) => void
  onDelete?: (accountId: string) => void
  actionLoading?: string | null
}

const AccountList: React.FC<AccountListProps> = ({
  onFreeze,
  onUnfreeze,
  onDelete,
  actionLoading
}) => {
  const { accounts, loading } = useAccountContext()
  if (loading) return <div>Loading accounts...</div>
  if (!accounts.length) return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>No accounts found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-500 text-center">You have not created any virtual accounts yet.</p>
      </CardContent>
    </Card>
  )
  return (
    <div className="grid gap-4">
      {accounts.map(account => (
        <Card key={account.$id} className="p-0">
          <CardHeader>
            <CardTitle>
              Account • <span className="font-mono">{account.accountNumber}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-sm">Currency: <span className="font-medium">{account.currency}</span></div>
                <div className="text-sm">Balance: <span className="font-medium">{account.balance}</span></div>
                <div className="text-sm">Status: <span className={account.status === 'active' ? 'text-green-600' : account.status === 'frozen' ? 'text-yellow-600' : 'text-neutral-500'}>{account.status}</span></div>
              </div>
              {(onFreeze || onUnfreeze || onDelete) && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  {onFreeze && account.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFreeze(account.$id)}
                      disabled={actionLoading === account.$id}
                    >
                      {actionLoading === account.$id ? 'Freezing...' : 'Freeze'}
                    </Button>
                  )}
                  {onUnfreeze && account.status === 'frozen' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onUnfreeze(account.$id)}
                      disabled={actionLoading === account.$id}
                    >
                      {actionLoading === account.$id ? 'Unfreezing...' : 'Unfreeze'}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="indigo"
                      onClick={() => onDelete(account.$id)}
                      disabled={actionLoading === account.$id}
                    >
                      {actionLoading === account.$id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-neutral-400">
              Linked Wallet: {account.linkedWalletId || <span className="italic">None</span>}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
export default AccountList
