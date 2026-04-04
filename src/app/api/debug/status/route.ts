import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, name: true }
        })
        
        const stores = await prisma.store.findMany({
            select: { id: true, name: true, slug: true, ownerId: true }
        })

        const currentUserId = (session?.user as any)?.id
        const myStore = stores.find(s => s.ownerId === currentUserId)

        return NextResponse.json({
            currentUser: session?.user ? { ...session.user, id: currentUserId } : null,
            myStore,
            allUsers: users,
            allStores: stores
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
