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
    const dashboardType = searchParams.get("dashboardType") || "1"
    
    let targetUserId = (session.user as any).id
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    // Find store for this user and dashboard type
    const store = await getStoreForDashboard(targetUserId, dashboardType)

    if (!store) return NextResponse.json({ notifications: [] })
    
    // Check if notifications are enabled in themeConfig
    let themeConfig: Record<string, any> = {}
    try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig) } catch { }
    
    const isOrderNotificationEnabled = themeConfig.isOrderNotificationEnabled !== false
    if (!isOrderNotificationEnabled) {
        return NextResponse.json({ notifications: [] })
    }

    // Get pending orders from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const [recentOrders, recentReviews] = await Promise.all([
        prisma.order.findMany({
            where: {
                storeId: store.id,
                status: "PENDING",
                createdAt: { gte: yesterday }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        }),
        prisma.review.findMany({
            where: {
                storeId: store.id,
                createdAt: { gte: yesterday }
            },
            include: {
                product: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        })
    ])

    const orderNotifications = recentOrders.map(order => ({
        id: order.id,
        title: "New Order 🎉",
        message: `Order #${order.id.slice(-6).toUpperCase()} for ${store.currency === 'INR' ? '₹' : '$'}${order.total.toFixed(2)}`,
        time: order.createdAt,
        link: "/dashboard/orders",
        type: 'ORDER'
    }))

    const reviewNotifications = recentReviews.map(review => ({
        id: review.id,
        title: "New Review ⭐",
        message: `${review.user?.name || 'A customer'} reviewed "${review.product.name}"`,
        time: review.createdAt,
        link: "/dashboard/reviews",
        type: 'REVIEW'
    }))

    // Combine and sort by time
    const notifications = [...orderNotifications, ...reviewNotifications]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10)

    return NextResponse.json({ notifications })
}
