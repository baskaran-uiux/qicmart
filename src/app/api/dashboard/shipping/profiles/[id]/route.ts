import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const dashboardType = searchParams.get("dashboardType") || "1"
        const store = await getStoreForDashboard((session.user as any).id, dashboardType)

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const profile = await prisma.shippingProfile.findFirst({
            where: { id: id, storeId: store.id },
            include: {
                zones: {
                    include: {
                        rates: true
                    }
                },
                products: {
                    select: { id: true, name: true, images: true }
                }
            }
        })

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

        return NextResponse.json(profile)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

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
        const { name, productIds } = body

        const profile = await prisma.shippingProfile.update({
            where: { id: id, storeId: store.id },
            data: {
                name,
                products: productIds ? {
                    set: productIds.map((id: string) => ({ id }))
                } : undefined
            },
            include: {
                zones: {
                    include: {
                        rates: true
                    }
                }
            }
        })

        return NextResponse.json(profile)
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

        const profile = await prisma.shippingProfile.findUnique({
            where: { id: id }
        })

        if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        if (profile.isDefault) return NextResponse.json({ error: "Cannot delete default profile" }, { status: 400 })

        // Move products to default profile
        const defaultProfile = await prisma.shippingProfile.findFirst({
            where: { storeId: store.id, isDefault: true }
        })

        if (defaultProfile) {
            await prisma.product.updateMany({
                where: { shippingProfileId: id },
                data: { shippingProfileId: defaultProfile.id }
            })
        }

        await prisma.shippingProfile.delete({
            where: { id: id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
