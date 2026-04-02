import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const orderId = searchParams.get("id")

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Return only safe tracking info
        return NextResponse.json({
            id: order.id,
            status: order.status,
            carrier: order.carrier,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
            items: order.items.map(i => i.product.name)
        })
    } catch (error: any) {
        console.error("[ORDER_TRACK_API_ERROR]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
