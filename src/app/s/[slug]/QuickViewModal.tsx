"use client"

import { useState } from "react"
import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { formatPrice } from "./utils"

interface Product {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    images: string
    stock: number
    description: string | null
    reviews?: { rating: number }[]
}

interface QuickViewModalProps {
    product: Product
    slug: string
    currency: string
    isOpen: boolean
    onClose: () => void
}

export default function QuickViewModal({ product, slug, currency, isOpen, onClose }: QuickViewModalProps) {
    const { addItem } = useCart()
    const { toggleItem, isWishlisted } = useWishlist()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [addedFeedback, setAddedFeedback] = useState(false)

    const images: string[] = Array.isArray(product.images) ? product.images : (function() {
        try { return JSON.parse(product.images as any || "[]") } catch(e) { return [] }
    })()
    const wishlisted = isWishlisted(product.id)
    
    const reviews = product.reviews || []
    const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: images[0] || "",
            quantity: quantity,
            slug: product.slug,
        })
        setAddedFeedback(true)
        setTimeout(() => setAddedFeedback(false), 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[60] p-2 bg-white/90 backdrop-blur-md rounded-full text-zinc-400 hover:text-black hover:scale-110 transition-all border border-zinc-100 shadow-sm"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Left: Image Gallery */}
                    <div className="w-full md:w-1/2 bg-zinc-50 relative group aspect-square md:aspect-auto">
                        <div className="h-full flex items-center justify-center p-6 sm:p-12">
                            {images.length > 0 ? (
                                <motion.img
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-6xl font-black text-zinc-200 uppercase italic">{product.name.charAt(0)}</div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-black shadow-lg border border-zinc-100"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-black shadow-lg border border-zinc-100"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "w-6 bg-zinc-800" : "bg-zinc-300"}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="mb-6">
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-[0.3em] mb-2 sm:mb-3 block italic"
                            >
                                Quick View
                            </motion.span>
                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-900 tracking-tight mb-3 sm:mb-4 leading-tight"
                            >
                                {product.name}
                            </motion.h2>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s <= avgRating ? "fill-black text-black" : "text-zinc-200"}`} />
                                    ))}
                                    <span className="ml-2 text-[11px] sm:text-sm font-bold text-zinc-400">({reviews.length})</span>
                                </div>
                                <div className="h-4 w-px bg-zinc-200" />
                                <span className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-baseline gap-3 sm:gap-4 mb-6 sm:mb-8"
                            >
                                <span className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter">
                                    {formatPrice(product.price, currency)}
                                </span>
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span className="text-lg sm:text-xl font-bold text-zinc-400 line-through tracking-tighter">
                                        {formatPrice(product.compareAtPrice, currency)}
                                    </span>
                                )}
                            </motion.div>

                            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8 uppercase tracking-wide">
                                {product.description || "No description available for this premium product."}
                            </p>
                        </div>

                        <div className="mt-auto space-y-6">
                            {/* Quantity */}
                            <div className="flex items-center gap-4 sm:gap-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quantity</span>
                                <div className="flex items-center bg-zinc-100 rounded-2xl p-0.5 sm:p-1 border border-zinc-200">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-zinc-500 hover:text-black transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 sm:w-12 text-center font-black text-xs sm:text-sm">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-zinc-500 hover:text-black transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 sm:gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 h-14 sm:h-16 rounded-[20px] sm:rounded-[24px] flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl active:scale-95 ${
                                        addedFeedback 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-[var(--primary-color)] text-white hover:opacity-90 hover:shadow-[var(--primary-color)]/20"
                                    } disabled:opacity-50`}
                                >
                                    {addedFeedback ? (
                                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Added</span>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Add to Bag</span>
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleItem({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: images[0] || "",
                                            slug: product.slug,
                                            compareAtPrice: product.compareAtPrice,
                                        });
                                    }}
                                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[24px] flex items-center justify-center transition-all border shadow-sm ${
                                        wishlisted 
                                        ? "bg-rose-50 border-rose-100 text-rose-500" 
                                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100"
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlisted ? "fill-current" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
