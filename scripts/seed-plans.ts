import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env') })
console.log('DATABASE_URL:', process.env.DATABASE_URL)

import { PrismaClient } from '../src/generated/prisma'
const prisma = new PrismaClient()

async function main() {
  const plansData = [
    { name: 'Normal', priceMonthly: 29.0, priceYearly: 290.0, maxProducts: 100, maxStaff: 2, maxStorageMB: 1024, maxOrdersPerMo: 500 },
    { name: 'Pro', priceMonthly: 79.0, priceYearly: 790.0, maxProducts: 1000, maxStaff: 10, maxStorageMB: 5120, maxOrdersPerMo: 5000 },
    { name: 'Enterprise', priceMonthly: 299.0, priceYearly: 2990.0, maxProducts: 100000, maxStaff: 100, maxStorageMB: 51200, maxOrdersPerMo: 100000 },
  ]

  for (const p of plansData) {
    const ex = await prisma.subscriptionPlan.findFirst({ where: { name: p.name } })
    if (!ex) {
        await prisma.subscriptionPlan.create({ data: p })
        console.log(`✅ Created plan: ${p.name}`)
    } else {
        console.log(`ℹ️ Plan already exists: ${p.name}`)
    }
  }

  const allPlans = await prisma.subscriptionPlan.findMany()
  console.log('Final Plans in DB:', JSON.stringify(allPlans, null, 2))
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
