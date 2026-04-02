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
        const { profileId, name, regions } = body

        // Verify profile ownership
        const profile = await prisma.shippingProfile.findFirst({
            where: { id: profileId, storeId: store.id }
        })

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

        const zone = await prisma.shippingZone.create({
            data: {
                profileId,
                name,
                regions: regions || []
            }
        })

        return NextResponse.json(zone)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
