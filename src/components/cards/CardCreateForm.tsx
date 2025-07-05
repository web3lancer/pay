import React, { useState } from 'react'
import { useCardContext } from '@/contexts/CardContext'

const CardCreateForm: React.FC = () => {
  const { createCard, loading } = useCardContext()
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardType, setCardType] = useState('')
  const [status, setStatus] = useState('active')
  const [linkedWalletId, setLinkedWalletId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCard({ userId: '', cardNumber, expiry, cvv, cardType, status, linkedWalletId })
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setCardType('')
    setStatus('active')
    setLinkedWalletId('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
      <input placeholder="Expiry (MM/YY)" value={expiry} onChange={e => setExpiry(e.target.value)} required />
      <input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} required />
      <input placeholder="Card Type" value={cardType} onChange={e => setCardType(e.target.value)} required />
      <input placeholder="Linked Wallet ID" value={linkedWalletId} onChange={e => setLinkedWalletId(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Card'}</button>
    </form>
  )
}
export default CardCreateForm
