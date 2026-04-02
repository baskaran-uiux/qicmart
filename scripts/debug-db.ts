import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
    console.log("--- STORES ---")
    const stores = await prisma.store.findMany()
    console.log(JSON.stringify(stores, null, 2))

    console.log("\n--- USERS ---")
    const users = await prisma.user.findMany()
    console.log(JSON.stringify(users, null, 2))

    console.log("\n--- ORDERS ---")
    const orders = await prisma.order.findMany({
        include: {
            customer: true,
            items: true
        }
    })
    console.log(JSON.stringify(orders, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
