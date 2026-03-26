
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  })
  console.log('Users:', JSON.stringify(users, null, 2))
  
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, subdomain: true, ownerId: true }
  })
  console.log('Stores:', JSON.stringify(stores, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
