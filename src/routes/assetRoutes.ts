import { Router } from "express"
import { assetController } from "../controllers/assetController"

const router = Router()

// Asset routes
router.get("/", assetController.getAssets)
router.get("/:id", assetController.getAsset)
router.post("/", assetController.createAsset)

export default router
