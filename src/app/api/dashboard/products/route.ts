import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"
import { revalidatePath } from "next/cache"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json([])

    const id = searchParams.get("id")
    if (id) {
        const product = await prisma.product.findUnique({
            where: { id, storeId: store.id },
            include: { category: { select: { name: true } } }
        })
        return NextResponse.json(product)
    }

    const products = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true } } }
    })
    return NextResponse.json(products)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const body = await req.json()
    if (!body.name || !body.name.trim()) {
        return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    // Plan-based Limit Check
    const currentProductCount = await prisma.product.count({ where: { storeId: store.id } })
    const subscription = await prisma.subscription.findUnique({
        where: { storeId: store.id },
        include: { plan: true }
    })

    const maxProducts = subscription?.plan?.maxProducts || 50 // Default to 50 if somehow missing
    if (currentProductCount >= maxProducts) {
        return NextResponse.json({ 
            error: `Product limit reached (${maxProducts}). Please upgrade your plan to add more products.` 
        }, { status: 403 })
    }

    const { imageUrl, gallery, ...productData } = body
    console.log(`[Product POST] Creating product for store ${store.id}`, { name: productData.name })

    const product = await prisma.product.create({
        data: {
            ...productData,
            isBestSeller: productData.isBestSeller || false,
            storeId: store.id,
            slug: productData.name.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
                .replace(/\s+/g, "-")        // Replace spaces with -
                .replace(/-+/g, "-")         // Replace multiple - with single -
                + "-" + Math.random().toString(36).substring(2, 7)
        }
    })
    return NextResponse.json(product)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const body = await req.json()

    // Handle Bulk Update
    if (Array.isArray(body)) {
        const results = await prisma.$transaction(
            body.map((item: any) => 
                prisma.product.update({
                    where: { id: item.id, storeId: store.id },
                    data: { stock: parseInt(String(item.stock)) || 0 }
                })
            )
        )
        return NextResponse.json(results)
    }

    const { id, imageUrl, gallery, ...data } = body
    console.log(`[Product PUT] Updating product ${id} for store ${store.id}`)
    
    if (data.name !== undefined && !data.name.trim()) {
        return NextResponse.json({ error: "Product name cannot be empty" }, { status: 400 })
    }

    const product = await prisma.product.update({ 
        where: { id, storeId: store.id }, 
        data: {
            ...data,
            // Ensure proper types for numeric/boolean fields if they come from loose body
            stock: data.stock !== undefined ? parseInt(String(data.stock)) : undefined,
            price: data.price !== undefined ? parseFloat(String(data.price)) : undefined,
            compareAtPrice: data.compareAtPrice !== undefined ? parseFloat(String(data.compareAtPrice)) : undefined,
        }
    })

    // Instant refresh for store home page
    revalidatePath(`/s/${store.slug}`)
    revalidatePath(`/s/${store.slug}/products`)

    return NextResponse.json(product)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await prisma.product.delete({ where: { id, storeId: store.id } })
    return NextResponse.json({ ok: true })
}
