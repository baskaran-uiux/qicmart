const { PrismaClient } = require('../src/generated/prisma')
const prisma = new PrismaClient()

async function main() {
    const email = `test-heal-${Date.now()}@example.com`
    console.log(`Creating test owner without store: ${email}`)
    
    const user = await prisma.user.create({
        data: {
            email,
            name: "Heal Test User",
            role: "STORE_OWNER"
        }
    })
    
    console.log(`User created with ID: ${user.id}`)
    console.log(`Success. Use this ID to test: ${user.id}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
