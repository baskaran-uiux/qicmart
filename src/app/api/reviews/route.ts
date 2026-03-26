import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        const userIdFromSession = (session.user as any).id

        const body = await req.json()
        const { productId, storeId, rating, comment, images } = body

        if (!productId || !storeId || rating === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify User exists before linking to avoid FK errors (handles stale sessions)
        let validUserId: string | null = null
        if (userIdFromSession) {
            const userExists = await prisma.user.findUnique({
                where: { id: userIdFromSession },
                select: { id: true }
            })
            if (userExists) {
                validUserId = userIdFromSession
            }
        }

        const review = await prisma.review.create({
            data: {
                productId,
                storeId,
                userId: validUserId,
                rating: parseInt(rating.toString()),
                comment: comment || "",
                images: Array.isArray(images) ? JSON.stringify(images) : (images || "[]"),
                isApproved: true,
            }
        })

        return NextResponse.json({ success: true, data: review })
    } catch (err: any) {
        console.error("Review creation error:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
