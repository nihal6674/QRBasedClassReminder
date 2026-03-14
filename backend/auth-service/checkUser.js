const { PrismaClient } = require("./shared/lib/generated/client")

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { email: 'mlujan@lpgca.com' }
  })
  console.log("DB ADMIN:", admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
