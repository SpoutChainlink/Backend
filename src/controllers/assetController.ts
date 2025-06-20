import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { ApiResponse } from "../types"

const prisma = new PrismaClient()

export const assetController = {
  async getAssets(req: Request, res: Response<ApiResponse>) {
    try {
      const assets = await prisma.asset.findMany()
      res.json({
        status: "success",
        data: assets,
      })
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch assets",
      })
    }
  },

  async getAsset(req: Request, res: Response<ApiResponse>) {
    try {
      const { id } = req.params
      const asset = await prisma.asset.findUnique({
        where: { id: Number(id) },
      })

      if (!asset) {
        return res.status(404).json({
          status: "error",
          message: "Asset not found",
        })
      }

      res.json({
        status: "success",
        data: asset,
      })
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch asset",
      })
    }
  },

  async createAsset(req: Request, res: Response<ApiResponse>) {
    try {
      const { symbol, name } = req.body
      const asset = await prisma.asset.create({
        data: {
          symbol,
          name,
        },
      })

      res.status(201).json({
        status: "success",
        data: asset,
      })
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to create asset",
      })
    }
  },
}
