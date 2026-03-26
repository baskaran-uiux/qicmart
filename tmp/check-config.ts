import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
    const storeId = "cmmpc8w0j0006w1cpowfuhwea" // Instavirus
    console.log("Checking Store ID:", storeId)

    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { themeConfig: true }
    })

    if (store && store.themeConfig) {
        const config = JSON.parse(store.themeConfig)
        console.log("Theme Config menuItems:", JSON.stringify(config.menuItems, null, 2))
    } else {
        console.log("No themeConfig found for store.")
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
