import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
    try {
        const email = "owner@store.com"
        const password = "password123"
        const hashedPassword = await bcrypt.hash(password, 10)

        // 1. Upsert the User
        const user = await prisma.user.upsert({
            where: { email },
            update: { 
                password: hashedPassword,
                role: "STORE_OWNER",
                name: "John Store Owner"
            },
            create: { 
                email, 
                name: "John Store Owner", 
                password: hashedPassword, 
                role: "STORE_OWNER" 
            }
        })

        // 2. Ensure the demo store exists and is owned by this user
        const store = await prisma.store.upsert({
            where: { slug: "demo" },
            update: { ownerId: user.id },
            create: { 
                name: "Demo SaaS Store", 
                slug: "demo", 
                ownerId: user.id, 
                currency: "INR" 
            }
        })

        // 3. Clear any active session blocks for this user
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: null, currentSessionId: null }
        })

        return NextResponse.json({ 
            success: true, 
            message: "Password reset for owner@store.com to 'password123'. Session blocks cleared.",
            user: { id: user.id, email: user.email },
            store: { id: store.id, slug: store.slug }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
