import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, email: true, phone: true, image: true, address: true, area: true, landmark: true, city: true, state: true, pincode: true }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const body = await req.json()

    try {
        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                image: body.image,
                address: body.address,
                area: body.area,
                landmark: body.landmark,
                city: body.city,
                state: body.state,
                pincode: body.pincode,
            },
            select: { id: true, name: true, email: true, phone: true, image: true, address: true, area: true, landmark: true, city: true, state: true, pincode: true }
        })

        return NextResponse.json({ ok: true, user: updatedUser })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }
}
