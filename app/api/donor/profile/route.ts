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
    const donor = await prisma.donor.findUnique({
      where: { userId: decoded.userId },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor profile not found" }, { status: 404 })
    }

    return NextResponse.json(donor)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { bloodType, age, weight } = await request.json()

    const donor = await prisma.donor.upsert({
      where: { userId: decoded.userId },
      update: { bloodType, age, weight },
      create: {
        userId: decoded.userId,
        bloodType,
        age,
        weight,
      },
    })

    return NextResponse.json(donor)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
