import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"
import { appendFileSync } from "fs"
import { join } from "path"
import { supabase } from "@/lib/supabase"

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
    let store: any = await getStoreForDashboard(targetUserId, dashboardType)
    
    // Fallback for Super Admin without impersonation
    if (!store && (session.user as any).role === 'SUPER_ADMIN') {
        store = await prisma.store.findFirst()
    }

    if (!store) return NextResponse.json([])

    const media = await prisma.mediaLibrary.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(media)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")
    let targetUserId = (session.user as any).id

    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    const dashboardType = searchParams.get("dashboardType") || "1"
    let store: any = await getStoreForDashboard(targetUserId, dashboardType)

    // Fallback for Super Admin without impersonation
    if (!store && (session.user as any).role === 'SUPER_ADMIN') {
        store = await prisma.store.findFirst()
    }

    if (!store) {
        console.error("Upload error: Store not found for user", targetUserId)
        return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File | null
        const urlParam = formData.get("url") as string | null
        const nameParam = formData.get("name") as string | null

        let url = ""
        let name = ""
        let type = "IMAGE"
        let size = 0

        if (file) {
            console.log(`Uploading file to Supabase: ${file.name} (${file.size} bytes)`)
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Better filename sanitization
            const cleanFileName = file.name.toLowerCase()
                .replace(/[^a-z0-9.]/g, "-")
                .replace(/-+/g, "-")
            
            if (!supabase) {
                console.error("Supabase client not initialized. Check your credentials.")
                throw new Error("Supabase Storage is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment variables.")
            }

            const fileName = `${Date.now()}-${cleanFileName}`

            // Ensure bucket exists (best effort)
            try {
                const { data: buckets } = await supabase.storage.listBuckets()
                if (!buckets?.find((b: any) => b.name === 'media')) {
                    console.log("Creating 'media' bucket...")
                    await supabase.storage.createBucket('media', { public: true })
                }
            } catch (e) {
                console.warn("Could not verify/create bucket:", e)
            }

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, buffer, {
                    contentType: file.type,
                    upsert: true
                })

            if (uploadError) {
                console.error("Supabase upload error:", uploadError)
                throw new Error(`Supabase Storage Error: ${uploadError.message}`)
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(fileName)

            url = publicUrl
            name = file.name
            type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE"
            size = file.size
        } else if (urlParam) {
            console.log(`Saving external URL: ${urlParam}`)
            url = urlParam
            name = nameParam || url.split("/").pop() || "external-media"
            type = "IMAGE"
        } else {
            return NextResponse.json({ error: "No file or URL provided" }, { status: 400 })
        }

        log(`[Media POST] Creating library entry for store ${store.id}`)
        const media = await prisma.mediaLibrary.create({
            data: {
                storeId: store.id,
                url,
                key: `${Date.now()}-${name.replace(/\s+/g, "-")}`,
                name,
                type,
                size,
            }
        })

        log(`[Media POST] Success: ${media.id}`)
        console.log("Media library entry created:", media.id)
        return NextResponse.json(media)
    } catch (error: any) {
        log(`[Media POST] Error: ${error.message}`)
        console.error("Upload process failed:", error)
        return NextResponse.json({ 
            error: "Failed to upload", 
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

    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    // Verify ownership
    const dashboardType = searchParams.get("dashboardType") || "1"
    let store: any = await getStoreForDashboard(targetUserId, dashboardType)

    // Fallback for Super Admin without impersonation
    if (!store && (session.user as any).role === 'SUPER_ADMIN') {
        store = await prisma.store.findFirst()
    }

    const media = await prisma.mediaLibrary.findFirst({
        where: { id, storeId: store?.id }
    })

    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.mediaLibrary.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
