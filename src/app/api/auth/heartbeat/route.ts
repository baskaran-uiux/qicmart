import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()
    const userId = (session.user as any).id

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentSessionId: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 1. Check if the session is still valid (not superseded by someone else)
        if (user.currentSessionId !== sessionId) {
            return NextResponse.json({ status: "INVALID_SESSION" })
        }

        // 2. Update lastActiveAt to keep the session "live"
        await prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
        })

        // 3. Optional: Return count of pending login requests
        const pendingCount = await prisma.loginRequest.count({
            where: { 
                userId: userId,
                status: "PENDING"
            }
        })

        return NextResponse.json({ status: "OK", pendingCount })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
