import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyPassword } from "@/lib/auth"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordValid = await verifyPassword(password, user.password)

    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
