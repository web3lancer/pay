import React from 'react'
import { useCardContext } from '@/contexts/CardContext'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface CardListProps {
  onFreeze?: (cardId: string) => void
  onUnfreeze?: (cardId: string) => void
  onDelete?: (cardId: string) => void
  actionLoading?: string | null
}

const CardList: React.FC<CardListProps> = ({
  onFreeze,
  onUnfreeze,
  onDelete,
  actionLoading
}) => {
  const { cards, loading } = useCardContext()
  if (loading) return <div>Loading cards...</div>
  if (!cards.length) return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>No cards found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-500 text-center">You have not created any virtual cards yet.</p>
      </CardContent>
    </Card>
  )
  return (
    <div className="grid gap-4">
      {cards.map(card => (
        <Card key={card.$id} className="p-0">
          <CardHeader>
            <CardTitle>
              Card • <span className="font-mono">{card.cardNumber}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-sm">Type: <span className="font-medium">{card.cardType}</span></div>
                <div className="text-sm">Expiry: <span className="font-medium">{card.expiry}</span></div>
                <div className="text-sm">Status: <span className={card.status === 'active' ? 'text-green-600' : card.status === 'frozen' ? 'text-yellow-600' : 'text-neutral-500'}>{card.status}</span></div>
              </div>
              {(onFreeze || onUnfreeze || onDelete) && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  {onFreeze && card.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFreeze(card.$id)}
                      disabled={actionLoading === card.$id}
                    >
                      {actionLoading === card.$id ? 'Freezing...' : 'Freeze'}
                    </Button>
                  )}
                  {onUnfreeze && card.status === 'frozen' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onUnfreeze(card.$id)}
                      disabled={actionLoading === card.$id}
                    >
                      {actionLoading === card.$id ? 'Unfreezing...' : 'Unfreeze'}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="indigo"
                      onClick={() => onDelete(card.$id)}
                      disabled={actionLoading === card.$id}
                    >
                      {actionLoading === card.$id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-neutral-400">
              Linked Wallet: {card.linkedWalletId || <span className="italic">None</span>}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
export default CardList
