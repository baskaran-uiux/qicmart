import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const slug = searchParams.get("slug")

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 })
        }

        const store = await prisma.store.findUnique({
            where: { slug: slug },
            select: { id: true, name: true }
        })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        return NextResponse.json(store)
    } catch (error) {
        console.error("Store Fetch Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
