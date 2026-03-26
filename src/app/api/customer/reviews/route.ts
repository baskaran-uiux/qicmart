import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = (session.user as any).id

        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        name: true,
                        slug: true,
                        images: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error("Reviews Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }
}
