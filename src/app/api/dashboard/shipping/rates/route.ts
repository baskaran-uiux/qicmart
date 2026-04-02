import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { 
            zoneId, name, type, 
            minWeight, maxWeight, 
            minPrice, maxPrice, 
            price, deliveryTime,
            isActive
        } = body

        // Verify zone ownership
        const zone = await prisma.shippingZone.findUnique({
            where: { id: zoneId },
            include: { profile: true }
        })

        if (!zone || zone.profile.storeId !== store.id) {
            return NextResponse.json({ error: "Zone not found" }, { status: 404 })
        }

        const rate = await prisma.shippingRate.create({
            data: {
                zoneId,
                name,
                type,
                minWeight: minWeight ? parseFloat(minWeight) : null,
                maxWeight: maxWeight ? parseFloat(maxWeight) : null,
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                price: parseFloat(price),
                deliveryTime,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(rate)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
