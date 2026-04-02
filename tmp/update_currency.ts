import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.store.updateMany({
    data: {
      currency: "INR"
    }
  })
  console.log(`✅ Updated ${result.count} stores to INR`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
