import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    if (!storeId) return NextResponse.json({ error: "Missing storeId" }, { status: 400 })

    const coupons = await prisma.coupon.findMany({
        where: { 
            storeId,
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        orderBy: { discountValue: "desc" }
    })
    return NextResponse.json(coupons)
}
