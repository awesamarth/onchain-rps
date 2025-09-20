"use client"

import { ModeToggle } from "./ThemeToggle"
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

interface NavbarProps {
  ticketBalance: number
  onBuyTickets: () => void
}

export function Navbar({ ticketBalance, onBuyTickets }: NavbarProps) {
  const { open } = useAppKit()
  const { isConnected } = useAccount()
  return (
    <nav className="border-b bg-background/95 backdrop-blur w-full supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-none px-4 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Rock Paper Scissors</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onBuyTickets}
            className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg hover:cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <span className="text-sm">🎫 {ticketBalance} {ticketBalance === 1 ? 'ticket' : 'tickets'}</span>
            <span className="text-sm">+</span>
          </button>
          <ModeToggle />
          {isConnected ? (
            <w3m-button size="sm" />
          ) : (
            <button
              onClick={() => open()}
              className="px-4 py-2 text-sm font-medium bg-foreground text-background border border-border rounded hover:cursor-pointer hover:opacity-80 transition-opacity duration-200"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}