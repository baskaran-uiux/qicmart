import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"
import { appendFileSync } from "fs"
import { join } from "path"
import { supabase } from "@/lib/supabase"
import sharp from "sharp"

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
    const storeObj = await getStoreForDashboard(targetUserId, dashboardType)
    if (!storeObj) return NextResponse.json([])

    // Fetch products and categories for this specific store
    const [products, categories, libraryMedia] = await Promise.all([
        prisma.product.findMany({
            where: { storeId: storeObj.id },
            select: { id: true, images: true, name: true, updatedAt: true }
        }),
        prisma.category.findMany({
            where: { storeId: storeObj.id },
            select: { id: true, image: true, name: true, updatedAt: true }
        }),
        prisma.mediaLibrary.findMany({
            where: { storeId: storeObj.id },
            orderBy: { createdAt: "desc" }
        })
    ])

    // 2. Aggregate other media sources
    const seenUrls = new Set(libraryMedia.map(m => m.url))
    const aggregatedMedia: any[] = [...libraryMedia]

    const addUniqueMedia = (url: string, name: string, type: string = "IMAGE", date?: Date, customId?: string) => {
        if (!url || seenUrls.has(url) || !url.startsWith("http")) return;
        seenUrls.add(url);
        aggregatedMedia.push({
            id: customId || `v-${Buffer.from(url).toString('base64').substring(0, 16)}`,
            url,
            name,
            type,
            size: 0,
            createdAt: date || new Date(),
            isVirtual: true
        })
    }

    // Add Store Branding
    if (storeObj.logo) addUniqueMedia(storeObj.logo, "Store Logo", "IMAGE", storeObj.updatedAt)
    if (storeObj.favicon) addUniqueMedia(storeObj.favicon, "Store Favicon", "IMAGE", storeObj.updatedAt)
    if (storeObj.banner) addUniqueMedia(storeObj.banner, "Store Banner", "IMAGE", storeObj.updatedAt)

    // Add Product Images
    products.forEach(product => {
        try {
            const images = JSON.parse((product as any).images || "[]")
            if (Array.isArray(images)) {
                images.forEach((img: string, idx: number) => {
                    const virtualId = `v-prod:${(product as any).id}:${idx}:${Buffer.from(img).toString('base64').substring(0, 8)}`
                    addUniqueMedia(img, `${product.name} (${idx + 1})`, "IMAGE", product.updatedAt, virtualId)
                })
            }
        } catch (e) {
            if (typeof (product as any).images === 'string' && (product as any).images.startsWith('http')) {
                const img = (product as any).images
                const virtualId = `v-prod:${(product as any).id}:0:${Buffer.from(img).toString('base64').substring(0, 8)}`
                addUniqueMedia(img, product.name, "IMAGE", product.updatedAt, virtualId)
            }
        }
    })

    // Add Category Images
    categories.forEach(cat => {
        if (cat.image) {
            const virtualId = `v-cat:${(cat as any).id}`
            addUniqueMedia(cat.image, cat.name, "IMAGE", cat.updatedAt, virtualId)
        }
    })

    aggregatedMedia.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(aggregatedMedia)
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
    const store = await getStoreForDashboard(targetUserId, dashboardType)

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
            const buffer = Buffer.from(bytes) as any

            // Better filename sanitization
            const cleanFileName = file.name.toLowerCase()
                .replace(/[^a-z0-9.]/g, "-")
                .replace(/-+/g, "-")
            
            if (!supabase) {
                const missingVars = []
                if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("SUPABASE_URL")
                if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")
                
                const errorMsg = missingVars.length > 0 
                  ? `Supabase Storage is not configured. Missing: ${missingVars.join(", ")}. Please add these to your environment variables.`
                  : "Supabase Storage is not configured correctly. One or more environment variables may be using placeholder values (e.g., 'your-service-role-key-here'). Please check your .env file or Vercel settings."

                console.error(errorMsg)
                throw new Error(errorMsg)
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

            let uploadBuffer = buffer
            let uploadFileName = fileName
            let uploadType = file.type

            // IMAGE OPTIMIZATION (sharp)
            if (file.type.startsWith("image/") && !file.type.includes("svg")) {
                try {
                    console.log(`Optimizing image: ${file.name} to WebP...`)
                    const optimizedBuffer = await sharp(buffer)
                        .resize({ width: 1920, withoutEnlargement: true }) // Responsive limit
                        .webp({ quality: 80 })
                        .toBuffer()
                    
                    uploadBuffer = optimizedBuffer
                    uploadType = "image/webp"
                    
                    // Change extension to .webp
                    const nameWithoutExt = cleanFileName.replace(/\.[^/.]+$/, "")
                    uploadFileName = `${Date.now()}-${nameWithoutExt}.webp`
                    
                    console.log(`Optimization success! Original: ${buffer.length}, New: ${optimizedBuffer.length}`)
                } catch (optimError) {
                    console.warn("Sharp optimization failed, falling back to original:", optimError)
                    // Keep original buffer/filename if sharp fails
                }
            }

            // Upload to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('media')
                .upload(uploadFileName, uploadBuffer, {
                    contentType: uploadType,
                    upsert: true
                })

            if (uploadError) {
                console.error("Supabase upload error:", uploadError)
                throw new Error(`Supabase Storage Error: ${uploadError.message}`)
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(uploadFileName)

            url = publicUrl
            name = uploadFileName.split('-').slice(1).join('-') // Clean name for DB
            type = uploadType.startsWith("video/") ? "VIDEO" : "IMAGE"
            size = uploadBuffer.length
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

    const dashboardType = searchParams.get("dashboardType") || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

    // Handle Virtual Deletion
    if (id.startsWith("v-")) {
        const parts = id.split(":")
        const type = parts[0] // v-prod or v-cat
        
        if (type === "v-prod") {
            const productId = parts[1]
            const index = parseInt(parts[2])
            
            const product = await prisma.product.findUnique({
                where: { id: productId, storeId: store.id }
            })
            
            if (product) {
                let images = []
                try {
                    images = JSON.parse(product.images || "[]")
                } catch (e) {
                    if (typeof product.images === 'string' && product.images.startsWith('http')) {
                        images = [product.images]
                    }
                }
                
                if (Array.isArray(images)) {
                    images.splice(index, 1)
                    await prisma.product.update({
                        where: { id: productId },
                        data: { images: JSON.stringify(images) }
                    })
                    return NextResponse.json({ ok: true, source: "product" })
                }
            }
        } else if (type === "v-cat") {
            const catId = parts[1]
            await prisma.category.update({
                where: { id: catId, storeId: store.id },
                data: { image: null }
            })
            return NextResponse.json({ ok: true, source: "category" })
        }
        
        return NextResponse.json({ error: "Virtual source not found or could not be updated" }, { status: 404 })
    }

    // Handle Regular MediaLibrary Deletion
    const media = await prisma.mediaLibrary.findFirst({
        where: { id, storeId: store.id }
    })

    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.mediaLibrary.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
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

    const body = await req.json()
    const { action } = body

    if (action === "bulk-optimize") {
        try {
            const mediaList = await prisma.mediaLibrary.findMany({
                where: { 
                    storeId: store.id,
                    type: "IMAGE",
                    url: { not: { contains: ".webp" } } 
                }
            })

            console.log(`Bulk optimizing ${mediaList.length} images for store ${store.id}`)
            let optimizedCount = 0

            for (const media of mediaList) {
                try {
                    // 1. Download original
                    const res = await fetch(media.url)
                    if (!res.ok) continue
                    const buffer = Buffer.from(await res.arrayBuffer())

                    // 2. Optimize
                    const optimizedBuffer = await sharp(buffer)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer()

                    // 3. Upload to Supabase (Replace filename)
                    const oldFileName = media.url.split('/').pop()?.split('?')[0] || `optimized-${Date.now()}.webp`
                    const nameWithoutExt = oldFileName.replace(/\.[^/.]+$/, "")
                    const newFileName = `${Date.now()}-${nameWithoutExt}.webp`

                    const { error: uploadError } = await supabase.storage
                        .from('media')
                        .upload(newFileName, optimizedBuffer, {
                            contentType: "image/webp",
                            upsert: true
                        })

                    if (uploadError) throw new Error(uploadError.message)

                    // 4. Get New URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('media')
                        .getPublicUrl(newFileName)

                    // 5. Update DB
                    await prisma.mediaLibrary.update({
                        where: { id: media.id },
                        data: {
                            url: publicUrl,
                            size: optimizedBuffer.length,
                            name: newFileName.split('-').slice(1).join('-')
                        }
                    })

                    // 6. Cleanup old file (Since user agreed to REPLACE)
                    try {
                        if (oldFileName && !oldFileName.endsWith('.webp')) {
                            await supabase.storage.from('media').remove([oldFileName])
                        }
                    } catch (e) {
                         console.warn(`Failed to remove old file ${oldFileName}:`, e)
                    }

                    optimizedCount++
                } catch (err) {
                    console.error(`Failed to optimize media ${media.id}:`, err)
                }
            }

            return NextResponse.json({ success: true, count: optimizedCount })
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
