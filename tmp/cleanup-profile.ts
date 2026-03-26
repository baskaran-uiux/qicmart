import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
    const storeId = "cmmpc8w0j0006w1cpowfuhwea" // Instavirus
    
    console.log("Cleaning up for store:", storeId)
    
    // 1. Delete Customer records for this store
    const deletedCustomers = await prisma.customer.deleteMany({
        where: { storeId }
    })
    console.log(`Deleted ${deletedCustomers.count} customer records.`)
    
    // 2. Clear MenuItems from themeConfig JSON
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { themeConfig: true }
    })

    if (store && store.themeConfig) {
        try {
            const config = JSON.parse(store.themeConfig)
            if (config.menuItems && Array.isArray(config.menuItems)) {
                const initialCount = config.menuItems.length
                // Filter out labels containing Profile or Account (case insensitive)
                config.menuItems = config.menuItems.filter((item: any) => {
                    const label = (item.label || "").toLowerCase()
                    return !label.includes("profile") && !label.includes("account")
                })
                
                const finalCount = config.menuItems.length
                console.log(`Filtered themeConfig menuItems: ${initialCount} -> ${finalCount}`)
                
                if (initialCount !== finalCount) {
                    await prisma.store.update({
                        where: { id: storeId },
                        data: { themeConfig: JSON.stringify(config) }
                    })
                    console.log("Updated themeConfig in database.")
                }
            }
        } catch (e) {
            console.error("Error parsing/updating themeConfig:", e)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
