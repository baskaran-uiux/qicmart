import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 
        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)
 
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })
 
        const body = await req.json()
        const { 
            name, type, 
            minWeight, maxWeight, 
            minPrice, maxPrice, 
            price, deliveryTime,
            isActive
        } = body
 
        // Verify rate ownership
        const rate = await prisma.shippingRate.findUnique({
            where: { id: id },
            include: { zone: { include: { profile: true } } }
        })
 
        if (!rate || rate.zone.profile.storeId !== store.id) {
            return NextResponse.json({ error: "Rate not found" }, { status: 404 })
        }
 
        const updatedRate = await prisma.shippingRate.update({
            where: { id: id },
            data: {
                name,
                type,
                minWeight: minWeight !== undefined ? (minWeight ? parseFloat(minWeight) : null) : undefined,
                maxWeight: maxWeight !== undefined ? (maxWeight ? parseFloat(maxWeight) : null) : undefined,
                minPrice: minPrice !== undefined ? (minPrice ? parseFloat(minPrice) : null) : undefined,
                maxPrice: maxPrice !== undefined ? (maxPrice ? parseFloat(maxPrice) : null) : undefined,
                price: price !== undefined ? parseFloat(price) : undefined,
                deliveryTime,
                isActive: isActive !== undefined ? isActive : undefined
            }
        })
 
        return NextResponse.json(updatedRate)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
 
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        // Verify rate ownership
        const rate = await prisma.shippingRate.findUnique({
            where: { id: id },
            include: { zone: { include: { profile: true } } }
        })

        if (!rate || rate.zone.profile.storeId !== store.id) {
            return NextResponse.json({ error: "Rate not found" }, { status: 404 })
        }

        await prisma.shippingRate.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
