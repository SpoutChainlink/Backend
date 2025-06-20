import { Router } from "express"
import { orderController } from "../controllers/orderController"

const router = Router()

// Route to create a new order
router.post("/orders", orderController.createOrder)

// Route to get a specific order by its ID
router.get("/orders/:id", orderController.getOrder)

export default router
