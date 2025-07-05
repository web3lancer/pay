import { AccountProvider } from '@/contexts/AccountContext'
import AccountsClient from './accountsClient'

export default function AccountsPage() {
  return (
    <AccountProvider>
      <AccountsClient />
    </AccountProvider>
  )
}
