import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating all stores to INR currency...')
    const updatedStores = await prisma.store.updateMany({
        data: {
            currency: 'INR'
        }
    })
    console.log(`Updated ${updatedStores.count} stores.`)

    console.log('Updating all payments to INR currency...')
    const updatedPayments = await prisma.payment.updateMany({
        data: {
            currency: 'INR'
        }
    })
    console.log(`Updated ${updatedPayments.count} payments.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
