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

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string }
    // Allow both ADMIN and HOSPITAL to view inventory
    if (decoded.role !== "ADMIN" && decoded.role !== "HOSPITAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const inventory = await prisma.bloodInventory.findMany({
      orderBy: { bloodType: "asc" },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
