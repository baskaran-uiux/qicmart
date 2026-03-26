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
        const userEmail = session.user?.email

        const orConditions: any[] = [{ userId: userId }]
        if (userEmail) {
            orConditions.push({ email: userEmail })
        }

        // 1. Find all customers and their associated stores that have orders for this user
        const stores = await prisma.store.findMany({
            where: {
                customers: {
                    some: {
                        OR: orConditions,
                        orders: {
                            some: {} // At least one order
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                _count: {
                    select: {
                        orders: {
                            where: {
                                customer: {
                                    OR: orConditions
                                }
                            }
                        }
                    }
                }
            }
        })

        // Map to a cleaner format
        const formattedStores = stores.map(store => ({
            id: store.id,
            name: store.name,
            slug: store.slug,
            logo: store.logo,
            description: store.description,
            orderCount: store._count.orders
        }))

        return NextResponse.json(formattedStores)
    } catch (error) {
        console.error("Ordered Stores Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 })
    }
}
