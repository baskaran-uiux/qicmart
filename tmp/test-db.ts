import { PrismaClient } from "../src/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  console.log("Testing database connection...")
  try {
    await prisma.$connect()
    console.log("✅ Successfully connected to the database.")
    
    const users = await prisma.user.findMany({
      include: { 
        accounts: {
          select: { provider: true }
        }, 
        ownedStores: {
          select: { slug: true }
        }
      }
    })
    console.log("--- Users in Database ---")
    users.forEach(u => {
      console.log(`User: ${u.email} (ID: ${u.id}, Role: ${u.role})`)
      console.log(`  Accounts: ${u.accounts.length} (${u.accounts.map(a => a.provider).join(", ")})`)
      console.log(`  Owned Stores: ${u.ownedStores.length} (${u.ownedStores.map(s => s.slug).join(", ")})`)
    })
    console.log("-------------------------")
    
    const planCount = await prisma.subscriptionPlan.count()
    console.log(`✅ Subscription Plan count: ${planCount}`)
    
    console.log("Database connection is healthy.")
  } catch (error: any) {
    console.error("❌ Database operation failed:")
    console.error("Message:", error.message)
    console.error("Code:", error.code)
    console.error("Meta:", error.meta)
    if (error.stack) console.error("Stack:", error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
