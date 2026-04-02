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
        const { name, regions } = body

        // Verify zone ownership
        const zone = await prisma.shippingZone.findUnique({
            where: { id: id },
            include: { profile: true }
        })

        if (!zone || zone.profile.storeId !== store.id) {
            return NextResponse.json({ error: "Zone not found" }, { status: 404 })
        }

        const updatedZone = await prisma.shippingZone.update({
            where: { id: id },
            data: {
                name,
                regions: regions || []
            }
        })

        return NextResponse.json(updatedZone)
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

        // Verify zone ownership
        const zone = await prisma.shippingZone.findUnique({
            where: { id: id },
            include: { profile: true }
        })

        if (!zone || zone.profile.storeId !== store.id) {
            return NextResponse.json({ error: "Zone not found" }, { status: 404 })
        }

        await prisma.shippingZone.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
