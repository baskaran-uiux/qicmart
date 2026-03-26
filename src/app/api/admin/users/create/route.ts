import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { name, email, password, storeName } = await req.json()

        if (!name || !email || !password || !storeName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
        }

        // Generate slug from store name
        let slug = storeName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
        
        // Ensure slug is unique
        const existingStore = await prisma.store.findUnique({
            where: { slug }
        })
    
        if (existingStore) {
            return NextResponse.json({ error: "Store address already taken. Please use a different store name." }, { status: 400 })
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
    
        // Find default plan (Normal)
        const defaultPlan = await prisma.subscriptionPlan.findFirst({
            where: { name: "Normal" }
        })
    
        if (!defaultPlan) {
            return NextResponse.json({ error: "Default subscription plan not found. Please run seeds." }, { status: 500 })
        }
    
        // Create everything in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "STORE_OWNER"
                }
            })
    
            // Create Store 1
            const store1 = await tx.store.create({
                data: {
                    name: storeName,
                    slug,
                    ownerId: user.id,
                    isActive: true,
                    currency: "INR"
                }
            })
    
            await tx.subscription.create({
                data: {
                    storeId: store1.id,
                    planId: defaultPlan.id,
                    status: "ACTIVE",
                    billingCycle: "MONTHLY",
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            })

            return { user, store1 }
        })
    
        return NextResponse.json({
            message: "User and Store created successfully",
            userId: result.user.id,
            storeId: result.store1.id,
            slug: result.store1.slug
        })

    } catch (error: any) {
        console.error("User Provisioning Error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
