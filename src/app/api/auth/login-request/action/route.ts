import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { requestId, action } = await req.json()
        
        if (!["APPROVED", "REJECTED"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const loginRequest = await prisma.loginRequest.findUnique({
            where: { id: requestId },
        })

        if (!loginRequest || loginRequest.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Request not found" }, { status: 444 })
        }

        await prisma.loginRequest.update({
            where: { id: requestId },
            data: { status: action }
        })

        // If approved, we could optionally invalidate the CURRENT session here,
        // but we'll let the Heartbeat/SessionGuard handle it for a smoother UX.
        
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
