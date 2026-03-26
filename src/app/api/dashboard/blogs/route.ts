import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    
    let targetUserId = (session.user as any).id
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: targetUserId }
    })

    if (!store) return NextResponse.json([])

    const blogs = await prisma.blog.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(blogs)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    
    let targetUserId = (session.user as any).id
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const store = await prisma.store.findFirst({
        where: { ownerId: targetUserId }
    })

    if (!store) return new NextResponse("Store not found", { status: 404 })

    const { title, content, image, author, published } = await req.json()

    let slug = slugify(title)
    
    // Check for slug uniqueness within the store
    const existing = await prisma.blog.findFirst({
        where: { storeId: store.id, slug }
    })

    if (existing) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`
    }

    const blog = await prisma.blog.create({
        data: {
            storeId: store.id,
            title,
            slug,
            content,
            image,
            author,
            isPublished: published ?? false,
        }
    })

    return NextResponse.json(blog)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id, title, published, ...rest } = await req.json()

    // If title changes, update slug
    let extra: any = {}
    if (title) {
        const blog = await prisma.blog.findUnique({ where: { id } })
        if (blog && blog.title !== title) {
            extra.slug = slugify(title)
        }
    }

    if (published !== undefined) {
        extra.isPublished = published
    }

    const blog = await prisma.blog.update({
        where: { id },
        data: {
            title,
            ...rest,
            ...extra
        }
    })

    return NextResponse.json(blog)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await req.json()

    await prisma.blog.delete({
        where: { id }
    })

    return new NextResponse("Deleted", { status: 200 })
}
