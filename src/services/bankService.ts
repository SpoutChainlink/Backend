/**
 * This service simulates a Bank API that holds assets for users.
 * It's a custodian, managing user balances.
 */

interface BankDepositRequest {
  userId: number
  assetSymbol: string
  amount: number
}

interface BankWithdrawRequest {
  userId: number
  assetSymbol: string
  amount: number
}

interface BankBalance {
  assetSymbol: string
  amount: number
}

// In-memory data store to act as our virtual bank's ledger.
// The structure is: Map<userId, Map<assetSymbol, balance>>
const bankLedger = new Map<number, Map<string, number>>()

export const bankService = {
  /**
   * Deposits a specified amount of an asset into a user's account.
   */
  async deposit(request: BankDepositRequest): Promise<BankBalance> {
    console.log(
      `[Bank] Processing deposit for user ${request.userId}:`,
      request
    )
    await new Promise((resolve) => setTimeout(resolve, 200)) // Simulate network delay

    if (!bankLedger.has(request.userId)) {
      bankLedger.set(request.userId, new Map<string, number>())
    }

    const userBalances = bankLedger.get(request.userId)!
    const currentBalance = userBalances.get(request.assetSymbol) || 0
    const newBalance = currentBalance + request.amount

    userBalances.set(request.assetSymbol, newBalance)
    console.log(
      `[Bank] User ${request.userId} new balance for ${request.assetSymbol}: ${newBalance}`
    )

    return { assetSymbol: request.assetSymbol, amount: newBalance }
  },

  /**
   * Withdraws a specified amount of an asset from a user's account.
   */
  async withdraw(request: BankWithdrawRequest): Promise<BankBalance> {
    console.log(
      `[Bank] Processing withdrawal for user ${request.userId}:`,
      request
    )
    await new Promise((resolve) => setTimeout(resolve, 200))

    const userBalances = bankLedger.get(request.userId)
    if (
      !userBalances ||
      (userBalances.get(request.assetSymbol) || 0) < request.amount
    ) {
      console.error(
        `[Bank] Insufficient funds for withdrawal for user ${request.userId}`
      )
      throw new Error("Insufficient funds in bank for this withdrawal.")
    }

    const currentBalance = userBalances.get(request.assetSymbol)!
    const newBalance = currentBalance - request.amount

    userBalances.set(request.assetSymbol, newBalance)
    console.log(
      `[Bank] User ${request.userId} new balance for ${request.assetSymbol}: ${newBalance}`
    )

    return { assetSymbol: request.assetSymbol, amount: newBalance }
  },

  /**
   * Retrieves the balance of a specific asset for a user.
   */
  async getBalance(userId: number, assetSymbol: string): Promise<BankBalance> {
    const userBalances = bankLedger.get(userId)
    const amount = userBalances?.get(assetSymbol) || 0
    return { assetSymbol, amount }
  },
}
