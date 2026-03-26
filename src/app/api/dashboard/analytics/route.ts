import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")
        let targetUserId = (session.user as any).id

        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
            targetUserId = ownerId
        }

        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard(targetUserId, dashboardType)

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }


        const now = new Date()
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(now.getFullYear() - 1)

        // Fetch metrics for Current Month
        const currentMonthStats = await prisma.order.aggregate({
            where: {
                storeId: store.id,
                createdAt: { gte: startOfCurrentMonth },
                status: { not: "CANCELLED" }
            },
            _sum: { total: true },
            _count: { id: true }
        })

        // Fetch metrics for Last Month
        const lastMonthStats = await prisma.order.aggregate({
            where: {
                storeId: store.id,
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                status: { not: "CANCELLED" }
            },
            _sum: { total: true },
            _count: { id: true }
        })

        // Fetch New Customers (Last 30 days vs previous 30 days)
        const currentMonthCustomers = await prisma.customer.count({
            where: { storeId: store.id, createdAt: { gte: startOfCurrentMonth } }
        })
        const lastMonthCustomers = await prisma.customer.count({
            where: { storeId: store.id, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
        })

        // Fetch Return/Cancelled products (Approximation based on status)
        const returnProducts = await prisma.order.count({
            where: {
                storeId: store.id,
                status: { in: ['CANCELLED', 'RETURNED', 'REFUNDED'] }
            }
        })

        // Fetch analytics for the last 12 months (for chart)
        const analytics = await prisma.analytics.findMany({
            where: {
                storeId: store.id,
                date: { gte: oneYearAgo }
            },
            orderBy: { date: "asc" }
        })

        // Fetch top products by revenue
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    storeId: store.id,
                    status: { not: "CANCELLED" }
                }
            },
            _sum: { price: true, quantity: true },
            orderBy: { _sum: { price: 'desc' } },
            take: 5
        })

        const productsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true }
                })
                return {
                    name: product?.name || "Unknown Product",
                    units: item._sum.quantity || 0,
                    rev: item._sum.price || 0,
                    trend: "↑ 0%"
                }
            })
        )

        // Fetch Recent Orders with customer and items detail
        const recentOrders = await prisma.order.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                customer: true,
                items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            metrics: {
                current: {
                    revenue: currentMonthStats._sum.total || 0,
                    orders: currentMonthStats._count.id || 0,
                    customers: currentMonthCustomers
                },
                last: {
                    revenue: lastMonthStats._sum.total || 0,
                    orders: lastMonthStats._count.id || 0,
                    customers: lastMonthCustomers
                },
                returnProducts
            },
            analytics,
            topProducts: productsWithDetails,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                total: order.total,
                status: order.status,
                createdAt: order.createdAt,
                customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : 'Guest',
                itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
                firstItem: order.items[0] ? {
                    name: order.items[0].product.name,
                    category: order.items[0].product.category?.name || 'Uncategorized'
                } : null
            }))
        })
    } catch (error: any) {
        console.error("Dashboard Analytics Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
