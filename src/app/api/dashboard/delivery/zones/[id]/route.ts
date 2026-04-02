import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const resolvedParams = await params
        const id = resolvedParams.id

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        // Verify zone belongs to store
        const zone = await prisma.shippingZone.findFirst({
            where: { id, storeId: store.id }
        })

        if (!zone) return NextResponse.json({ error: "Zone not found" }, { status: 404 })

        await prisma.shippingZone.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
