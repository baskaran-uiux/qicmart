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

    const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscribers)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await req.json()

    await prisma.newsletterSubscriber.delete({
        where: { id }
    })

    return new NextResponse("Deleted", { status: 200 })
}
