import {
  PrismaClient,
  Order,
  OrderStatus,
  OrderType,
} from "../generated/prisma"
import { clearinghouseService } from "./clearinghouseService"
import { bankService } from "./bankService"

const prisma = new PrismaClient()

// The input data now comes from the event listener
interface CreateOrderFromEventInput {
  userWalletAddress: string
  assetSymbol: string
  type: OrderType
  amount: number
  price: number
  transactionHash: string
}

export const orderService = {
  /**
   * Creates an order, submits it to the clearinghouse, and updates its status.
   */
  async createAndProcessOrder(
    orderInput: CreateOrderFromEventInput
  ): Promise<Order> {
    // Step 1: Find or create the User and find the Asset based on event data.
    const [user, asset] = await Promise.all([
      prisma.user.upsert({
        where: { walletAddress: orderInput.userWalletAddress },
        update: {},
        create: { walletAddress: orderInput.userWalletAddress },
      }),
      prisma.asset.findUniqueOrThrow({
        where: { symbol: orderInput.assetSymbol },
      }),
    ])

    // Step 2: Create a PENDING order in our database.
    const initialOrder = await prisma.order.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        type: orderInput.type,
        amount: orderInput.amount,
        price: orderInput.price,
        status: OrderStatus.PENDING,
        transactionHash: orderInput.transactionHash,
      },
      include: { asset: true },
    })

    try {
      // Step 3: Handle pre-trade bank logic (for SELL orders).
      if (initialOrder.type === "SELL") {
        await bankService.withdraw({
          userId: user.id,
          assetSymbol: asset.symbol,
          amount: initialOrder.amount,
        })
      }

      // Step 4: Submit to the clearinghouse.
      const clearinghouseResponse = await clearinghouseService.submitOrder({
        orderId: initialOrder.id.toString(),
        asset: asset.symbol,
        quantity: initialOrder.amount,
        type: initialOrder.type,
      })

      // Step 5: Handle post-trade bank logic (for BUY orders).
      if (initialOrder.type === "BUY") {
        await bankService.deposit({
          userId: user.id,
          assetSymbol: asset.symbol,
          amount: initialOrder.amount,
        })
      }

      // Step 6: Mark order as COMPLETED.
      const completedOrder = await prisma.order.update({
        where: { id: initialOrder.id },
        data: {
          status: OrderStatus.COMPLETED,
          externalOrderId: clearinghouseResponse.externalId,
          apiResponse: clearinghouseResponse as any,
        },
      })
      return completedOrder
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      // Handle potential refunds for failed SELL orders
      if (
        initialOrder.type === "SELL" &&
        errorMessage !== "Insufficient funds in bank for this withdrawal."
      ) {
        await bankService.deposit({
          userId: user.id,
          assetSymbol: asset.symbol,
          amount: initialOrder.amount,
        })
      }

      const failedOrder = await prisma.order.update({
        where: { id: initialOrder.id },
        data: { status: OrderStatus.FAILED, errorMessage },
      })
      throw new Error(`Order failed: ${failedOrder.errorMessage}`)
    }
  },

  async getOrderById(id: number): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { user: true, asset: true },
    })
  },
}
