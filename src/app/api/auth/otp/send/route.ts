import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const sanitizedEmail = email.trim().toLowerCase()
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        
        // 2. Hash it
        const hashedOtp = await bcrypt.hash(otp, 10)
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 3. Ensure only one active token exists per email (Standardize for OTP)
        try {
            await prisma.verificationToken.deleteMany({
                where: { identifier: sanitizedEmail }
            })
            
            await prisma.verificationToken.create({
                data: {
                    identifier: sanitizedEmail,
                    token: hashedOtp,
                    expires
                }
            })
        } catch (dbError) {
            console.error("[OTP_DB_ERROR]", dbError)
        }

        // 4. Send Email via Gmail SMTP (Nodemailer)
        const nodemailer = await import("nodemailer")
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        })

        try {
            await transporter.sendMail({
                from: `"Qicmart" <${process.env.GMAIL_USER}>`,
                to: sanitizedEmail,
                subject: 'Your Qicmart Access Code',
                html: `
                    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 24px; background-color: #ffffff; border: 1px solid #f0f0f0;">
                        <div style="margin-bottom: 32px; text-align: center;">
                            <h2 style="font-size: 24px; font-weight: 800; color: #18181b; text-transform: uppercase; letter-spacing: -0.025em; margin: 0; font-style: italic;">Qicmart Authentication</h2>
                            <p style="font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Access Your Storefront Profile</p>
                        </div>
                        
                        <div style="background-color: #f4f4f5; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px;">
                            <p style="font-size: 13px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px 0;">Your 6-Digit Access Code</p>
                            <h1 style="font-size: 48px; font-weight: 900; color: #3b82f6; letter-spacing: 0.2em; margin: 0;">${otp}</h1>
                        </div>
                        
                        <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin-bottom: 24px;">
                            Hello! Use the code above to sign in to your Shopper Profile. This code will expire in <strong>10 minutes</strong>.
                        </p>
                        
                        <div style="border-top: 1px solid #f0f0f0; padding-top: 24px; text-align: center;">
                            <p style="font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
                                If you didn't request this code, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                `
            })
            console.log(`[AUTH] Gmail OTP email sent to ${sanitizedEmail}`)
        } catch (mailError) {
            console.error("[OTP_MAIL_ERROR]", mailError)
        }

        // 5. Log to console for development
        console.log("------------------------------------------")
        console.log(`[AUTH] OTP for ${email}: ${otp}`)
        console.log("------------------------------------------")

        // 6. Save to file for verification
        const fs = require('fs')
        if (!fs.existsSync('tmp')) fs.mkdirSync('tmp')
        fs.writeFileSync('tmp/otp.txt', otp)

        return NextResponse.json({ success: true, message: "OTP sent successfully" })
    } catch (error) {
        console.error("[OTP_SEND_ERROR]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
