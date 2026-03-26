
import { prisma } from "../src/lib/prisma";

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: {
                ownedStores: {
                    select: { name: true, slug: true }
                }
            }
        });
        console.log("--- ALL USERS ---");
        console.log(JSON.stringify(users, null, 2));

    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
