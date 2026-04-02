import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

import { getStoreForDashboard } from "@/lib/dashboard"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json([])

    const customers = await prisma.customer.findMany({
        where: { 
            storeId: store.id,
            // Exclude admins and owners
            NOT: {
                OR: [
                    { user: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } } },
                    { userId: store.ownerId }
                ]
            }
        },
        include: {
            orders: {
                select: { total: true, createdAt: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const enrichedCustomers = customers.map(c => {
        const orderCount = c.orders.length
        const totalSpend = c.orders.reduce((sum, o) => sum + o.total, 0)
        const aov = orderCount > 0 ? totalSpend / orderCount : 0
        const lastOrderDate = c.orders.length > 0 
            ? new Date(Math.max(...c.orders.map(o => new Date(o.createdAt).getTime()))) 
            : null
        
        // Status logic
        let status = "New"
        if (orderCount > 0) {
            const sixtyDaysAgo = new Date()
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
            status = lastOrderDate && lastOrderDate > sixtyDaysAgo ? "Active" : "Inactive"
        }

        return {
            ...c,
            orderCount,
            totalSpend,
            aov,
            lastActive: lastOrderDate,
            status,
            orders: undefined // Remove raw orders to keep response clean
        }
    })

    return NextResponse.json(enrichedCustomers)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const body = await req.json()
    const customer = await prisma.customer.create({ data: { storeId: store.id, ...body } })
    return NextResponse.json(customer)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await prisma.customer.delete({ where: { id, storeId: store.id } })
    return NextResponse.json({ ok: true })
}
