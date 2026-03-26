import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "proofs")
        try { await mkdir(uploadDir, { recursive: true }) } catch (e) { }

        // Sanitize filename
        const cleanFileName = file.name.toLowerCase()
            .replace(/[^a-z0-9.]/g, "-")
            .replace(/-+/g, "-")
        
        const fileName = `${Date.now()}-${cleanFileName}`
        const path = join(uploadDir, fileName)
        
        await writeFile(path, buffer)

        const url = `/uploads/proofs/${fileName}`
        return NextResponse.json({ url })

    } catch (error: any) {
        console.error("Proof Upload Error:", error)
        return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 })
    }
}
