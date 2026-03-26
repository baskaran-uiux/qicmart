import { PrismaClient } from "./src/generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    const stores = await prisma.store.findMany({ select: { id: true, name: true, subdomain: true, ownerId: true } });
    console.log("=== USERS ===");
    users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.role}`));
    console.log("=== STORES ===");
    stores.forEach(s => console.log(`${s.id} | ${s.name} | ${s.subdomain} | owner: ${s.ownerId}`));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
