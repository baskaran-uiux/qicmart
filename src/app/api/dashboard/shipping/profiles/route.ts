import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const profiles = await prisma.shippingProfile.findMany({
            where: { storeId: store.id },
            include: {
                zones: {
                    include: {
                        rates: true
                    }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(profiles)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { name } = body

        const profile = await prisma.shippingProfile.create({
            data: {
                storeId: store.id,
                name,
                isDefault: false
            }
        })

        return NextResponse.json(profile)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
