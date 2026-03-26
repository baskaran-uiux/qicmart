import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")?.trim()
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: targetUserId },
        select: {
            id: true,
            slug: true,
            customDomain: true,
            isDomainVerified: true
        }
    })

    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    return NextResponse.json({
        id: store.id,
        slug: store.slug,
        subdomain: `${store.slug}.qicmart.com`,
        customDomain: store.customDomain,
        isDomainVerified: store.isDomainVerified,
        instructions: {
            cname: "cname.qicmart.com",
            aRecord: "76.76.21.21" // Simulation IP
        }
    })
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { customDomain } = body

        if (!customDomain) return NextResponse.json({ error: "Domain name is required" }, { status: 400 })

        const store = await prisma.store.findFirst({
            where: { ownerId: (session.user as any).id }
        })

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const updated = await prisma.store.update({
            where: { id: store.id },
            data: { 
                customDomain: customDomain.toLowerCase(),
                isDomainVerified: false // Reset verification on domain change
            }
        })

        return NextResponse.json({ ok: true, store: updated })
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: "This domain is already in use by another store" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update domain" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const store = await prisma.store.findFirst({
            where: { ownerId: (session.user as any).id }
        })

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        await prisma.store.update({
            where: { id: store.id },
            data: { customDomain: null, isDomainVerified: false }
        })

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to remove domain" }, { status: 500 })
    }
}
