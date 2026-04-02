import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import HeroBanner from "./HeroBanner"
import HomeProductCard from "./HomeProductCard"
import { formatPrice } from "./utils"
import CategoryCarousel from "./CategoryCarousel"
import StaggeredGrid from "./StaggeredGrid"
import GoogleReviews from "@/components/storefront/GoogleReviews"

export const revalidate = 60 // Revalidate every 60 seconds (ISR)


export default async function StorefrontPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const storeData = await prisma.store.findUnique({
        where: { slug: slug.toLowerCase() },
        select: {
            id: true,
            slug: true,
            isActive: true,
            isPlatformDisabled: true,
            isStorefrontDisabled: true,
            currency: true,
            themeConfig: true,
            subscription: {
                select: {
                    plan: { select: { name: true } }
                }
            },
            products: {
                where: { isActive: true },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    price: true,
                    images: true,
                    isBestSeller: true,
                    stock: true,
                    category: { select: { name: true } },
                    reviews: {
                        where: { isApproved: true },
                        select: { rating: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 20 // Limit products on home page
            },
            categories: {
                select: {
                    id: true,
                    name: true,
                    image: true
                },
                orderBy: { name: "asc" },
            },
        },
    })


    if (!storeData || !storeData.isActive || storeData.isPlatformDisabled || storeData.isStorefrontDisabled) notFound()

    const store = storeData as any // Use as any to skip serialization lag if possible, or mapping below


    const featuredProducts = store.products.slice(0, 8)
    const bestSellers = store.products
        .filter((p: any) => p.isBestSeller)
        .slice(0, 8)
    
    // Fallback if no products are manually marked as best sellers
    const displayBestSellers = bestSellers.length > 0 ? bestSellers : [...store.products]
        .sort((a: any, b: any) => b.stock - a.stock)
        .slice(0, 4)

    // Parse themeConfig for extra settings
    let themeConfig: any = {}
    try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig) } catch (e) {}
    
    const brands = themeConfig.brandCarousel || []
    const banners = themeConfig.banners || []
    const storeTheme = themeConfig.storeTheme || "modern"
    const effectiveLayoutStyle = (storeTheme === 'nextgen' || storeTheme === 'sports') ? storeTheme : (themeConfig.layoutStyle || "default")
    const isSports = storeTheme === 'sports'

    return (
        <div className={isSports ? 'bg-white min-h-screen text-zinc-900' : storeTheme === 'aura' ? 'bg-zinc-950 min-h-screen' : ''}>
            {/* ── Hero Slide Banner ── */}
            <HeroBanner 
                slug={slug} 
                banners={banners}
                layoutStyle={effectiveLayoutStyle}
            />

            {/* ── Brand Logo Carousel ── */}
            {brands.length > 0 && (
                <div className={`${isSports ? 'bg-white border-b border-zinc-100' : storeTheme === 'aura' ? 'bg-zinc-900 border-white/5' : 'bg-white border-b border-zinc-100'} py-8 overflow-hidden`}>
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-center gap-8 md:gap-16 lg:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 animate-scroll-rtl flex-nowrap overflow-x-auto no-scrollbar">
                            {brands.map((brand: any) => (
                                <div key={brand.id} className="shrink-0">
                                    <img src={brand.logo} alt={brand.name} className={`h-8 md:h-10 w-auto object-contain ${storeTheme === 'aura' ? 'brightness-0 invert' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Shop By Category ── */}
            {store.categories.length > 0 && (
                <section className={`py-8 overflow-hidden ${isSports ? 'bg-white' : storeTheme === 'aura' ? 'bg-zinc-950' : 'bg-white'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center text-center mb-4">
                            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${storeTheme === 'aura' ? 'text-white' : 'text-zinc-900'}`}>Shop by category</h2>
                            <p className="text-zinc-500 mt-1 text-sm">Find exactly what you're looking for</p>
                            <Link href={`/s/${slug}/products`} className="mt-3 text-[var(--primary-color)] text-sm font-bold hover:opacity-80 transition-all">
                                View all →
                            </Link>
                        </div>

                        <CategoryCarousel categories={store.categories} slug={slug} storeTheme={storeTheme} />
                    </div>
                </section>
            )}

            {/* ── Featured Products ── */}
            <section className={`py-14 ${isSports ? 'bg-zinc-50' : storeTheme === 'aura' ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className={`text-2xl sm:text-3xl font-bold ${storeTheme === 'aura' ? 'text-white' : 'text-zinc-900'}`}>Featured products</h2>
                            <p className="text-zinc-500 mt-1 text-sm">Handpicked favorites from our collection</p>
                        </div>
                        <Link href={`/s/${slug}/products`} className="hidden sm:block text-[var(--primary-color)] text-sm font-medium hover:opacity-80 transition-all">
                            View all →
                        </Link>
                    </div>

                    {featuredProducts.length === 0 ? (
                        <div className={`py-12 text-center text-zinc-400 text-sm rounded-2xl border border-dashed ${storeTheme === 'aura' ? 'bg-zinc-950 border-white/10' : 'bg-white border-zinc-200'}`}>
                            No products yet — check back soon!
                        </div>
                    ) : (
                        <StaggeredGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featuredProducts.map((product: any) => (
                                <HomeProductCard key={product.id} product={product} slug={slug} currency={store.currency} layoutStyle={effectiveLayoutStyle} storeTheme={storeTheme} />
                            ))}
                        </StaggeredGrid>
                    )}
                </div>
            </section>

            {/* ── Best Sellers ── */}
            {displayBestSellers.length > 0 && (
                <section className={`py-14 ${isSports ? 'bg-white' : storeTheme === 'aura' ? 'bg-zinc-950' : 'bg-white'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${storeTheme === 'aura' ? 'text-white' : 'text-zinc-900'}`}>🏆 Best sellers</h2>
                                <p className="text-zinc-500 mt-1 text-sm font-medium">Our most popular products right now</p>
                            </div>
                            <Link href={`/s/${slug}/products`} className="hidden sm:block text-[var(--primary-color)] text-[11px] font-bold hover:text-[var(--primary-color)]/80 transition-colors">
                                Shop all →
                            </Link>
                        </div>

                        <StaggeredGrid className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {displayBestSellers.map((product: any) => (
                                <HomeProductCard key={product.id} product={product} slug={slug} currency={store.currency} layoutStyle={effectiveLayoutStyle} storeTheme={storeTheme} />
                            ))}
                        </StaggeredGrid>
                    </div>
                </section>
            )}
            
            {/* ── All Products ── */}
            <section className={`py-14 ${isSports ? 'bg-zinc-100/30' : storeTheme === 'aura' ? 'bg-zinc-900/30' : 'bg-zinc-50/50'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${storeTheme === 'aura' ? 'text-white' : 'text-zinc-900'}`}>🛍️ Our collection</h2>
                            <p className="text-zinc-500 mt-1 text-sm font-medium">Explore all our products</p>
                        </div>
                        <Link href={`/s/${slug}/products`} className="hidden sm:block text-[var(--primary-color)] text-[11px] font-bold hover:opacity-80 transition-all">
                            View all →
                        </Link>
                    </div>

                    <StaggeredGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {store.products.slice(0, 16).map((product: any) => (
                            <HomeProductCard key={product.id} product={product} slug={slug} currency={store.currency} layoutStyle={effectiveLayoutStyle} storeTheme={storeTheme} />
                        ))}
                    </StaggeredGrid>
                </div>
            </section>


            {/* ── Customer Reviews ── */}
            {themeConfig.isGoogleReviewsEnabled && themeConfig.manualReviews && themeConfig.manualReviews.length > 0 && (
                <GoogleReviews reviews={themeConfig.manualReviews} storeName={store.name} />
            )}


            {/* ── Value Props ── */}
            <section className={`py-10 border-t ${isSports ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-50 border-zinc-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { icon: "🚚", title: "Free Shipping", desc: `On orders over ${formatPrice(store.currency === "INR" ? 499 : store.currency === "MYR" ? 250 : 50, store.currency)}` },
                            { icon: "🔒", title: "Secure Payment", desc: "100% protected" },
                            { icon: "↩️", title: "Easy Returns", desc: "30-day policy" },
                            { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
                        ].map((item) => (
                            <div key={item.title} className={`${isSports ? 'bg-white border-zinc-100' : 'bg-white border-zinc-100'} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <h4 className={`font-bold text-sm mb-1 ${storeTheme === 'aura' ? 'text-white' : 'text-zinc-900'}`}>{item.title}</h4>
                                <p className="text-zinc-500 text-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
