import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function checkUserAndCustomer() {
  const email = "baskaran.nr007@gmail.com"
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { customers: true }
  })
  
  if (!user) {
    console.log(`User ${email} not found`)
    return
  }
  
  console.log("USER:", {
    id: user.id,
    name: user.name,
    phone: user.phone,
    gender: user.gender
  })
  
  console.log("CUSTOMERS:", user.customers.map(c => ({
    id: c.id,
    storeId: c.storeId,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email
  })))
  
  await prisma.$disconnect()
}

checkUserAndCustomer()
