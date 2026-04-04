import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const requestId = params.id
        
        const loginRequest = await prisma.loginRequest.findUnique({
            where: { id: requestId },
            select: { status: true }
        })

        if (!loginRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        return NextResponse.json({ status: loginRequest.status })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
