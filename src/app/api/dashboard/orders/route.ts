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
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const orders = await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            },
            payments: true,
            activities: {
                orderBy: { createdAt: "desc" }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(orders)
}

export async function PUT(req: Request) {
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
    const { orderId, status, trackingNumber, carrier, trackingUrl, estimatedDelivery, comment } = body

    const existingOrder = await prisma.order.findUnique({
        where: { id: orderId }
    })

    const updated = await prisma.order.update({
        where: { 
            id: orderId,
            storeId: store.id // Security check
        },
        data: { 
            status, 
            trackingNumber, 
            carrier, 
            trackingUrl, 
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined 
        }
    })
    
    // If status is "PAID", also update payment status to "COMPLETED"
    if (status === "PAID") {
        await prisma.payment.updateMany({
            where: { orderId: orderId },
            data: { status: "COMPLETED" }
        })
    }

    // Log activity if status changed or if tracking info was added
    if (status !== existingOrder?.status || trackingNumber || comment) {
        await prisma.orderActivity.create({
            data: {
                orderId,
                status: status || existingOrder?.status || "PENDING",
                comment: comment || (trackingNumber ? `Tracking added: ${carrier} - ${trackingNumber}` : `Status updated to ${status}`)
            }
        })
    }

    return NextResponse.json({ ok: true, order: updated })
}
