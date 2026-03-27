import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")?.trim()
        const dashboardType = searchParams.get("dashboardType") || "1"
        let targetUserId = (session.user as any).id

        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
            targetUserId = ownerId
        }

        const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const storeId = store.id

        // Delete all data related to the store but keep the store itself
        // Using a transaction to ensure all or nothing
        await prisma.$transaction([
            prisma.orderItem.deleteMany({ where: { order: { storeId } } }),
            prisma.orderActivity.deleteMany({ where: { order: { storeId } } }),
            prisma.payment.deleteMany({ where: { storeId } }),
            prisma.order.deleteMany({ where: { storeId } }),
            prisma.review.deleteMany({ where: { storeId } }),
            prisma.product.deleteMany({ where: { storeId } }),
            prisma.category.deleteMany({ where: { storeId } }),
            prisma.customerActivity.deleteMany({ where: { customer: { storeId } } }),
            prisma.customer.deleteMany({ where: { storeId } }),
            prisma.mediaLibrary.deleteMany({ where: { storeId } }),
            prisma.analytics.deleteMany({ where: { storeId } }),
            prisma.customPage.deleteMany({ where: { storeId } }),
            prisma.coupon.deleteMany({ where: { storeId } }),
            prisma.blog.deleteMany({ where: { storeId } }),
            prisma.shippingMethod.deleteMany({ where: { storeId } }),
            prisma.newsletterSubscriber.deleteMany({ where: { storeId } }),
        ])

        return NextResponse.json({ ok: true, message: "Store data erased successfully" })
    } catch (e: any) {
        console.error("Store Data Erase Error:", e)
        return NextResponse.json({ error: e.message || "Failed to erase store data" }, { status: 500 })
    }
}
