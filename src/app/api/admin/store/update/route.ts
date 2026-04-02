
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { storeId, isStorefrontDisabled, isAdminPanelDisabled, planName, billingCycle, expiryDate } = body

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
        }

        const updateData: any = {}
        if (typeof isStorefrontDisabled === 'boolean') updateData.isStorefrontDisabled = isStorefrontDisabled
        if (typeof isAdminPanelDisabled === 'boolean') updateData.isAdminPanelDisabled = isAdminPanelDisabled

        // Handle master switch as well for backward compatibility if needed
        if (updateData.isAdminPanelDisabled) {
            updateData.isPlatformDisabled = true
        } else if (updateData.isStorefrontDisabled === false && updateData.isAdminPanelDisabled === false) {
             updateData.isPlatformDisabled = false
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: updateData
        })

        // Also update the owner's platform access if admin panel is disabled
        if (store.ownerId && typeof isAdminPanelDisabled === 'boolean') {
            await prisma.user.update({
                where: { id: store.ownerId },
                data: { isPlatformDisabled: isAdminPanelDisabled }
            })
        }

        // Handle Subscription Updates (Plan, Cycle, Expiry)
        if (planName || billingCycle || expiryDate) {
            console.log(`Subscription update requested for store ${storeId}: Plan=${planName}, Cycle=${billingCycle}, Expiry=${expiryDate}`)
            
            // Find existing sub first
            const existingSub = await prisma.subscription.findUnique({
                where: { storeId: storeId }
            })

            let planId = existingSub?.planId

            if (planName) {
                const plan = await prisma.subscriptionPlan.findFirst({
                    where: { name: planName }
                })
                if (plan) planId = plan.id
            }

            const subUpdateData: any = {
                status: "ACTIVE"
            }
            if (planId) subUpdateData.planId = planId
            if (billingCycle) subUpdateData.billingCycle = billingCycle.toUpperCase()
            if (expiryDate) subUpdateData.currentPeriodEnd = new Date(expiryDate)

            if (existingSub) {
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: subUpdateData
                })
                console.log(`Updated existing subscription for store ${storeId}`)
            } else if (planId) {
                // If no sub exists, create one with defaults
                await prisma.subscription.create({
                    data: {
                        storeId: storeId,
                        planId: planId,
                        status: "ACTIVE",
                        billingCycle: subUpdateData.billingCycle || "MONTHLY",
                        currentPeriodEnd: subUpdateData.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                })
                console.log(`Created new subscription for store ${storeId}`)
            }
        }

        return NextResponse.json({ ok: true, store })
    } catch (error) {
        console.error("Failed to update store status", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const storeId = searchParams.get("id")

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
        }

        // Deleting the store will cascade delete subscriptions, products, categories, etc.
        // based on the onDelete: Cascade in the Prisma schema.
        await prisma.store.delete({
            where: { id: storeId }
        })

        return NextResponse.json({ ok: true, message: "Store deleted successfully" })
    } catch (error: any) {
        console.error("Failed to delete store", error)
        return NextResponse.json({ error: error.message || "Failed to delete store" }, { status: 500 })
    }
}
