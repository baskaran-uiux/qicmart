import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
}

export async function GET() {
    try {
        const userCount = await prisma.user.count()
        const planCount = await prisma.subscriptionPlan.count()
        return NextResponse.json({ 
            status: "ok", 
            database: "connected", 
            users: userCount,
            plans: planCount
        })
    } catch (error: any) {
        return NextResponse.json({ 
            status: "error", 
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name } = await req.json()
        if (!name || name.length < 3) {
            return NextResponse.json({ error: "Store name must be at least 3 characters" }, { status: 400 })
        }

        const userId = (session.user as any).id
        
        // Generate slug
        let slug = slugify(name)
        
        // Check if slug exists
        const existingStore = await prisma.store.findUnique({ where: { slug } })
        if (existingStore) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`
        }

        console.log("Creating store with data:", { name, slug, ownerId: userId })
        // 1. Create the store
        const store = await prisma.store.create({
            data: {
                name,
                slug,
                ownerId: userId,
                currency: "INR",
                themeConfig: JSON.stringify({
                    primaryColor: "#4f46e5",
                    fontFamily: "Inter",
                    menuAlignment: "left",
                    footerText: `© ${new Date().getFullYear()} ${name}. All rights reserved.`
                })
            }
        })
        console.log("Store created:", store.id)

        // 2. Create default Subscription (Normal/Free)
        const freePlan = await prisma.subscriptionPlan.findFirst({
            where: { name: { contains: "Normal" } }
        })
        console.log("Free plan found:", freePlan?.id)

        if (freePlan) {
            const sub = await prisma.subscription.create({
                data: {
                    storeId: store.id,
                    planId: freePlan.id,
                    status: "ACTIVE",
                    billingCycle: "MONTHLY",
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
                }
            })
            console.log("Subscription created:", sub.id)
        } else {
            console.warn("No 'Normal' subscription plan found in database.")
        }

        // 3. Update User role to STORE_OWNER if they are just CUSTOMER
        if ((session.user as any).role === "CUSTOMER") {
             console.log("Updating user role to STORE_OWNER for id:", userId)
             await prisma.user.update({
                where: { id: userId },
                data: { role: "STORE_OWNER" }
            })
        }

        return NextResponse.json({ success: true, store })
    } catch (error: any) {
        console.error("ONBOARDING_ERROR_DETAILS:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        })
        return NextResponse.json({ 
            error: "Failed to create store", 
            details: error.message 
        }, { status: 500 })
    }
}
