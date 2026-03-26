import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Starting password fix ---')
    const users = await prisma.user.findMany()
    
    for (const user of users) {
        if (!user.password) {
            console.log(`Skipping ${user.email} (no password)`)
            continue
        }

        // Very simple check: bcrypt hashes are 60 chars long and start with $2
        if (user.password.length === 60 && user.password.startsWith('$2')) {
            console.log(`Skipping ${user.email} (already hashed)`)
            continue
        }

        console.log(`Hashing password for ${user.email}...`)
        const hashed = await bcrypt.hash(user.password, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed }
        })
        console.log(`Done for ${user.email}`)
    }
    console.log('--- Password fix complete ---')
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
