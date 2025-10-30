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

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { bloodType, quantity, reason } = await request.json()

    const hospital = await prisma.hospital.findUnique({
      where: { userId: decoded.userId },
    })

    if (!hospital) {
      return NextResponse.json({ error: "Hospital profile not found" }, { status: 404 })
    }

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId: hospital.id,
        userId: decoded.userId,
        bloodType,
        quantity,
        reason,
        status: "PENDING",
      },
    })

    return NextResponse.json(bloodRequest, { status: 201 })
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
