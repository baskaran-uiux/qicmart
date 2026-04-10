const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- PRODUCT SEARCH BEGIN ---");
    const products = await prisma.product.findMany({
        where: { name: { contains: 'Beats', mode: 'insensitive' } },
        include: { store: true }
    });
    
    if (products.length === 0) {
        console.log("No products found with name containing 'Beats'");
    } else {
        products.forEach(p => {
            console.log(`- Product: "${p.name}"`);
            console.log(`  ID: ${p.id}`);
            console.log(`  isActive: ${p.isActive}`);
            console.log(`  Store Name: ${p.store.name}`);
            console.log(`  Store Slug: ${p.store.slug}`);
            console.log(`  Images JSON: ${p.images}`);
        });
    }

    const demoStore = await prisma.store.findUnique({ where: { slug: 'demo' } });
    if (demoStore) {
        console.log(`- Demo Store ID: ${demoStore.id}`);
    }
    console.log("--- PRODUCT SEARCH END ---");
}

main().catch(console.error).finally(() => prisma.$disconnect());
