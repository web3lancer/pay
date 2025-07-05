import { CardProvider } from '@/contexts/CardContext'
import CreateClient from './createClient'

export default function CardCreatePage() {
  return (
    <CardProvider>
      <CreateClient />
    </CardProvider>
  )
}
