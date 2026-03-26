import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        let storeId = searchParams.get("storeId")

        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = (session.user as any).id
        const userEmail = session.user?.email

        const orConditions: any[] = [{ userId: userId }]
        if (userEmail) {
            orConditions.push({ email: userEmail })
        }

        // Fetch orders linked to customers that belong to this user (by ID or Email) and optionally this store
        const orders = await prisma.order.findMany({
            where: {
                storeId: storeId || undefined,
                customer: {
                    OR: orConditions
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                payments: true,
                activities: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error("Orders Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }
}
