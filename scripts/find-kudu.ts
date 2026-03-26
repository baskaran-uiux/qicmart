
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allStores = await prisma.store.findMany({
    select: {
      name: true,
      subdomain: true
    }
  })

  console.log("--- ALL STORES ---")
  allStores.forEach(s => {
    console.log(`Subdomain: ${s.subdomain} | Name: ${s.name}`)
  })

  const kudu = await prisma.store.findFirst({
    where: {
      OR: [
        { subdomain: { contains: 'kudu' } },
        { name: { contains: 'kudu' } }
      ]
    },
    select: {
      name: true,
      subdomain: true
    }
  })

  if (kudu) {
    console.log("--- MATCH FOUND ---")
    console.log(`Subdomain: ${kudu.subdomain} | Name: ${kudu.name}`)
  } else {
    console.log("--- NO KUDU FOUND ---")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
