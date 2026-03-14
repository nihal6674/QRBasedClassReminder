const { PrismaClient } = require("./shared/lib/generated/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  const existing = await prisma.admin.findUnique({
    where: { email }
  })

  if (existing) {
    console.log("Admin already exists")
    return
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.admin.create({
    data: {
      email,
      password: hashed,
      name: "System Administrator"
    }
  })

  console.log("Admin created successfully")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())