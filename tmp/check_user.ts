
import { prisma } from "../src/lib/prisma";

async function main() {
    const id = "cmmt6hkth001y3w99f5cq0jwr";
    const user = await prisma.user.findUnique({ where: { id } });
    console.log("USER:", JSON.stringify(user, null, 2));
}

main();
