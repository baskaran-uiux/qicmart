import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const storeCount = await prisma.store.count()
  const productCount = await prisma.product.count()
  const orderCount = await prisma.order.count()
  const shippingRateCount = await prisma.shippingRate.count()
  
  console.log('--- Database Count ---')
  console.log(`Stores: ${storeCount}`)
  console.log(`Products: ${productCount}`)
  console.log(`Orders: ${orderCount}`)
  console.log(`Shipping Rates: ${shippingRateCount}`)
  console.log('----------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
