import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name") || "Beats"
    
    try {
        const product = await prisma.product.findFirst({
            where: { name: { contains: name, mode: "insensitive" } },
            include: { store: true }
        })
        
        return NextResponse.json({
            found: !!product,
            product: product ? {
                id: product.id,
                name: product.name,
                isActive: product.isActive,
                images: product.images,
                storeId: product.storeId,
                storeSlug: product.store.slug,
                updatedAt: product.updatedAt
            } : null
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
