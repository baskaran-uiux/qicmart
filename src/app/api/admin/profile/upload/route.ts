import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const userId = (session.user as any).id

        if (!file || !userId) {
            return NextResponse.json({ error: "Missing file or user" }, { status: 400 })
        }

        // 1. Save file locally
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const relativePath = `/uploads/profiles/admin-${userId}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`
        const absolutePath = join(process.cwd(), "public", relativePath)

        // Ensure directory exists
        await mkdir(join(process.cwd(), "public", "uploads", "profiles"), { recursive: true })
        await writeFile(absolutePath, buffer)

        // 2. Update User image
        await prisma.user.update({
            where: { id: userId },
            data: { image: relativePath }
        })

        return NextResponse.json({ success: true, imageUrl: relativePath })
    } catch (error) {
        console.error("Admin Profile Upload Error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
