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

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const hospital = await prisma.hospital.findUnique({
      where: { userId: decoded.userId },
    })

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    const [pending, approved, completed] = await Promise.all([
      prisma.bloodRequest.count({
        where: { hospitalId: hospital.id, status: "PENDING" },
      }),
      prisma.bloodRequest.count({
        where: { hospitalId: hospital.id, status: "APPROVED" },
      }),
      prisma.bloodRequest.count({
        where: { hospitalId: hospital.id, status: "COMPLETED" },
      }),
    ])

    return NextResponse.json({ pending, approved, completed })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
