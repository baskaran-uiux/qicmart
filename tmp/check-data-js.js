const { PrismaClient } = require('../src/generated/prisma')
const prisma = new PrismaClient()

async function main() {
  try {
    const storeCount = await prisma.store.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const userCount = await prisma.user.count()
    
    console.log('--- Database Count ---')
    console.log(`Stores: ${storeCount}`)
    console.log(`Products: ${productCount}`)
    console.log(`Orders: ${orderCount}`)
    console.log(`Users: ${userCount}`)
    console.log('----------------------')
  } catch (e) {
    console.error('Error during counts:', e.message)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
