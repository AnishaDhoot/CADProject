import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create blood inventory entries
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  
  for (const bloodType of bloodTypes) {
    await prisma.bloodInventory.upsert({
      where: { bloodType },
      update: {},
      create: {
        bloodType,
        quantity: 2000, // Initial stock
      },
    })
  }

  // Create admin user
  const hashedPassword = await hash("admin123", 10)
  
  await prisma.user.upsert({
    where: { email: "admin@bloodbank.com" },
    update: {},
    create: {
      email: "admin@bloodbank.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  })

  console.log("✅ Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

