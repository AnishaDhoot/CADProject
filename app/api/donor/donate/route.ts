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
    const { quantity } = await request.json()

    if (!quantity || quantity < 100 || quantity > 500) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const donor = await prisma.donor.findUnique({
      where: { userId: decoded.userId },
    })

    if (!donor) {
      return NextResponse.json({ error: "Donor profile not found" }, { status: 404 })
    }

    if (!donor.isEligible) {
      return NextResponse.json({ error: "You are not eligible to donate" }, { status: 400 })
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        donorId: donor.id,
        userId: decoded.userId,
        quantity,
        bloodType: donor.bloodType,
        status: "COMPLETED",
      },
    })

    // Update blood inventory
    await prisma.bloodInventory.upsert({
      where: { bloodType: donor.bloodType },
      update: { quantity: { increment: quantity } },
      create: { bloodType: donor.bloodType, quantity },
    })

    // Update donor stats
    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        totalDonations: { increment: 1 },
        lastDonationDate: new Date(),
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Donation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
