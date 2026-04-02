import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
    }
  })
  console.log("Users in DB:", JSON.stringify(users, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
