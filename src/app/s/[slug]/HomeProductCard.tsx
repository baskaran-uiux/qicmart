"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Heart, Eye, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { formatPrice } from "./utils"
import { useSession } from "next-auth/react"
import QuickViewModal from "./QuickViewModal"
import OptimizedImage from "@/components/common/OptimizedImage"


interface Product {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    images: string
    updatedAt: Date | string
    stock: number
    isBestSeller?: boolean
    description: string | null
    reviews?: { rating: number }[]
}

export default function HomeProductCard({
    product,
    slug,
    currency = "INR",
    layoutStyle = "default",
    storeTheme = "modern",
}: {
    product: Product
    slug: string
    currency?: string
    layoutStyle?: string
    storeTheme?: string
}) {
    const { data: session } = useSession()
    const { addItem, isInCart } = useCart()
    const { toggleItem, isWishlisted } = useWishlist()
    const [addedFeedback, setAddedFeedback] = useState(false)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

    // Helper for tracking
    const trackActivity = async (type: string, description: string, metadata?: any) => {
        if (!session?.user || !(session.user as any).id) return

        try {
            await fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: (product as any).storeId,
                    customerId: (session.user as any).id,
                    type,
                    description,
                    metadata
                })
            })
        } catch (err) {
            console.error("Tracking Error:", err)
        }
    }

    const images: string[] = Array.isArray(product.images) ? product.images : (function() {
        try { return JSON.parse(product.images as any || "[]") } catch(e) { return [] }
    })()
    
    // Add cache-busting version based on updatedAt
    const version = product.updatedAt ? new Date(product.updatedAt).getTime() : Date.now()
    const rawImage = images[0] || null
    const image = rawImage ? (rawImage.includes('?') ? `${rawImage}&v=${version}` : `${rawImage}?v=${version}`) : null
    
    // Hover image (2nd image in gallery)
    const rawHoverImage = images[1] || null
    const hoverImage = rawHoverImage ? (rawHoverImage.includes('?') ? `${rawHoverImage}&v=${version}` : `${rawHoverImage}?v=${version}`) : null
    const inCart = isInCart(product.id)
    const wishlisted = isWishlisted(product.id)

    // Memoize reviews calculation
    const reviews = product.reviews || []
    const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0
    const reviewCount = reviews.length

    const discount = product.compareAtPrice && product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : null

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: image || "",
            quantity: 1,
            slug: product.slug,
        })

        const metadata = {
            productId: product.id,
            quantity: 1,
            price: product.price
        }

        trackActivity("ADD_TO_CART", product.name, metadata)
        setAddedFeedback(true)
        setTimeout(() => setAddedFeedback(false), 2000)
    }

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: image || "",
            slug: product.slug,
            compareAtPrice: product.compareAtPrice,
        })

        if (!wishlisted) {
            trackActivity("ADD_WISHLIST", product.name, {
                productId: product.id,
                price: product.price
            })
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    const isNextgen = layoutStyle === 'nextgen'
    const isAura = storeTheme === "aura"
    const isGlass = storeTheme === "glass"
    const isSports = storeTheme === "sports" || layoutStyle === 'sports'

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={cardVariants as any}
            className="h-full group/card will-change-transform"
        >
            <style jsx global>{`
                @keyframes shine {
                    0% { transform: translateX(-200%) skewX(-20deg); }
                    100% { transform: translateX(300%) skewX(-20deg); }
                }
                .animate-shine {
                    animation: shine 3s infinite ease-in-out;
                    width: 40%;
                }
                .animate-shine-once {
                    animation: shine 0.8s ease-in-out forwards;
                    width: 100%;
                }
                .premium-orange-action {
                    background: var(--primary-color) !important;
                    color: white !important;
                    box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.2);
                }
            `}</style>
            
            <Link 
                href={`/s/${slug}/products/${product.slug}`} 
                className={`group relative overflow-hidden border transition-all duration-700 flex flex-col h-full
                    ${isSports ? 'bg-white border-zinc-100 hover:border-[var(--primary-color)] shadow-sm hover:shadow-[var(--primary-color)]/10' : isAura ? 'bg-zinc-900 border-white/5 shadow-none hover:bg-zinc-800' : isGlass ? 'bg-white/40 backdrop-blur-3xl border-white/40 shadow-xl' : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 hover:shadow-xl hover:shadow-black/5'}
                    ${isNextgen || isSports ? 'rounded-[40px] sm:rounded-[56px] p-2 sm:p-4 pb-3 sm:pb-4' : 'rounded-[32px]'}`}
            >
                {/* Image Container */}
                <div className={`relative aspect-square overflow-hidden transition-all duration-700
                    ${isAura ? 'bg-zinc-950' : isSports ? 'bg-zinc-50' : 'bg-zinc-50 dark:bg-zinc-800/50'} 
                    ${isNextgen || isSports ? 'rounded-[36px] sm:rounded-[48px]' : ''}`}>
                    
                    {/* Sports Mesh Background Pattern */}
                    {isSports && (
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
                             style={{ 
                                backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
                                backgroundSize: '16px 16px' 
                             }} />
                    )}

                    <div className="block w-full h-full relative z-[1]">
                        {image ? (
                            <div className="w-full h-full relative">
                                <OptimizedImage
                                    src={image}
                                    alt={product.name}
                                    fill
                                    className={`object-cover transition-all duration-[1.2s] ease-[0.16,1,0.3,1] ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                                {hoverImage && (
                                    <OptimizedImage
                                        src={hoverImage}
                                        alt={`${product.name} hover`}
                                        fill
                                        className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-[1.2s] ease-[0.16,1,0.3,1] group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-5xl font-black italic rounded-3xl overflow-hidden relative group/placeholder
                                ${isSports ? 'bg-zinc-100 text-zinc-300' : isAura ? 'bg-zinc-900 text-zinc-800' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-200'}`}>
                                <span className="relative z-10">{product.name.charAt(0)}</span>
                                {isSports && (
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--primary-color)_0%,transparent_70%)]" />
                                )}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    {/* Badges - Only for Dress Shop (Nextgen) */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {isNextgen && (
                            <>
                                {product.isBestSeller && (
                                    <div className="relative px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black rounded-full shadow-lg flex items-center gap-1.5 border border-white/20 overflow-hidden group/badge">
                                        <Star className="w-2.5 h-2.5 fill-current text-white" />
                                        <span className="relative z-10 uppercase tracking-widest">Best seller</span>
                                        <div className="absolute inset-0 -translate-x-full animate-shine pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
                                    </div>
                                )}
                                
                                {discount && discount > 0 && (
                                    <div className="px-3 py-1.5 bg-[var(--primary-color)] text-white text-[9px] font-bold rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        -{discount}%
                                    </div>
                                )}

                                {!product.isBestSeller && (!discount || discount <= 0) && (
                                    <div className="px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-[9px] font-bold rounded-full shadow-sm flex items-center gap-2 border border-zinc-100 dark:border-white/10">
                                        <span className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-pulse"></span>
                                        New arrival
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    

                    {/* Quick Action - Circular Side Actions */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2.5 z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsQuickViewOpen(true)
                            }}
                            className={`w-11 h-11 rounded-2xl backdrop-blur-2xl flex items-center justify-center transition-all shadow-2xl border ${isAura ? 'bg-black/80 text-white border-white/10 hover:bg-white hover:text-black' : 'bg-white/90 dark:bg-black/80 text-zinc-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-white/20 dark:border-white/10'}`}
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleWishlist}
                            className={`w-11 h-11 rounded-2xl backdrop-blur-2xl flex items-center justify-center transition-all shadow-2xl border ${wishlisted
                                    ? "bg-rose-500 text-white border-rose-400"
                                    : isAura ? "bg-black/80 text-white border-white/10 hover:bg-rose-500 hover:text-white" : "bg-white/90 dark:bg-black/80 text-zinc-900 dark:text-white hover:bg-rose-500 hover:text-white border-white/20 dark:border-white/10"
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className={`flex flex-col flex-grow ${isNextgen || isSports ? 'px-4 pb-4 pt-6 sm:pb-5' : 'px-6 pb-8 pt-4'}`}>
                    <div className="mb-2 overflow-hidden relative">
                        <div className="flex items-center justify-between gap-2 mb-1.5 translate-y-1 group-hover:translate-y-0 transition-transform duration-700">
                             {(isNextgen || isSports) && (
                                <p className={`text-[10px] font-medium ${isSports ? 'text-zinc-400' : 'text-zinc-500'}`}>{isSports ? 'Pro performance' : 'Limited edition'}</p>
                            )}
                            {!isSports && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black text-zinc-400">{avgRating > 0 ? avgRating.toFixed(1) : "5.0"}</span>
                                </div>
                            )}
                        </div>
                        <p className={`leading-tight group-hover:text-[var(--primary-color)] transition-all duration-500 line-clamp-2
                            ${isSports ? 'text-zinc-900 font-medium tracking-tight' : isAura ? 'text-zinc-100 font-medium tracking-wide' : 'text-zinc-900 dark:text-zinc-100 font-medium tracking-wide'}
                            ${isNextgen || isSports ? 'text-[13px] sm:text-[14px]' : 'text-sm'}`}>
                            {product.name}
                        </p>
                    </div>

                    {/* Price & Action Row */}
                    <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col min-w-0 transition-transform duration-500 group-hover:-translate-y-1">
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[11px] font-medium line-through opacity-70 ${isAura ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        {formatPrice(product.compareAtPrice, currency)}
                                    </span>
                                </div>
                            )}
                            <span className={`leading-none tracking-tighter block 
                                ${isSports ? 'text-zinc-900 font-medium' : isAura ? 'text-white font-medium' : 'text-zinc-900 dark:text-white font-medium'}
                                ${isNextgen || isSports ? 'text-lg' : 'text-base'}`}>
                                {formatPrice(product.price, currency)}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`group/btn w-10 h-10 flex items-center justify-center transition-all shadow-xl active:scale-95 flex-shrink-0 ${addedFeedback
                                    ? "bg-emerald-500 text-white"
                                    : isSports ? "bg-[var(--primary-color)] text-white hover:bg-black hover:text-white hover:rotate-6 sm:hover:rotate-12 shadow-[var(--primary-color)]/30 hover:shadow-black/20" : "premium-orange-action text-white hover:scale-110"
                                } ${isNextgen || isSports ? 'rounded-xl sm:rounded-[20px]' : 'rounded-2xl'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {addedFeedback ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                </motion.div>
                            ) : (
                                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </Link>

            <QuickViewModal
                product={product}
                slug={slug}
                currency={currency}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </motion.div>
    )
}
