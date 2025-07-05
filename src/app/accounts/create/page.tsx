import { AccountProvider } from '@/contexts/AccountContext'
import CreateClient from './createClient'

export default function AccountCreatePage() {
  return (
    <AccountProvider>
      <CreateClient />
    </AccountProvider>
  )
}
