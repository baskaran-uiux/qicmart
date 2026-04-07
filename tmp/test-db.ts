import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing database connection...')
    const userCount = await prisma.user.count()
    console.log('Connection successful!')
    console.log('User count:', userCount)
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
