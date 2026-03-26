import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetailClient from "./ProductDetailClient"

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ slug: string; productSlug: string }>
}) {
    const { slug, productSlug } = await params

    const store = await prisma.store.findUnique({ where: { slug: slug.toLowerCase() } })
    if (!store || !store.isActive || store.isPlatformDisabled || store.isStorefrontDisabled) notFound()

    const productData = await prisma.product.findFirst({
        where: { storeId: store.id, slug: productSlug, isActive: true },
        include: {
            category: true,
            reviews: {
                where: { isApproved: true },
                include: { user: { select: { name: true, image: true } } },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!productData) notFound()

    // Fetch related products (same category, excluding current product)
    let relatedProductsData = productData.categoryId ? await prisma.product.findMany({
        where: {
            storeId: store.id,
            categoryId: productData.categoryId,
            id: { not: productData.id },
            isActive: true
        },
        take: 4,
        orderBy: { createdAt: 'desc' }
    }) : []

    // Fallback: If no related products found in category, fetch latest from store
    if (relatedProductsData.length === 0) {
        relatedProductsData = await prisma.product.findMany({
            where: {
                storeId: store.id,
                id: { not: productData.id },
                isActive: true
            },
            take: 4,
            orderBy: { createdAt: 'desc' }
        })
    }

    // Serialize to handle Date/Decimal types from Prisma
    const product = JSON.parse(JSON.stringify(productData))
    const relatedProducts = JSON.parse(JSON.stringify(relatedProductsData))

    return (
        <ProductDetailClient 
            product={product} 
            relatedProducts={relatedProducts}
            slug={slug} 
            currency={store.currency} 
        />
    )
}
