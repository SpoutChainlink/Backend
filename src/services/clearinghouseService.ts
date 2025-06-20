/**
 * This service simulates communication with a third-party clearinghouse API.
 */
interface ClearinghouseOrder {
  orderId: string
  asset: string
  quantity: number
  type: "BUY" | "SELL"
}

interface ClearinghouseResponse {
  externalId: string
  status: "ACCEPTED" | "REJECTED"
  message: string
  timestamp: string
}

// In a real application, you would use a library like 'axios' or 'node-fetch'
// to make HTTP requests to the actual clearinghouse API.
export const clearinghouseService = {
  async submitOrder(order: ClearinghouseOrder): Promise<ClearinghouseResponse> {
    console.log(`Submitting order to clearinghouse:`, order)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate a successful response
    const isSuccessful = Math.random() > 0.1 // 90% chance of success

    if (isSuccessful) {
      const response: ClearinghouseResponse = {
        externalId: `ext_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        status: "ACCEPTED",
        message: "Order accepted for processing.",
        timestamp: new Date().toISOString(),
      }
      console.log("Clearinghouse response:", response)
      return response
    } else {
      // Simulate a failure
      const response: ClearinghouseResponse = {
        externalId: "",
        status: "REJECTED",
        message: "Insufficient funds or invalid asset.",
        timestamp: new Date().toISOString(),
      }
      console.log("Clearinghouse response:", response)
      throw new Error(response.message)
    }
  },
}
