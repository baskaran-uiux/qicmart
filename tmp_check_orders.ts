import { PrismaClient } from './src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.order.findMany({
        include: { customer: true }
    });
    console.log(`Total Orders: ${orders.length}`);
    orders.forEach(o => {
        console.log(`Order ${o.id}: State ${o.customer?.state || 'Unknown'}, Total ${o.total}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
