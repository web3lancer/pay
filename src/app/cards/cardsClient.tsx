'use client'
import React, { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import CardList from '@/components/cards/CardList'
import CardCreateForm from '@/components/cards/CardCreateForm'
import { useCardContext } from '@/contexts/CardContext'
import { freezeVirtualCard, unfreezeVirtualCard, deleteVirtualCard } from '@/lib/appwrite'
import Button from '@/components/ui/Button'

export default function CardsClient() {
  const [showCreate, setShowCreate] = useState(false)
  const { cards, fetchCards, loading } = useCardContext()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleFreeze = async (cardId: string) => {
    setActionLoading(cardId)
    await freezeVirtualCard(cardId)
    await fetchCards()
    setActionLoading(null)
  }
  const handleUnfreeze = async (cardId: string) => {
    setActionLoading(cardId)
    await unfreezeVirtualCard(cardId)
    await fetchCards()
    setActionLoading(null)
  }
  const handleDelete = async (cardId: string) => {
    setActionLoading(cardId)
    await deleteVirtualCard(cardId)
    await fetchCards()
    setActionLoading(null)
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Virtual Cards</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreate(v => !v)}
        >
          {showCreate ? 'Close' : 'Create Card'}
        </Button>
      </div>
      {showCreate && (
        <div className="mb-6 border rounded p-4 bg-white shadow">
          <CardCreateForm />
        </div>
      )}
      <CardList
        onFreeze={handleFreeze}
        onUnfreeze={handleUnfreeze}
        onDelete={handleDelete}
        actionLoading={actionLoading}
      />
    </PageLayout>
  )
}
