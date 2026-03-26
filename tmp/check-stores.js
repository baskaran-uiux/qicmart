const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const stores = await prisma.store.findMany();
  console.log('Stores:', stores.length);
  if (stores.length > 0) {
    console.log('First Store ID:', stores[0].id);
  }
}

check().then(() => prisma.$disconnect());
