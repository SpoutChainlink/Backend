import { Router } from "express"
import { orderController } from "../controllers/orderController"

const router = Router()

// Order routes
router.post("/event", orderController.createOrderFromEvent)
router.get("/", orderController.getOrders)
router.get("/:id", orderController.getOrder)
router.patch("/:id/status", orderController.updateOrderStatus)

export default router
