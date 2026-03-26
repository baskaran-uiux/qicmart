const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@platform.com' }
  });
  console.log('User:', JSON.stringify(user, null, 2));
}

check().then(() => prisma.$disconnect());
