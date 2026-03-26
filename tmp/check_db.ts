import { PrismaClient } from './src/generated/prisma'
const prisma = new PrismaClient()

async function main() {
    console.log("--- USERS ---")
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
    console.table(users)

    console.log("\n--- STORES ---")
    const stores = await prisma.store.findMany({ select: { id: true, name: true, ownerId: true } })
    console.table(stores)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
