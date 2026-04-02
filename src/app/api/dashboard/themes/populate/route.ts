import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"

const DEMO_DATA: Record<string, any> = {
    dress: {
        categories: [
            { name: "Elegant Collection", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800" },
            { name: "Summer Essentials", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800" }
        ],
        products: [
            { name: "Floral Silk Maxi", price: 2499, description: "Elegant silk dress with hand-painted floral patterns.", images: ["https://images.unsplash.com/photo-1539008835279-43469393d161?q=80&w=800"] },
            { name: "Classic Evening Gown", price: 4500, description: "A timeless masterpiece for your most special nights.", images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800"] },
            { name: "Linen Summer Set", price: 1899, description: "Breathable linen shirt and trousers for the perfect beach look.", images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800"] },
            { name: "Velvet Cocktail Dress", price: 3200, description: "Rich velvet texture with a modern tailored fit.", images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800"] }
        ]
    },
    general: {
        categories: [
            { name: "New Arrivals", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800" },
            { name: "Essentials", image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=800" }
        ],
        products: [
            { name: "Classic Cotton Tee", price: 999, description: "Premium cotton blend for ultimate comfort.", images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800"] },
            { name: "Everyday Denim", price: 2999, description: "Durable denim with a modern relaxed fit.", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800"] },
            { name: "Tech Backpack", price: 1500, description: "Spacious and modern design for your daily essentials.", images: ["https://images.unsplash.com/photo-1553062407-98eeb94c6a62?q=80&w=800"] }
        ]
    },
    sports: {
        categories: [
            { name: "Performance Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800" },
            { name: "Elite Training Gear", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800" },
            { name: "Active Lifestyle", image: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=800" }
        ],
        products: [
            { name: "Ultra-Speed Running Pro", price: 7999, description: "Aerodynamic design with responsive foam for professional athletes.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800"] },
            { name: "Compression Power Vest", price: 2499, description: "Advanced moisture-wicking fabric for intense training sessions.", images: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"] },
            { name: "Pro-Series Dumbbell Set", price: 12999, description: "High-grade steel weights with ergonomic non-slip grip.", images: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=800"] },
            { name: "Hybrid Smart Sports Watch", price: 15999, description: "Real-time performance tracking with 20+ sports modes.", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"] }
        ]
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { category, ownerId } = await req.json()
        let targetUserId = (session.user as any).id
        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') targetUserId = ownerId

        const store = await getStoreForDashboard(targetUserId, "1")
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const data = DEMO_DATA[category]
        if (!data) return NextResponse.json({ error: "Invalid theme type" }, { status: 400 })

        // 1. Create Categories
        console.log(`Populating demo for: ${category} in store: ${store.slug}`)
        const createdCategories = []
        for (const cat of data.categories) {
            const newCat = await prisma.category.create({
                data: {
                    name: cat.name,
                    slug: `${cat.name.toLowerCase().replace(/ /g, "-")}-${Math.floor(Math.random() * 1000)}`,
                    image: cat.image,
                    storeId: store.id
                }
            })
            createdCategories.push(newCat)
        }

        // 2. Create Products
        for (let i = 0; i < data.products.length; i++) {
            const prod = data.products[i]
            const catId = createdCategories[i % createdCategories.length].id
            
            await prisma.product.create({
                data: {
                    name: prod.name,
                    slug: `${prod.name.toLowerCase().replace(/ /g, "-")}-${Math.floor(Math.random() * 1000)}`,
                    price: prod.price,
                    description: prod.description,
                    images: JSON.stringify(prod.images),
                    storeId: store.id,
                    categoryId: catId,
                    stock: 50,
                    isActive: true,
                    isBestSeller: i === 0 || i === 2
                }
            })
        }

        return NextResponse.json({ ok: true, message: "Demo data populated successfully" })
    } catch (error: any) {
        console.error("Demo Population Error:", error)
        return NextResponse.json({ error: error.message || "Failed to populate demo data" }, { status: 500 })
    }
}
