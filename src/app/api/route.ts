import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http, createPublicClient, parseAbiItem, decodeEventLog, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { optimismSepolia } from 'viem/chains'
import { RPS_ADDRESS, ABI } from '@/constants'

const sponsor = privateKeyToAccount(process.env.DEV_PRIVATE_KEY! as `0x${string}`)

const walletClient = createWalletClient({
  chain: optimismSepolia,
  transport: http(),
  account: sponsor
})

const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, choice } = body

    // Validate address
    if (!address) {
      return NextResponse.json(
        { error: 'Player address is required' },
        { status: 400 }
      )
    }

    else if (!choice){
        return NextResponse.json(
        { error: 'No choice given' },
        { status: 400 }
      )
    }





    console.log('Player address:', address, 'Choice:', choice)

    // Get entropy fee - we need to call the entropy contract directly
    // For now, let's use a reasonable fee amount (you might need to adjust this)
    const fee = parseEther("0.000017") // Placeholder fee in wei

    // Call request function
    const hash = await walletClient.writeContract({
      address: RPS_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: 'request',
      args: [address as `0x${string}`],
      value: fee as bigint
    })

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    // Parse ChoiceRequested event to get sequence number
    const choiceRequestedEvent = receipt.logs.find(log => {
      try {
        const decoded = decodeEventLog({
          abi: ABI,
          data: log.data,
          topics: log.topics
        })
        return decoded.eventName === 'ChoiceRequested'
      } catch {
        return false
      }
    })

    if (!choiceRequestedEvent) {
      throw new Error('ChoiceRequested event not found')
    }

    const decodedChoiceRequested = decodeEventLog({
      abi: ABI,
      data: choiceRequestedEvent.data,
      topics: choiceRequestedEvent.topics
    })

    //@ts-ignore
    const sequenceNumber = decodedChoiceRequested!.args!.sequenceNumber

    console.log('Sequence number:', sequenceNumber)

    // Watch for ChoiceResult event with matching sequence number
    const result = await new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unwatch()
        reject(new Error('Timeout waiting for result'))
      }, 30000) // 30 second timeout

      const unwatch = publicClient.watchEvent({
        address: RPS_ADDRESS as `0x${string}`,
        event: parseAbiItem('event ChoiceResult(uint64 sequenceNumber, uint256 result)'),
        onLogs: (logs) => {
          logs.forEach(log => {
            if (log.args.sequenceNumber === sequenceNumber) {
              console.log('Found matching ChoiceResult:', log.args.result)
              clearTimeout(timeout)
              unwatch()
              resolve(Number(log.args.result))
            }
          })
        }
      })
    })

    // Determine if player won and send reward
    const playerWon = determineWin(choice, result)
    if (playerWon) {
      walletClient.sendTransaction({
        to: address as `0x${string}`,
        value: parseEther("0.002")
      }).catch(error => {
        console.error('Failed to send reward:', error)
      })
    }

    return NextResponse.json({
      result,
      sequenceNumber: Number(sequenceNumber),
      playerChoice: choice
    })

    

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function determineWin(playerChoice: string, aiResult: number): boolean {
  const aiChoiceMap = ["rock", "paper", "scissors"]
  const aiChoice = aiChoiceMap[aiResult]

  if (playerChoice === aiChoice) return false // tie

  const winConditions = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
  }

  return winConditions[playerChoice as keyof typeof winConditions] === aiChoice
}