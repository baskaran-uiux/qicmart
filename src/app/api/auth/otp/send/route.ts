import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // 1. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        
        // 2. Hash it
        const hashedOtp = await bcrypt.hash(otp, 10)
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 3. Save to VerificationToken (Identifier = email, Token = hashed otp)
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: email,
                    token: hashedOtp
                }
            },
            update: {
                token: hashedOtp,
                expires
            },
            create: {
                identifier: email,
                token: hashedOtp,
                expires
            }
        }).catch(async (e) => {
            // Handle unique constraint if we can't upsert reliably on identifier
            // Just delete old ones and create new one
            await prisma.verificationToken.deleteMany({
                where: { identifier: email }
            })
            await prisma.verificationToken.create({
                data: {
                    identifier: email,
                    token: hashedOtp,
                    expires
                }
            })
        })

        // 4. Log to console for development (since no SMTP)
        console.log("------------------------------------------")
        console.log(`[AUTH] OTP for ${email}: ${otp}`)
        console.log("------------------------------------------")

        // 5. Save to file for verification
        const fs = require('fs')
        if (!fs.existsSync('tmp')) fs.mkdirSync('tmp')
        fs.writeFileSync('tmp/otp.txt', otp)

        return NextResponse.json({ success: true, message: "OTP sent successfully" })
    } catch (error) {
        console.error("[OTP_SEND_ERROR]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
