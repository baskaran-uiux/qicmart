import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: customerId } = await params
        const session = await getServerSession(authOptions)

        // Fetch customer basic info
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: { select: { name: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 })

        // Fetch activities
        const activities = await prisma.customerActivity.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" }
        })

        // Format timeline data
        const timeline = [
            ...activities.map(a => ({
                id: a.id,
                type: a.type,
                description: a.description,
                metadata: a.metadata ? JSON.parse(a.metadata) : null,
                createdAt: a.createdAt,
                category: "activity"
            })),
            ...customer.orders.map(o => {
                const itemNames = o.items.map((i: any) => i.product.name).join(", ")
                return {
                    id: o.id,
                    type: "PLACE_ORDER",
                    description: itemNames || `Order #${o.id.slice(-8)}`,
                    metadata: {
                        orderId: o.id,
                        total: o.total,
                        status: o.status,
                        date: o.createdAt
                    },
                    createdAt: o.createdAt,
                    category: "order"
                }
            })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                totalSpend: customer.orders.reduce((sum, o) => sum + o.total, 0),
                totalOrders: customer.orders.length
            },
            timeline
        })
    } catch (error: any) {
        console.error("Timeline API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
