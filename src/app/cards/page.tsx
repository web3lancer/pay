import { CardProvider } from '@/contexts/CardContext'
import CardsClient from './cardsClient'

export default function CardsPage() {
  return (
    <CardProvider>
      <CardsClient />
    </CardProvider>
  )
}
