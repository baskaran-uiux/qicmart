import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"
import { appendFileSync } from "fs"
import { join } from "path"

const log = (msg: string) => {
    try {
        appendFileSync(join(process.cwd(), "tmp", "debug.log"), `${new Date().toISOString()} - ${msg}\n`)
    } catch (e) {}
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json([])
    
    const categories = await prisma.category.findMany({
        where: { storeId: store.id },
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } }
    })
    return NextResponse.json(categories)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")
        let targetUserId = (session.user as any).id

        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
            targetUserId = ownerId
        }

        const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { id, name, slug, description, image, parentId } = body
        
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 })
        }

        console.log(`[Category Create] Store: ${store.id}, Name: ${name}`)

        const cat = await prisma.category.create({ 
            data: { 
                storeId: store.id, 
                name: name.trim(), 
                slug, 
                description,
                image,
                parentId: parentId || null
            } 
        })
        return NextResponse.json(cat)
    } catch (error: any) {
        console.error("Category creation failed:", error)
        return NextResponse.json({ 
            error: "Failed to create category", 
            details: error.message 
        }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")
        let targetUserId = (session.user as any).id

        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
            targetUserId = ownerId
        }

        const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { id, name, slug, description, image, parentId } = body
        
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Category name is required" }, { status: 400 })
        }

        console.log(`[Category Update] ID: ${id}, Name: ${name}`)

        const cat = await prisma.category.update({ 
            where: { id, storeId: store.id }, 
            data: { 
                name: name.trim(), 
                slug, 
                description,
                image,
                parentId: parentId || null
            } 
        })
        return NextResponse.json(cat)
    } catch (error: any) {
        console.error("Category update failed:", error)
        return NextResponse.json({ 
            error: "Failed to update category", 
            details: error.message 
        }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    
    await prisma.category.delete({ where: { id, storeId: store.id } })
    return NextResponse.json({ ok: true })
}
