import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const targetEmail = searchParams.get("email")

        // Find the user to fix (defaults to current session user)
        const user = await prisma.user.findFirst({
            where: targetEmail ? { email: targetEmail } : { id: (session.user as any).id }
        })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        // Check if already has a store
        const existing = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (existing) {
            return NextResponse.json({
                success: true,
                message: `User already owns store "${existing.name}" (${existing.slug})`,
                user: { id: user.id, email: user.email, role: user.role },
                store: { id: existing.id, name: existing.name, slug: existing.slug }
            })
        }

        // Find any unowned or first store and assign
        const anyStore = await prisma.store.findFirst()
        if (anyStore) {
            await prisma.store.update({ where: { id: anyStore.id }, data: { ownerId: user.id } })
            // Also ensure user has STORE_OWNER role
            await prisma.user.update({ where: { id: user.id }, data: { role: "STORE_OWNER" } })
            return NextResponse.json({ 
                success: true, 
                message: `Assigned store "${anyStore.name}" (${anyStore.slug}) to ${user.email}`,
                store: { id: anyStore.id, name: anyStore.name, slug: anyStore.slug }
            })
        }

        return NextResponse.json({ success: false, message: "No stores found in database" })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
