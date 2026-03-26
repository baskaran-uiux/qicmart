import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    
    let targetUserId = (session.user as any).id
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: targetUserId }
    })

    if (!store) return NextResponse.json([])

    const coupons = await prisma.coupon.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(coupons)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    
    let targetUserId = (session.user as any).id
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: targetUserId }
    })

    if (!store) return new NextResponse("Store not found", { status: 404 })

    const { code, discountType, discountValue, usageLimit, minOrderValue, expiresAt } = await req.json()

    const coupon = await prisma.coupon.create({
        data: {
            storeId: store.id,
            code: code.toUpperCase(),
            discountType,
            discountValue: parseFloat(discountValue),
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        }
    })

    return NextResponse.json(coupon)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id, isActive, ...rest } = await req.json()

    const coupon = await prisma.coupon.update({
        where: { id },
        data: {
            isActive,
            ...rest,
            ...(rest.discountValue && { discountValue: parseFloat(rest.discountValue) }),
            ...(rest.usageLimit !== undefined && { usageLimit: rest.usageLimit ? parseInt(rest.usageLimit) : null }),
            ...(rest.minOrderValue !== undefined && { minOrderValue: rest.minOrderValue ? parseFloat(rest.minOrderValue) : null }),
            ...(rest.expiresAt !== undefined && { expiresAt: rest.expiresAt ? new Date(rest.expiresAt) : null }),
        }
    })

    return NextResponse.json(coupon)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await req.json()

    await prisma.coupon.delete({
        where: { id }
    })

    return new NextResponse("Deleted", { status: 200 })
}
