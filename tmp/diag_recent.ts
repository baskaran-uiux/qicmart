
import { prisma } from "../src/lib/prisma";

async function main() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { store: { select: { name: true, slug: true } } }
        });
        console.log("--- RECENT PRODUCTS ---");
        console.log(JSON.stringify(products, null, 2));

    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
