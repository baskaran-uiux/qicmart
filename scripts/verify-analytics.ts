import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
    console.log("--- Starting Analytics Verification ---")
    
    // 1. Find the demo store
    const store = await prisma.store.findFirst({ where: { subdomain: 'demo' } })
    if (!store) {
        console.error("Demo store not found")
        process.exit(1)
    }
    console.log(`Testing with Store: ${store.name} (${store.id})`)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 2. Simulate 5 Page Views
    console.log("Simulating 5 page views...")
    for (let i = 0; i < 5; i++) {
        await prisma.analytics.upsert({
            where: { storeId_date: { storeId: store.id, date: today } },
            update: { pageViews: { increment: 1 } },
            create: { storeId: store.id, date: today, pageViews: 1, visitors: 1, revenue: 0, orders: 0 }
        })
    }

    // 3. Simulate 2 Sales
    console.log("Simulating 2 sales total $150...")
    await prisma.analytics.upsert({
        where: { storeId_date: { storeId: store.id, date: today } },
        update: { 
            revenue: { increment: 150 },
            orders: { increment: 2 }
        },
        create: { storeId: store.id, date: today, pageViews: 0, visitors: 0, revenue: 150, orders: 2 }
    })

    // 4. Verify Database Records
    const stats = await prisma.analytics.findUnique({
        where: { storeId_date: { storeId: store.id, date: today } }
    })
    console.log("Verification results from database:")
    console.log(JSON.stringify(stats, null, 2))

    if (stats && stats.pageViews >= 5 && stats.revenue >= 150) {
        console.log("✅ Analytics data successfully recorded in DB.")
    } else {
        console.error("❌ Analytics verification failed.")
    }
}

test().catch(console.error).finally(() => prisma.$disconnect())
