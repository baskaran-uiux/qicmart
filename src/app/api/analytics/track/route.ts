import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { storeId, isNewVisitor, customerId, type, description, metadata } = await req.json()

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
        }

        // 1. Log Granular Customer Activity if provided
        if (customerId && type) {
            await prisma.customerActivity.create({
                data: {
                    customerId,
                    type,
                    description: description || "Action performed",
                    metadata: metadata ? JSON.stringify(metadata) : null
                }
            })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 2. Update store analytics
        await prisma.analytics.upsert({
            where: {
                storeId_date: {
                    storeId,
                    date: today
                }
            },
            update: {
                pageViews: { increment: 1 },
                ...(isNewVisitor ? { visitors: { increment: 1 } } : {}),
                ...(type === "PLACE_ORDER" ? { orders: { increment: 1 } } : {})
            },
            create: {
                storeId,
                date: today,
                pageViews: 1,
                visitors: isNewVisitor ? 1 : 1,
                revenue: 0,
                orders: type === "PLACE_ORDER" ? 1 : 0
            }
        })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error("Analytics Tracking Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
