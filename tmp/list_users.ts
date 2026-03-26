
import { prisma } from "../src/lib/prisma";

async function main() {
    const users = await prisma.user.findMany();
    console.log("ALL USERS:", JSON.stringify(users.map(u => ({ id: u.id, name: u.name, email: u.email })), null, 2));
}

main();
