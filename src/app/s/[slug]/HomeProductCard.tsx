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

interface Product {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    images: string
    stock: number
    isBestSeller?: boolean
    description: string | null
    reviews?: { rating: number }[]
}

export default function HomeProductCard({
    product,
    slug,
    currency = "INR",
}: {
    product: Product
    slug: string
    currency?: string
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

    const images: string[] = JSON.parse(product.images)
    const image = images[0] || null
    const inCart = isInCart(product.id)
    const wishlisted = isWishlisted(product.id)

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

        trackActivity("ADD_TO_CART", product.name, {
            productId: product.id,
            quantity: 1,
            price: product.price
        })
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

    const reviews = product.reviews || []
    const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0
    const reviewCount = reviews.length

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.8,
                ease: "circOut"
            }
        }
    }

    return (
        <motion.div
            variants={cardVariants as any}
            className="h-full"
        >
            <style jsx global>{`
                @keyframes shine {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    20%, 100% { transform: translateX(250%) skewX(-20deg); }
                }
                .animate-shine {
                    animation: shine 4s infinite linear;
                    width: 50%;
                }
                .animate-shine-once {
                    animation: shine 0.8s ease-in-out forwards;
                    width: 100%;
                }
            `}</style>
            <Link href={`/s/${slug}/products/${product.slug}`} className="group relative bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-100 dark:border-white/5 hover:shadow-2xl hover:shadow-[var(--primary-color)]/5 transition-all duration-700 flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-square bg-white overflow-hidden">
                    <div className="block w-full h-full relative z-0">
                        {image ? (
                                <motion.img
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    src={image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-100 font-bold bg-zinc-50 dark:bg-zinc-800 rounded-3xl">
                                {product.name.charAt(0)}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {product.isBestSeller && (
                        <div className="absolute top-4 left-4 z-10">
                            <div className="relative px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-1 border border-amber-400/20 overflow-hidden group/badge">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="relative z-10">Best seller</span>
                                
                                {/* Shine Effect */}
                                <div className="absolute inset-0 -translate-x-full group-hover/badge:animate-shine-once pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
                                <div className="absolute inset-0 animate-shine pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
                            </div>
                        </div>
                    )}
                    
                    {/* Rating Pill - Inside Image Box */}
                    <div className="absolute bottom-4 left-4 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-1 py-1.5 px-3 bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-lg">
                            <span className="text-[12px] font-bold text-zinc-900 dark:text-white">{avgRating > 0 ? avgRating.toFixed(1) : "5.0"}</span>
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mb-0.5" />
                            <span className="text-[10px] font-semibold text-zinc-400 ml-0.5">{reviewCount > 0 ? `(${reviewCount})` : "New"}</span>
                        </div>
                    </div>

                    {/* Floating Actions - Top Right */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2.5 z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsQuickViewOpen(true)
                            }}
                            className="w-11 h-11 rounded-2xl bg-white/90 dark:bg-black/60 backdrop-blur-xl text-zinc-900 dark:text-white flex items-center justify-center hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-xl border border-white/20 dark:border-white/10"
                            title="Quick View"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleWishlist}
                            className={`w-11 h-11 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all shadow-xl border ${wishlisted
                                    ? "bg-rose-500 text-white border-rose-400"
                                    : "bg-white/90 dark:bg-black/60 text-zinc-900 dark:text-white hover:bg-rose-500 hover:text-white border-white/20 dark:border-white/10"
                                }`}
                            title="Wishlist"
                        >
                            <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col flex-grow">
                    {/* Title */}
                    <div className="block mb-2">
                        <motion.h3 
                            className="text-sm sm:text-[16px] font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 uppercase italic"
                        >
                            {product.name}
                        </motion.h3>
                    </div>

                    {/* Price & Action Row */}
                    <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col min-w-0">
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[13px] font-semibold text-zinc-400 line-through">
                                        {formatPrice(product.compareAtPrice, currency)}
                                    </span>
                                    {discount && (
                                        <span className="px-1.5 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[9px] font-bold rounded-md">
                                            -{discount}%
                                        </span>
                                    )}
                                </div>
                            )}
                            <span className="text-lg sm:text-xl font-bold text-zinc-900 leading-none truncate block">
                                {formatPrice(product.price, currency)}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`group/btn w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-90 flex-shrink-0 ${addedFeedback
                                    ? "bg-emerald-500 text-white"
                                    : "bg-[var(--primary-color)] text-white hover:opacity-90 hover:shadow-[var(--primary-color)]/20"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {addedFeedback ? (
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-in zoom-in duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
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
