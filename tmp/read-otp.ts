import { prisma } from "../src/lib/prisma"

async function main() {
    const tokens = await prisma.verificationToken.findMany({
        orderBy: { expires: 'desc' },
        take: 1
    })

    if (tokens.length === 0) {
        console.log("No OTP tokens found.")
        return
    }

    console.log("Latest Verification Tokens:")
    tokens.forEach(t => {
        console.log(`Email: ${t.identifier}`)
        console.log(`Token (Hashed): ${t.token}`)
        console.log(`Expires: ${t.expires}`)
    })
}

main()
