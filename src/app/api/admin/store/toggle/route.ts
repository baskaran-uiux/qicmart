import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { storeId, isPlatformDisabled } = body

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { isPlatformDisabled }
        })

        // Also disable the owner to prevent them from accessing dashboard/admin if needed,
        // or just keep it at the store level. Let's disable the owner's platform access too.
        if (store.ownerId) {
            await prisma.user.update({
                where: { id: store.ownerId },
                data: { isPlatformDisabled }
            })
        }

        return NextResponse.json({ ok: true, store })
    } catch (error) {
        console.error("Failed to toggle store status", error)
        return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 })
    }
}
