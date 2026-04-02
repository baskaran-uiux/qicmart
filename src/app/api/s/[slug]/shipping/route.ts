import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const resolvedParams = await params
        const { slug } = resolvedParams

        if (!slug) {
            return NextResponse.json({ error: "Store slug is required" }, { status: 400 })
        }

        // 1. Find the store
        const storeData = await prisma.store.findUnique({
            where: { slug },
            select: { 
                id: true,
                city: true,
                state: true,
                pincode: true,
                country: true,
                currency: true
            }
        })

        if (!storeData) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        // 2. Fetch all active shipping zones with locations and methods
        const zones = await prisma.shippingZone.findMany({
            where: { storeId: storeData.id, isActive: true },
            include: {
                ShippingLocation: true,
                ShippingMethod: {
                    where: { isActive: true },
                    orderBy: { price: 'asc' }
                }
            }
        })

        // 3. Flatten for frontend compatibility
        const methodsForFrontend = zones.flatMap((zone: any) => 
            zone.ShippingMethod.map((method: any) => ({
                id: method.id,
                name: method.name,
                rate: method.price,
                isActive: method.isActive,
                zone: zone.name,
                zoneType: method.type, // FLAT, FREE, PICKUP
                deliveryTime: method.deliveryTime || "3-5 business days",
                minOrderValue: method.minOrderValue,
                regions: zone.ShippingLocation
                    .filter((loc: any) => loc.type === "REGION")
                    .map((loc: any) => loc.value)
            }))
        )

        return NextResponse.json({
            store: {
                city: storeData.city,
                state: storeData.state,
                pincode: storeData.pincode,
                country: storeData.country,
                currency: storeData.currency
            },
            methods: methodsForFrontend
        })
    } catch (error: any) {
        console.error("[SHIPPING_PUBLIC_API_ERROR]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
