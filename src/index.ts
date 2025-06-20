import express, { Express, Request, Response, NextFunction } from "express"
import cors from "cors"
import { config } from "./config"
import userRoutes from "./routes/userRoutes"
import assetRoutes from "./routes/assetRoutes"
import orderRoutes from "./routes/orderRoutes"
import { eventListenerService } from "./services/eventListenerService"

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

// Centralized Error Handler
// This will catch any errors passed by next(error) in our controllers
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong!",
  })
})

// Start server
app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  )
  console.log(`⚡️[server]: Environment: ${config.nodeEnv}`)
})

// Start the smart contract event listener
eventListenerService.start()
