import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import CatalogClient from "./CatalogClient"

export const dynamic = "force-dynamic"

export default async function CatalogPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ q?: string }>
}) {
    const { slug } = await params
    const { q: searchQuery = "" } = await searchParams

    const store = await prisma.store.findUnique({
        where: { slug: slug.toLowerCase() },
    })

    if (!store || !store.isActive || store.isPlatformDisabled || store.isStorefrontDisabled) notFound()

    const [productsData, categoriesData] = await Promise.all([
        prisma.product.findMany({
            where: {
                storeId: store.id,
                isActive: true,
                ...(searchQuery ? {
                    OR: [
                        { name: { contains: searchQuery } },
                        { description: { contains: searchQuery } },
                    ]
                } : {})
            },
            include: {
                reviews: {
                    where: { isApproved: true }
                }
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.category.findMany({
            where: { storeId: store.id }
        })
    ])

    // Serialize products and categories to handle Date/Decimal types from Prisma
    const products = JSON.parse(JSON.stringify(productsData))
    const categories = JSON.parse(JSON.stringify(categoriesData))

    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-zinc-400">Loading catalog...</div>}>
            <CatalogClient 
                products={products} 
                categories={categories}
                slug={slug} 
                currency={store.currency} 
            />
        </Suspense>
    )
}
