export const RPS_ADDRESS="0x67106EaCAf99c93DB14921b9577098eB24369592"
export  const ABI = [
        {
            "type": "constructor",
            "inputs": [
                {
                    "name": "_entropy",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "_sponsor",
                    "type": "address",
                    "internalType": "address payable"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "fallback",
            "stateMutability": "payable"
        },
        {
            "type": "receive",
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "_entropyCallback",
            "inputs": [
                {
                    "name": "sequence",
                    "type": "uint64",
                    "internalType": "uint64"
                },
                {
                    "name": "provider",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "randomNumber",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "buyTickets",
            "inputs": [
                {
                    "name": "_numTickets",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "request",
            "inputs": [
                {
                    "name": "_player",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "payable"
        },
        {
            "type": "function",
            "name": "ticketBalance",
            "inputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "event",
            "name": "ChoiceRequested",
            "inputs": [
                {
                    "name": "sequenceNumber",
                    "type": "uint64",
                    "indexed": false,
                    "internalType": "uint64"
                }
            ],
            "anonymous": false
        },
        {
            "type": "event",
            "name": "ChoiceResult",
            "inputs": [
                {
                    "name": "sequenceNumber",
                    "type": "uint64",
                    "indexed": false,
                    "internalType": "uint64"
                },
                {
                    "name": "result",
                    "type": "uint256",
                    "indexed": false,
                    "internalType": "uint256"
                }
            ],
            "anonymous": false
        },
        {
            "type": "error",
            "name": "NotEnoughEtherSent",
            "inputs": []
        }
    ]

