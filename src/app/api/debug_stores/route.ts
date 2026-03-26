
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const stores = await prisma.store.findMany()
        return NextResponse.json({
            count: stores.length,
            stores: stores.map(s => ({ id: s.id, name: s.name, slug: s.slug, ownerId: s.ownerId }))
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message })
    }
}
