import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const page = await prisma.customPage.findUnique({
            where: { id }
        })

        if (!page) return new NextResponse("Page not found", { status: 404 })

        return NextResponse.json(page)
    } catch (error) {
        console.error("[PAGE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        const body = await req.json()
        const { title, slug, content, isPublished, template, seoTitle, seoDescription } = body

        const page = await prisma.customPage.update({
            where: { id },
            data: {
                title,
                slug,
                content,
                isPublished,
                template,
                seoTitle,
                seoDescription
            }
        })

        return NextResponse.json(page)
    } catch (error: any) {
        console.error("[PAGE_PUT]", error)
        if (error.code === "P2002") {
            return new NextResponse("Slug already exists", { status: 400 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        await prisma.customPage.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[PAGE_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
