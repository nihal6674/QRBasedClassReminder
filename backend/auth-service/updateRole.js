const { PrismaClient } = require("./shared/lib/generated/client")

const prisma = new PrismaClient()

async function main() {
  const email = 'mlujan@lpgca.com'

  const updatedAdmin = await prisma.admin.update({
    where: { email },
    data: { role: 'ADMIN' }
  })

  console.log("Admin updated successfully:", updatedAdmin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
