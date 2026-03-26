import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
    console.log("--- STORES ---")
    const stores = await prisma.store.findMany()
    console.log(JSON.stringify(stores, null, 2))

    console.log("\n--- USERS ---")
    const users = await prisma.user.findMany()
    console.log(JSON.stringify(users, null, 2))

    console.log("\n--- CUSTOMERS ---")
    const customers = await prisma.customer.findMany()
    console.log(JSON.stringify(customers, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
