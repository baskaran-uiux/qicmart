import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    if (!slug) return NextResponse.json([], { status: 400 })

    const store = await prisma.store.findUnique({ where: { slug: slug }, select: { id: true } })
    if (!store) return NextResponse.json([])

    const categories = await prisma.category.findMany({
        where: { storeId: store.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true }
    })

    return NextResponse.json(categories)
}
