import express, { Express, Request, Response } from "express"
import cors from "cors"
import { config } from "./config"
import { errorHandler } from "./middleware/errorHandler"
import userRoutes from "./routes/userRoutes"
import assetRoutes from "./routes/assetRoutes"
import orderRoutes from "./routes/orderRoutes"

const app: Express = express()

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
  })
)
app.use(express.json())

// Routes
app.use("/api/users", userRoutes)
app.use("/api/assets", assetRoutes)
app.use("/api/orders", orderRoutes)

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to Spout Backend API",
    version: "1.0.0",
  })
})

// Error handling
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  )
  console.log(`⚡️[server]: Environment: ${config.nodeEnv}`)
})
