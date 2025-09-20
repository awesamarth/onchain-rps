"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BuyTicketsModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onPurchase: (amount: number) => void
}

export function BuyTicketsModal({ isOpen, onClose, currentBalance, onPurchase }: BuyTicketsModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(1)

  if (!isOpen) return null

  const ticketOptions = [
    { tickets: 1, eth: "0.001" },
    { tickets: 5, eth: "0.005" },
    { tickets: 10, eth: "0.01" },
    { tickets: 25, eth: "0.025" }
  ]

  const handlePurchase = () => {
    onPurchase(selectedAmount)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:cursor-pointer hover:scale-110 transition-transform"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-xl font-bold">🎫 {currentBalance} {currentBalance === 1 ? 'ticket' : 'tickets'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Select amount:</p>
            <div className="grid grid-cols-2 gap-2">
              {ticketOptions.map((option) => (
                <button
                  key={option.tickets}
                  onClick={() => setSelectedAmount(option.tickets)}
                  className={`p-3 rounded-lg border transition-all hover:cursor-pointer ${
                    selectedAmount === option.tickets
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  <div className="text-sm font-medium">{option.tickets} {option.tickets === 1 ? 'ticket' : 'tickets'}</div>
                  <div className="text-xs text-muted-foreground">{option.eth} ETH</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 bg-foreground text-background hover:scale-105 hover:cursor-pointer transition-transform"
            >
              Buy {selectedAmount} {selectedAmount === 1 ? 'ticket' : 'tickets'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}