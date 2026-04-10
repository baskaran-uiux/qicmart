import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Temporary: Fix the test user's role and assign stores to them
export async function GET() {
    const store = await prisma.store.findUnique({
        where: { slug: "demo" },
        select: {
            id: true,
            name: true,
            products: {
                select: {
                    id: true,
                    name: true,
                    images: true,
                    updatedAt: true
                },
                orderBy: { updatedAt: 'desc' }
            }
        }
    })

    if (!store) return NextResponse.json({ error: "Demo store not found" })

    return NextResponse.json({ 
        storeName: store.name,
        productsCount: store.products.length,
        products: store.products.map(p => ({
            id: p.id,
            name: p.name,
            imagesRaw: p.images,
            imagesParsed: (typeof p.images === 'string' ? JSON.parse(p.images) : p.images),
            updatedAt: p.updatedAt
        }))
    })
}
