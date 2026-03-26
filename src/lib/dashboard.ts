import { prisma } from "@/lib/prisma"
import { appendFileSync } from "fs"
import { join } from "path"

const log = (msg: string) => {
    try {
        appendFileSync(join(process.cwd(), "tmp", "debug.log"), `${new Date().toISOString()} - ${msg}\n`)
    } catch (e) {}
}

/**
 * Fetches the correct store for a user based on the dashboard type.
 * Type "1" returns the first store (oldest), Type "2" returns the second store.
 */
export async function getStoreForDashboard(userId: string, dashboardType: string = "1") {
    log(`[getStoreForDashboard] userId: ${userId}, type: ${dashboardType}`)
    const stores = await prisma.store.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "asc" },
        include: {
            subscription: {
                include: { plan: true }
            },
            owner: {
                select: { image: true }
            }
        }
    })

    log(`[getStoreForDashboard] Found ${stores.length} stores for user ${userId}`)
    
    // Self-healing: If user is an Owner but has no stores (orphaned account), create a default one
    if (stores.length === 0) {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.role === 'STORE_OWNER') {
            log(`[getStoreForDashboard] Self-healing: Creating missing store for owner ${userId}`)
            const plan = await prisma.subscriptionPlan.findFirst()
            if (plan) {
                const newStore = await prisma.store.create({
                    data: {
                        name: `${user.name || user.email?.split('@')[0] || 'My'} Store`,
                        slug: `store-${userId.slice(-5)}-${Date.now().toString().slice(-4)}`,
                        ownerId: userId,
                        subscription: {
                            create: {
                                planId: plan.id,
                                status: "ACTIVE",
                                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    include: {
                        subscription: {
                            include: { plan: true }
                        },
                        owner: {
                            select: { image: true }
                        }
                    }
                })
                log(`[getStoreForDashboard] Created store: ${newStore.id}`)
                return newStore
            }
        }
    }

    if (stores.length > 0) {
        log(`[getStoreForDashboard] Store[0] ID: ${stores[0].id}, Name: ${stores[0].name}`)
    }

    if (dashboardType === "2") {
        return stores.length > 1 ? stores[1] : stores[0] // Fallback to first if second doesn't exist
    }

    return stores[0]
}
