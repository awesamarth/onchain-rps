"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { BuyTicketsModal } from "@/components/BuyTicketsModal"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useAppKit } from '@reown/appkit/react'
import { RPS_ADDRESS, ABI } from "@/constants"
import { parseEther } from "viem"

type GameState = "start" | "countdown" | "choice" | "ai-choosing" | "result"
type Choice = "rock" | "paper" | "scissors" | null

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [countdown, setCountdown] = useState(0)
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [aiChoice, setAiChoice] = useState<Choice>(null)
  const [gameResult, setGameResult] = useState<"win" | "lose" | "tie" | null>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const handleBuyTickets = () => {
    setShowBuyModal(true)
  }

  const { address } = useAccount()
  const { open } = useAppKit()

  const { data: ticketBalance, refetch: refetchBalance } = useReadContract({
    abi: ABI,
    address: RPS_ADDRESS as `0x${string}`,
    functionName: 'ticketBalance',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    }
  })

  const { writeContract, data: hash } = useWriteContract()

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
    }
  }, [isConfirmed, refetchBalance])


  console.log("here's ticket balance: ", Number(ticketBalance))

  const handlePurchaseTickets = (amount: number) => {
    const value = parseEther((amount * 0.001).toString()) 

    writeContract({
      abi: ABI,
      address: RPS_ADDRESS as `0x${string}`,
      functionName: 'buyTickets',
      args: [BigInt(amount)],
      value: value,
    })
  }

  const startGame = () => {
    if (!ticketBalance || Number(ticketBalance) <= 0) return
    setGameState("countdown")
    setCountdown(3)
  }

  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setGameState("choice")
        } else {
          setCountdown(countdown - 1)
        }
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [gameState, countdown])

  const makeChoice = async (choice: Choice) => {
    setPlayerChoice(choice)
    setGameState("ai-choosing")

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          choice: choice
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Convert result to choice: 0=rock, 1=paper, 2=scissors
        const aiChoiceMap: Choice[] = ["rock", "paper", "scissors"]
        const aiResult = aiChoiceMap[data.result]
        setAiChoice(aiResult)

        // Determine win/lose/tie
        const result = determineWinner(choice, aiResult)
        setGameResult(result)

        // Refetch balance after game
        refetchBalance()

        setGameState("result")
      } else {
        console.error('API Error:', data.error)
        setGameState("start") // Reset on error
      }
    } catch (error) {
      console.error('Network Error:', error)
      setGameState("start") // Reset on error
    }
  }

  const determineWinner = (player: Choice, ai: Choice): "win" | "lose" | "tie" => {
    if (player === ai) return "tie"

    const winConditions = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper"
    }

    return winConditions[player as keyof typeof winConditions] === ai ? "win" : "lose"
  }

  const resetGame = () => {
    setGameState("start")
    setPlayerChoice(null)
    setAiChoice(null)
    setGameResult(null)
    setCountdown(0)
  }

  const playAgain = () => {
    setPlayerChoice(null)
    setAiChoice(null)
    setGameResult(null)
    setGameState("countdown")
    setCountdown(3)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar ticketBalance={Number(ticketBalance || 0)} onBuyTickets={handleBuyTickets} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">

          {gameState === "start" && (
            <div className="text-center space-y-12 animate-in fade-in-0 duration-500">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-foreground">
                  Onchain Rock Paper Scissors
                </h1>
                <div className="space-y-5">
                  <p className="text-2xl text-foreground/70">
                    Verifiable randomness powered by Pyth Entropy
                  </p>
                  <p className="text-lg text-muted-foreground">
                    🎫 1 ticket per game • 0.002 ETH reward on victory
                  </p>
                </div>
              </div>

              {!address ? (
                <div className="space-y-6">
                  <div className="text-2xl text-muted-foreground">
                    Please connect your wallet to start playing
                  </div>
                  <button
                    onClick={() => open()}
                    className="px-8 py-4 text-xl font-semibold bg-foreground text-background border border-border rounded-lg hover:scale-105 hover:cursor-pointer transform transition-all duration-200"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : ticketBalance && Number(ticketBalance) > 0 ? (
                <>
                  <div className="flex justify-center space-x-8">
                    <div className="text-8xl animate-bounce delay-0">🪨</div>
                    <div className="text-8xl animate-bounce delay-100">📄</div>
                    <div className="text-8xl animate-bounce delay-200">✂️</div>
                  </div>

                  <button
                    onClick={startGame}
                    className="px-8 py-4 text-xl font-semibold bg-foreground text-background border border-border rounded-lg hover:scale-105 hover:cursor-pointer transform transition-all duration-200"
                  >
                    Start Game
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-3xl text-muted-foreground">
                    No tickets available
                  </div>
                  <button
                    onClick={handleBuyTickets}
                    className="px-8 py-4 text-xl font-semibold bg-foreground text-background border border-border rounded-lg hover:scale-105 hover:cursor-pointer transform transition-all duration-200"
                  >
                    Buy Tickets
                  </button>
                </div>
              )}
            </div>
          )}

          {gameState === "countdown" && (
            <div className="text-center space-y-8 animate-in fade-in-0 duration-300">
              {countdown === 3 && (
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce">🪨</div>
                  <div className="text-4xl font-bold text-foreground">ROCK</div>
                </div>
              )}

              {countdown === 2 && (
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce">📄</div>
                  <div className="text-4xl font-bold text-foreground">PAPER</div>
                </div>
              )}

              {countdown === 1 && (
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce">✂️</div>
                  <div className="text-4xl font-bold text-foreground">SCISSORS</div>
                </div>
              )}
            </div>
          )}

          {gameState === "choice" && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-4xl font-bold text-foreground">SHOOT!</h2>

              <div className="flex justify-center space-x-8">
                <button
                  onClick={() => makeChoice("rock")}
                  className="text-8xl hover:scale-110 hover:cursor-pointer transform transition-all duration-200 hover:drop-shadow-lg"
                >
                  🪨
                </button>
                <button
                  onClick={() => makeChoice("paper")}
                  className="text-8xl hover:scale-110 hover:cursor-pointer transform transition-all duration-200 hover:drop-shadow-lg"
                >
                  📄
                </button>
                <button
                  onClick={() => makeChoice("scissors")}
                  className="text-8xl hover:scale-110 hover:cursor-pointer transform transition-all duration-200 hover:drop-shadow-lg"
                >
                  ✂️
                </button>
              </div>
            </div>
          )}

          {gameState === "ai-choosing" && (
            <div className="text-center space-y-8 animate-in fade-in-0 duration-500">
              <h2 className="text-4xl font-bold text-foreground animate-bounce">
                AI is choosing...
              </h2>
            </div>
          )}

          {gameState === "result" && (
            <div className="text-center space-y-8 animate-in fade-in-0 duration-500">
              {/* Game result header */}
              <div className="space-y-4">
                <h2 className={`text-5xl font-bold ${
                  gameResult === "win" ? "text-green-500" :
                  gameResult === "lose" ? "text-red-500" :
                  "text-yellow-500"
                }`}>
                  {gameResult === "win" && "You Won!"}
                  {gameResult === "lose" && "You Lost :("}
                  {gameResult === "tie" && "It's a Tie"}
                </h2>
              </div>

              {/* Show both choices */}
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {playerChoice === "rock" && "🪨"}
                    {playerChoice === "paper" && "📄"}
                    {playerChoice === "scissors" && "✂️"}
                  </div>
                  <p className="text-lg text-muted-foreground">You</p>
                </div>

                <div className="text-4xl text-muted-foreground">VS</div>

                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {aiChoice === "rock" && "🪨"}
                    {aiChoice === "paper" && "📄"}
                    {aiChoice === "scissors" && "✂️"}
                  </div>
                  <p className="text-lg text-muted-foreground">AI</p>
                </div>
              </div>

              {/* Play again or buy tickets */}
              {ticketBalance && Number(ticketBalance) > 0 ? (
                <button
                  onClick={playAgain}
                  className="px-6 py-3 text-lg font-semibold bg-foreground text-background border border-border rounded-lg hover:scale-105 hover:cursor-pointer transform transition-all duration-200"
                >
                  Play Again
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground">No tickets remaining</p>
                  <button
                    onClick={handleBuyTickets}
                    className="px-6 py-3 text-lg font-semibold bg-foreground text-background border border-border rounded-lg hover:scale-105 hover:cursor-pointer transform transition-all duration-200"
                  >
                    Buy More Tickets
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <BuyTicketsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        currentBalance={Number(ticketBalance || 0)}
        onPurchase={handlePurchaseTickets}
      />
    </div>
  );
}
