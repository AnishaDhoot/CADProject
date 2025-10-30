import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function getTokenFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  return authHeader.slice(7)
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: { status },
    })

    // If approved, check inventory and update if needed
    if (status === "APPROVED") {
      const inventory = await prisma.bloodInventory.findUnique({
        where: { bloodType: updatedRequest.bloodType },
      })

      if (inventory && inventory.quantity >= updatedRequest.quantity) {
        await prisma.bloodInventory.update({
          where: { bloodType: updatedRequest.bloodType },
          data: { quantity: { decrement: updatedRequest.quantity } },
        })
      }
    }

    return NextResponse.json(updatedRequest)
  } catch (error: any) {
    console.error("Error updating request:", error)
    
    // Check if it's a known Prisma error
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}
