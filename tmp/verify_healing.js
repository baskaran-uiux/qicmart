const { getStoreForDashboard } = require('../src/lib/dashboard')
const { PrismaClient } = require('../src/generated/prisma')
const prisma = new PrismaClient()

async function test() {
    const userId = "cmmy2r11i0000fvw51ib5gj30"
    console.log(`Testing getStoreForDashboard for user: ${userId}`)
    
    // 1. Initial check (should have 0 stores)
    const initialStores = await prisma.store.findMany({ where: { ownerId: userId } })
    console.log(`Initial store count: ${initialStores.length}`)

    // 2. Call the function (should trigger self-healing)
    const store = await getStoreForDashboard(userId)
    
    if (store) {
        console.log(`Success! Store created: ${store.id} (${store.name})`)
        console.log(`Slug: ${store.slug}`)
        if (store.subscription) {
            console.log(`Subscription created with plan: ${store.subscription.plan.name}`)
        } else {
            console.log("FAILED: Subscription not found")
        }
    } else {
        console.log("FAILED: No store returned")
    }

    // 3. Final check
    const finalStores = await prisma.store.findMany({ where: { ownerId: userId } })
    console.log(`Final store count: ${finalStores.length}`)
}

test()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
