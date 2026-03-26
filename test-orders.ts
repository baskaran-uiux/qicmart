import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    const stores = await prisma.store.findMany({
        select: { id: true, name: true, slug: true, ownerId: true }
    })
    console.log("Stores in DB:")
    console.log(JSON.stringify(stores, null, 2))

    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    })
    console.log("Recent Orders in DB:")
    console.log(JSON.stringify(orders, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
