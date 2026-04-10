import { prisma } from "./prisma";

async function check() {
    const product = await prisma.product.findFirst({
        where: { name: { contains: "Beats", mode: "insensitive" } }
    });
    console.log("DATABASE_RESULT_START");
    console.log(JSON.stringify(product, null, 2));
    console.log("DATABASE_RESULT_END");
}

check().catch(console.error);
