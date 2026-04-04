import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const userId = (session.user as any).id
        
        const activeRequests = await prisma.loginRequest.findMany({
            where: { 
                userId: userId,
                status: "PENDING"
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ requests: activeRequests })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
