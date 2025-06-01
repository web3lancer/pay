import { WalletsClient } from './WalletsClient'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'

export default function WalletsPage() {
  useExchangeRate()

  return <WalletsClient />
}