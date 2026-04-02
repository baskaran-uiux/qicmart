import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
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

    try {
        const order = await prisma.order.findUnique({
            where: { 
                id: id,
                storeId: store.id // Security: Ensure order belongs to store
            },
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
            }
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Failed to fetch order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
