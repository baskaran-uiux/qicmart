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
        const ownerIdParam = searchParams.get("ownerId")
        
        let targetUserId = (session.user as any).id
        if (ownerIdParam && (session.user as any).role === "SUPER_ADMIN") {
            targetUserId = ownerIdParam
        }

        const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const zones = await prisma.shippingZone.findMany({
            where: { storeId: store.id },
            include: {
                ShippingLocation: true,
                ShippingMethod: true
            },
            orderBy: { createdAt: "asc" }
        })

        return NextResponse.json(zones)
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
        const ownerIdParam = searchParams.get("ownerId")
        
        let targetUserId = (session.user as any).id
        if (ownerIdParam && (session.user as any).role === "SUPER_ADMIN") {
            targetUserId = ownerIdParam
        }

        const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { id, name, isActive, locations, methods } = body

        if (id) {
            // Update Existing Zone
            const zone = await prisma.shippingZone.update({
                where: { id },
                data: {
                    name,
                    isActive: isActive ?? true,
                    ShippingLocation: {
                        deleteMany: {},
                        create: locations.map((loc: any) => ({
                            type: loc.type,
                            value: loc.value
                        }))
                    },
                    ShippingMethod: {
                        deleteMany: {},
                        create: methods.map((met: any) => ({
                            name: met.name,
                            type: met.type,
                            price: parseFloat(met.price || 0),
                            minOrderValue: (met.minOrderValue === null || met.minOrderValue === undefined) ? null : parseFloat(met.minOrderValue),
                            isActive: met.isActive ?? true,
                            deliveryTime: met.deliveryTime,
                            updatedAt: new Date()
                        }))
                    }
                }
            })
            return NextResponse.json(zone)
        } else {
            // Create New Zone
            const zone = await prisma.shippingZone.create({
                data: {
                    storeId: store.id,
                    name,
                    isActive: isActive ?? true,
                    ShippingLocation: {
                        create: locations.map((loc: any) => ({
                            type: loc.type,
                            value: loc.value
                        }))
                    },
                    ShippingMethod: {
                        create: methods.map((met: any) => ({
                            name: met.name,
                            type: met.type,
                            price: parseFloat(met.price || 0),
                            minOrderValue: (met.minOrderValue === null || met.minOrderValue === undefined) ? null : parseFloat(met.minOrderValue),
                            isActive: met.isActive ?? true,
                            deliveryTime: met.deliveryTime,
                            updatedAt: new Date()
                        }))
                    }
                }
            })
            return NextResponse.json(zone)
        }
    } catch (error: any) {
        console.error("Zone save error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
