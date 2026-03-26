import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const slug = searchParams.get("slug")

        if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 })

        const store = await prisma.store.findUnique({
            where: { slug: slug.toLowerCase() },
            select: { id: true }
        })

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const pages = await prisma.customPage.findMany({
            where: { 
                storeId: store.id,
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                slug: true
            },
            orderBy: { createdAt: "asc" }
        })

        return NextResponse.json(pages)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
