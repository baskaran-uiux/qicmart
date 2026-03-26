
import { prisma } from "../src/lib/prisma";

async function main() {
    const activeUserId = "cmmt6hkth001y3w99f5cq0jwr"; // The one logged in
    const targetStoreSlug = "jeevan";

    try {
        const store = await prisma.store.findUnique({
            where: { slug: targetStoreSlug }
        });

        if (!store) {
            console.error("Store not found:", targetStoreSlug);
            return;
        }

        console.log(`Re-assigning store ${store.name} (${store.id}) from ${store.ownerId} to ${activeUserId}`);

        await prisma.store.update({
            where: { id: store.id },
            data: { ownerId: activeUserId }
        });

        console.log("SUCCESS: Store re-assigned.");

    } catch (error) {
        console.error("FIX ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
