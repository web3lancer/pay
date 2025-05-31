import { WalletsClient } from './WalletsClient'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { PriceDisplay } from '@/components/PriceDisplay'

export default function WalletsPage() {
  const { calculateUsdValue, formatUsdValue } = useExchangeRate()

  return <WalletsClient />
}