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
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [totalDonors, totalHospitals, totalDonations, pendingRequests, approvedRequests, inventory] =
      await Promise.all([
        prisma.donor.count(),
        prisma.hospital.count(),
        prisma.donation.count(),
        prisma.bloodRequest.count({ where: { status: "PENDING" } }),
        prisma.bloodRequest.count({ where: { status: "APPROVED" } }),
        prisma.bloodInventory.findMany(),
      ])

    const totalBloodUnits = inventory.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      totalDonors,
      totalHospitals,
      totalDonations,
      pendingRequests,
      approvedRequests,
      totalBloodUnits,
    })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
