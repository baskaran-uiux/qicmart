import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

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

    const product = await prisma.product.create({
        data: {
            ...body,
            isBestSeller: body.isBestSeller || false,
            storeId: store.id,
            slug: body.name.toLowerCase()
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

    const { id, ...data } = body
    
    if (data.name !== undefined && !data.name.trim()) {
        return NextResponse.json({ error: "Product name cannot be empty" }, { status: 400 })
    }

    // Forcefully handle isBestSeller if present, bypass Prisma client types if necessary
    if (data.isBestSeller !== undefined) {
        try {
            await (prisma as any).$executeRawUnsafe(
                `UPDATE Product SET isBestSeller = ${data.isBestSeller ? 1 : 0} WHERE id = '${id}' AND storeId = '${store.id}'`
            )
        } catch (e) {
            console.error("Raw update failed, trying regular update:", e)
        }
    }

    const product = await prisma.product.update({ 
        where: { id, storeId: store.id }, 
        data: (() => {
            const { isBestSeller, ...rest } = data;
            return rest;
        })() 
    })
    return NextResponse.json({ ...product, isBestSeller: data.isBestSeller ?? (product as any).isBestSeller })
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
