import { ethers } from "ethers"
import { orderService } from "./orderService"

// --- You must provide this ABI ---
// This should be the ABI for your contract, which you can get after compiling it.
// For this service, we only need the fragment for the event we're listening to.
const contractAbi = [
  "event BuyOrderInitiated(address indexed user, string indexed assetSymbol, uint256 amount, uint256 price)",
]

// This is the core logic that runs when a 'BuyOrderInitiated' event is heard.
const handleBuyOrderInitiated = async (
  userWallet: string,
  assetSymbol: string,
  amount: ethers.BigNumberish,
  price: ethers.BigNumberish,
  event: ethers.Log
) => {
  try {
    console.log(
      `[EventListener] Caught BuyOrderInitiated event for wallet ${userWallet}. Processing...`
    )

    await orderService.createAndProcessOrder({
      userWalletAddress: userWallet,
      assetSymbol: assetSymbol,
      type: "BUY",
      // Convert BigNumber to a standard number. Be mindful of potential precision loss for very large numbers.
      amount: ethers.getNumber(amount),
      price: ethers.getNumber(price),
      transactionHash: event.transactionHash,
    })

    console.log(
      `[EventListener] Successfully processed event for transaction ${event.transactionHash}`
    )
  } catch (error) {
    console.error(
      `[EventListener] Failed to process event for transaction ${event.transactionHash}:`,
      error
    )
  }
}

export const eventListenerService = {
  start() {
    const rpcUrl = process.env.RPC_URL
    const contractAddress = process.env.CONTRACT_ADDRESS

    if (!rpcUrl || !contractAddress) {
      console.error(
        "[EventListener] RPC_URL or CONTRACT_ADDRESS is not defined in your .env file. Real listener cannot start."
      )
      return
    }

    // Connect to the blockchain provider. Using WebSocketProvider is best for listening to events.
    const provider = new ethers.WebSocketProvider(rpcUrl)
    const contract = new ethers.Contract(contractAddress, contractAbi, provider)

    console.log(
      `[EventListener] Connecting to contract at ${contractAddress} on network...`
    )

    provider.on("open", () => {
      console.log("[EventListener] WebSocket connection established.")
    })

    provider.on("close", () => {
      console.log(
        "[EventListener] WebSocket connection closed. Will attempt to reconnect..."
      )
    })

    // Listen for the 'BuyOrderInitiated' event from the actual smart contract
    contract.on("BuyOrderInitiated", handleBuyOrderInitiated)

    console.log(
      "[EventListener] Actively listening for 'BuyOrderInitiated' events from the smart contract."
    )
  },
}
