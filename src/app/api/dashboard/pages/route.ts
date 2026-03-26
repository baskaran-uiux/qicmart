import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId") || (session.user as any).id

        const store = await prisma.store.findFirst({
            where: { ownerId }
        })

        if (!store) return new NextResponse("Store not found", { status: 404 })

        const pages = await prisma.customPage.findMany({
            where: { storeId: store.id },
            orderBy: { updatedAt: "desc" }
        })

        return NextResponse.json(pages)
    } catch (error) {
        console.error("[PAGES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { title, slug, content, isPublished, template, seoTitle, seoDescription } = body

        if (!title || !slug) return new NextResponse("Title and Slug are required", { status: 400 })

        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId") || (session.user as any).id

        const store = await prisma.store.findFirst({
            where: { ownerId }
        })

        if (!store) return new NextResponse("Store not found", { status: 404 })

        const page = await prisma.customPage.create({
            data: {
                storeId: store.id,
                title,
                slug,
                content,
                isPublished: isPublished ?? true,
                template: template || "default",
                seoTitle,
                seoDescription
            }
        })

        return NextResponse.json(page)
    } catch (error: any) {
        console.error("[PAGES_POST]", error)
        if (error.code === "P2002") {
            return new NextResponse("Slug already exists", { status: 400 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}
