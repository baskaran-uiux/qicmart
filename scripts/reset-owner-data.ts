import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Try to find the first STORE_OWNER if no email is provided
  const emailArg = process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1]
  console.log(`[DEBUG] emailArg: ${emailArg}`)
  
  let user
  if (emailArg) {
    user = await prisma.user.findUnique({ where: { email: emailArg }, include: { ownedStores: true } })
    console.log(`[DEBUG] User found by email: ${user ? 'YES' : 'NO'}`)
  } else {
    user = await prisma.user.findFirst({ where: { role: 'STORE_OWNER' }, include: { ownedStores: true } })
    console.log(`[DEBUG] User found by role STORE_OWNER: ${user ? 'YES' : 'NO'}`)
  }

  if (!user) {
    console.error('No suitable user found to reset.')
    return
  }

  console.log(`Targeting User: ${user.name} (${user.email}) [ID: ${user.id}]`)
  console.log(`Found ${user.ownedStores.length} stores.`)

  for (const store of user.ownedStores) {
    console.log(`\n--- Resetting Store: ${store.name} (${store.slug}) [ID: ${store.id}] ---`)
    
    // Delete dependent data across all models linked to this store
    // The order matters if there are no cascades, but our schema has mostly Cascade or SET NULL.
    
    const deleteOps = [
      prisma.payment.deleteMany({ where: { storeId: store.id } }),
      prisma.orderItem.deleteMany({ where: { order: { storeId: store.id } } }),
      prisma.order.deleteMany({ where: { storeId: store.id } }),
      prisma.review.deleteMany({ where: { storeId: store.id } }),
      prisma.product.deleteMany({ where: { storeId: store.id } }),
      prisma.category.deleteMany({ where: { storeId: store.id } }),
      prisma.customerActivity.deleteMany({ where: { customer: { storeId: store.id } } }),
      prisma.customer.deleteMany({ where: { storeId: store.id } }),
      prisma.mediaLibrary.deleteMany({ where: { storeId: store.id } }),
      prisma.coupon.deleteMany({ where: { storeId: store.id } }),
      prisma.blog.deleteMany({ where: { storeId: store.id } }),
      prisma.shippingMethod.deleteMany({ where: { storeId: store.id } }),
      prisma.newsletterSubscriber.deleteMany({ where: { storeId: store.id } }),
      prisma.analytics.deleteMany({ where: { storeId: store.id } }),
    ]

    const results = await Promise.all(deleteOps)
    console.log(`Deleted records:`)
    console.log(`- Payments: ${results[0].count}`)
    console.log(`- OrderItems: ${results[1].count}`)
    console.log(`- Orders: ${results[2].count}`)
    console.log(`- Reviews: ${results[3].count}`)
    console.log(`- Products: ${results[4].count}`)
    console.log(`- Categories: ${results[5].count}`)
    console.log(`- CustomerActivities: ${results[6].count}`)
    console.log(`- Customers: ${results[7].count}`)
    console.log(`- MediaLibrary: ${results[8].count}`)
    console.log(`- Coupons: ${results[9].count}`)
    console.log(`- Blogs: ${results[10].count}`)
    console.log(`- ShippingMethods: ${results[11].count}`)
    console.log(`- NewsletterSubscribers: ${results[12].count}`)
    console.log(`- Analytics: ${results[13].count}`)

    // Re-initialize the store settings to default
    await prisma.store.update({
      where: { id: store.id },
      data: {
        logo: null,
        banner: null,
        description: "Freshly reset store. Ready for new products!",
        themeConfig: null,
        currency: "INR",
        isActive: true,
      }
    })
    console.log(`Store settings reset to defaults.`)
  }

  console.log('\nReset complete!')
}

main()
  .catch(e => {
    console.error('Error during reset:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
