import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const customerId = formData.get("customerId") as string

        console.log("Upload Request:", { customerId, fileName: file?.name, fileSize: file?.size })

        if (!file || !customerId) {
            console.error("Missing file or customerId")
            return NextResponse.json({ error: "Missing file or customerId" }, { status: 400 })
        }

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: { user: true }
        })

        if (!customer || !customer.userId) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 })
        }

        // 1. Save file locally (simplified for this app)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const relativePath = `/uploads/profiles/${customer.userId}-${Date.now()}-${file.name}`
        const absolutePath = join(process.cwd(), "public", relativePath)

        // Ensure directory exists
        await mkdir(join(process.cwd(), "public", "uploads", "profiles"), { recursive: true })
        await writeFile(absolutePath, buffer)

        // 2. Update User image
        await prisma.user.update({
            where: { id: customer.userId },
            data: { image: relativePath }
        })

        return NextResponse.json({ success: true, imageUrl: relativePath })
    } catch (error) {
        console.error("Profile Upload Error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
