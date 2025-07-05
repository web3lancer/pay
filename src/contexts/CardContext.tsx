'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { VirtualCards } from '@/types/appwrite.d'
import { databases, DATABASE_ID, COLLECTION_IDS } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'

type CardContextType = {
  cards: VirtualCards[]
  loading: boolean
  fetchCards: () => Promise<void>
  createCard: (data: Omit<VirtualCards, 'cardId' | '$id' | '$createdAt' | '$updatedAt'>) => Promise<void>
}

const CardContext = createContext<CardContextType | undefined>(undefined)

export const CardProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cards, setCards] = useState<VirtualCards[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCards = async () => {
    setLoading(true)
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.VIRTUAL_CARDS,
        [Query.orderDesc('$createdAt')]
      )
      setCards(res.documents as VirtualCards[])
    } finally {
      setLoading(false)
    }
  }

  const createCard = async (data: Omit<VirtualCards, 'cardId' | '$id' | '$createdAt' | '$updatedAt'>) => {
    setLoading(true)
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.VIRTUAL_CARDS,
        ID.unique(),
        { ...data }
      )
      await fetchCards()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCards() }, [])

  return (
    <CardContext.Provider value={{ cards, loading, fetchCards, createCard }}>
      {children}
    </CardContext.Provider>
  )
}

export const useCardContext = () => {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCardContext must be used within CardProvider')
  return ctx
}
