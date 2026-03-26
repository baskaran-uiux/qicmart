import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Check ---')
    const users = await prisma.user.findMany({
        where: { role: 'STORE_OWNER' },
        include: { ownedStores: true }
    })
    console.log('Users and their stores:')
    users.forEach(u => {
        console.log(`- ${u.email} (${u.id}): ${u.ownedStores.length} stores`)
        u.ownedStores.forEach(s => console.log(`  * Store: ${s.name} (${s.slug})`))
    })

    const allStores = await prisma.store.findMany({
        include: { owner: true }
    })
    console.log('\nAll Stores in DB:')
    allStores.forEach(s => {
        console.log(`- ${s.name} (${s.slug}) | Owner: ${s.owner?.email || 'NONE'}`)
    })
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
