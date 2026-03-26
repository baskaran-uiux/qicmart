import { PrismaClient } from "./src/generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ 
        select: { id: true, email: true, role: true } 
    });
    const stores = await prisma.store.findMany({ 
        select: { id: true, name: true, subdomain: true, ownerId: true } 
    });
    
    console.log("=== USERS ===");
    console.log(JSON.stringify(users, null, 2));
    
    console.log("=== STORES ===");
    console.log(JSON.stringify(stores, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
