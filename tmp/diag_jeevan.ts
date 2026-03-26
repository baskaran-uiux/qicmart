
import { prisma } from "../src/lib/prisma";

async function main() {
    const storeId = "cmmut7krn000dl54co0k2t6dv"; // Jeevan Store
    try {
        const categories = await prisma.category.findMany({
            where: { storeId }
        });
        console.log("--- JEEVAN CATEGORIES ---");
        console.log(JSON.stringify(categories, null, 2));

        const media = await prisma.mediaLibrary.findMany({
            where: { storeId }
        });
        console.log("\n--- JEEVAN MEDIA ---");
        console.log(JSON.stringify(media, null, 2));

        const products = await prisma.product.findMany({
            where: { storeId }
        });
        console.log("\n--- JEEVAN PRODUCTS ---");
        console.log(JSON.stringify(products, null, 2));

    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
