const { PrismaClient } = require('../src/generated/prisma')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
    const stores = await prisma.store.findMany({ select: { id: true, name: true, ownerId: true } })
    
    const output = { users, stores }
    console.log("--- START DUMP ---")
    console.log(JSON.stringify(output, null, 2))
    console.log("--- END DUMP ---")
}

main()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect())
