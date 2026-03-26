import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")

        // Security: Ensure the user is the owner or the dashboard belongs to them
        if (ownerId && (session.user as any).role !== "SUPER_ADMIN" && (session.user as any).id !== ownerId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const store = await prisma.store.findFirst({
            where: { ownerId: ownerId || (session.user as any).id }
        })

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const reviews = await prisma.review.findMany({
            where: { storeId: store.id },
            include: {
                product: { select: { name: true, slug: true } },
                user: { select: { name: true, email: true, image: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(reviews)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { id, isApproved } = body

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        // Check ownership
        const review = await prisma.review.findUnique({
            where: { id },
            include: { store: true }
        })

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 })
        if ((session.user as any).role !== "SUPER_ADMIN" && review.store.ownerId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.review.update({
            where: { id },
            data: { isApproved }
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        // Check ownership
        const review = await prisma.review.findUnique({
            where: { id },
            include: { store: true }
        })

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 })
        if ((session.user as any).role !== "SUPER_ADMIN" && review.store.ownerId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.review.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
