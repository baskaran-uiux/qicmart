import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

    const store = await prisma.store.findUnique({
        where: { slug: slug },
        select: { 
            id: true,
            name: true, 
            description: true, 
            logo: true, 
            banner: true,
            currency: true,
            themeConfig: true,
            slug: true,
            isPlatformDisabled: true,
            isStorefrontDisabled: true,
            upiId: true,
            upiName: true,
            isUpiEnabled: true,
            subscription: {
                select: {
                    plan: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Flatten the plan name for easier use in the frontend
    const planName = store.subscription?.plan?.name || "Free"
    const responseData = {
        ...store,
        planName
    }

    return NextResponse.json(responseData)
}
