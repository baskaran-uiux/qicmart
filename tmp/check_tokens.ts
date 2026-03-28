import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function checkTokens() {
  const email = "baskaran.nr007@gmail.com"
  const tokens = await prisma.verificationToken.findMany({
    where: { identifier: email },
    orderBy: { expires: 'desc' }
  })
  
  console.log(`Tokens for ${email}:`, JSON.stringify(tokens, null, 2))
  await prisma.$disconnect()
}

checkTokens()
