import React from 'react'
import { VirtualCards } from '@/types/appwrite.d'

const CardDetails: React.FC<{ card: VirtualCards }> = ({ card }) => (
  <div className="border p-4 rounded">
    <h2 className="font-bold mb-2">Card Details</h2>
    <div>Card Number: {card.cardNumber}</div>
    <div>Type: {card.cardType}</div>
    <div>Status: {card.status}</div>
    <div>Expiry: {card.expiry}</div>
    <div>CVV: {card.cvv}</div>
    <div>Linked Wallet: {card.linkedWalletId}</div>
  </div>
)
export default CardDetails
