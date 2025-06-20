import { Router } from "express"
import { userController } from "../controllers/userController"

const router = Router()

// User routes
router.post("/", userController.getOrCreateUser)
router.get("/:walletAddress/orders", userController.getUserOrders)

export default router
 