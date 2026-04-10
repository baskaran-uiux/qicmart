import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const q = searchParams.get('q')
    const take = parseInt(searchParams.get('take') || '10')

    if (!storeId) {
        return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                storeId,
                isActive: true,
                ...(q ? {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                        { slug: { contains: q, mode: 'insensitive' } },
                        { sku: { contains: q, mode: 'insensitive' } }
                    ]
                } : {})
            },
            take,
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, data: products })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
