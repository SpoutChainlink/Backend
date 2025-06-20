import { RequestHandler } from "express"
import { orderService } from "../services/orderService"

// By using the RequestHandler type, we ensure our functions match what Express expects.
// This helps prevent subtle type errors with the router.
const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const { userId, assetId, type, amount, price } = req.body

    if (!userId || !assetId || !type || !amount || !price) {
      res.status(400).json({ message: "Missing required order fields." })
    } else {
      const newOrder = await orderService.createAndProcessOrder({
        userId,
        assetId,
        type,
        amount,
        price,
      })

      res.status(201).json(newOrder)
    }
  } catch (error) {
    next(error)
  }
}

const getOrder: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid order ID." })
    } else {
      const order = await orderService.getOrderById(id)
      if (!order) {
        res.status(404).json({ message: "Order not found." })
      } else {
        res.status(200).json(order)
      }
    }
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createOrder,
  getOrder,
}
