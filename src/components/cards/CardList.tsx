import React from 'react'
import { useCardContext } from '@/contexts/CardContext'

const CardList: React.FC = () => {
  const { cards, loading } = useCardContext()
  if (loading) return <div>Loading cards...</div>
  if (!cards.length) return <div>No cards found.</div>
  return (
    <div>
      {cards.map(card => (
        <div key={card.$id} className="border p-3 mb-2 rounded">
          <div>Card Number: {card.cardNumber}</div>
          <div>Type: {card.cardType}</div>
          <div>Status: {card.status}</div>
          <div>Expiry: {card.expiry}</div>
        </div>
      ))}
    </div>
  )
}
export default CardList
