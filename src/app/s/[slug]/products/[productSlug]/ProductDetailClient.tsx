"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart, GitCompare, Star, Minus, Plus, Check, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { formatPrice } from "../../utils"
import { useSession } from "next-auth/react"
import HomeProductCard from "../../HomeProductCard"

// Product attributes and variations are now dynamic from the database.

interface Product {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    description: string | null
    images: string
    stock: number
    attributes: string // JSON
    variations: string // JSON
    type: string
    weight: number | null
    length: number | null
    width: number | null
    height: number | null
    category?: { name: string } | null
    reviews?: {
        id: string
        rating: number
        comment: string | null
        createdAt: string | Date
        user: { name: string | null, image: string | null } | null
        images?: string
    }[]
}

import { Camera, X } from "lucide-react"

export default function ProductDetailClient({
    product,
    relatedProducts = [],
    slug,
    currency = "INR",
    storeTheme = "modern",
    layoutStyle = "default",
}: {
    product: Product
    relatedProducts?: Product[]
    slug: string
    currency?: string
    storeTheme?: string
    layoutStyle?: string
}) {
    const { data: session } = useSession()
    const router = useRouter()
    const { addItem, isInCart } = useCart()
    const { toggleItem, isWishlisted } = useWishlist()

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

    // Track View
    useEffect(() => {
        if (product) {
            trackActivity("VIEW_PRODUCT", product.name, {
                productId: product.id,
                slug: product.slug,
                price: product.price
            })

            // LocalStorage Tracking for "Recently Viewed"
            const viewed = localStorage.getItem("recentlyViewedProducts")
            const products = viewed ? JSON.parse(viewed) : []
            const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
            const currentItem = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image: images[0] || "",
                price: product.price,
                storeSlug: slug
            }

            const filtered = products.filter((p: any) => p.id !== product.id)
            const updated = [currentItem, ...filtered].slice(0, 10)
            localStorage.setItem("recentlyViewedProducts", JSON.stringify(updated))
        }
    }, [product.id, !!session])

    const images: string[] = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    const [activeIndex, setActiveIndex] = useState(0)
    const activeImage = images[activeIndex] || ""
    // Parse attributes and variations
    const attributes = typeof product.attributes === 'string' ? JSON.parse(product.attributes || "[]") : product.attributes
    const variations = typeof product.variations === 'string' ? JSON.parse(product.variations || "[]") : product.variations

    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        if (product.type === "VARIABLE" && attributes.length > 0) {
            const initial: Record<string, string> = {}
            attributes.forEach((attr: any) => {
                const values = Array.isArray(attr.values) ? attr.values.flatMap((v: any) => typeof v === 'string' ? v.split('|') : [v]) : []
                if (values[0]) initial[attr.name] = values[0]
            })
            return initial
        }
        return {}
    })
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState(false)
    const [activeTab, setActiveTab] = useState("description")
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [localReviews, setLocalReviews] = useState(product.reviews || [])
    const [reviewImages, setReviewImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    // Find current variation based on selected options
    const currentVariation = product.type === "VARIABLE" 
        ? variations.find((v: any) => 
            Object.entries(selectedOptions).every(([name, value]) => v.options[name] === value)
          )
        : null

    const price = currentVariation ? parseFloat(String(currentVariation.price)) : product.price
    const stock = currentVariation ? parseInt(String(currentVariation.stock)) : product.stock
    const activeImg = currentVariation?.image || activeImage

    const handleNextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const wishlisted = isWishlisted(product.id)
    const inCart = isInCart(product.id, selectedOptions)

    const avgRating = localReviews.length > 0
        ? (localReviews.reduce((acc, r) => acc + r.rating, 0) / localReviews.length).toFixed(1)
        : "5.0"

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            name: product.name,
            price: price,
            image: activeImg || "",
            quantity,
            // Pass all selected options to the cart
            options: selectedOptions,
            slug: product.slug,
        })
        
        trackActivity("ADD_TO_CART", product.name, {
            productId: product.id,
            quantity,
            price,
            variant: Object.values(selectedOptions).join(" / ")
        })

        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2500)
    }

    const handleBuyNow = () => {
        addItem({
            productId: product.id,
            name: product.name,
            price: price,
            image: activeImg || "",
            quantity,
            options: selectedOptions,
            slug: product.slug,
        })
        
        trackActivity("BUY_NOW", product.name, {
            productId: product.id,
            quantity,
            price,
            variant: Object.values(selectedOptions).join(" / ")
        })

        router.push(`/s/${slug}/checkout`)
    }

    const handleWishlist = () => {
        const item = {
            id: product.id,
            name: product.name,
            price: price,
            image: activeImg || "",
            slug: product.slug,
            compareAtPrice: product.compareAtPrice,
        }
        toggleItem(item)

        if (!wishlisted) {
            trackActivity("ADD_WISHLIST", product.name, {
                productId: product.id,
                price
            })
        }
    }


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        
        setIsUploading(true)
        const newImages: string[] = []
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.size > 2 * 1024 * 1024) {
                alert("Image too large (max 2MB)")
                continue
            }
            
            const reader = new FileReader()
            const promise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string)
            })
            reader.readAsDataURL(file)
            const base64 = await promise
            newImages.push(base64)
        }
        
        setReviewImages(prev => [...prev, ...newImages].slice(0, 5))
        setIsUploading(false)
    }

    const removeImage = (index: number) => {
        setReviewImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingReview(true)
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    storeId: (product as any).storeId, // storeId is included in product fetch
                    ...reviewForm,
                    images: reviewImages
                })
            })
            const data = await res.json()
            if (data.success) {
                setLocalReviews([data.data, ...localReviews])
                setReviewForm({ rating: 5, comment: "" })
                setReviewImages([]) // Clear images
                alert("Review submitted successfully!")
            }
 else {
                alert(data.error || "Review submission failed")
            }
        } catch (err) {
            alert("An error occurred")
        }
        setIsSubmittingReview(false)
    }

    const discount = product.compareAtPrice
        ? Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)
        : null

    const tabs = [
        { id: "description", label: "Description" },
        { id: "information", label: "Additional Information" },
        { id: "reviews", label: `Reviews (${localReviews.length})` }
    ]

    return (
        <div className="bg-white pb-24 lg:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                    <Link href={`/s/${slug}`} className="hover:text-[var(--primary-color)] transition-colors">Home</Link>
                    <span>/</span>
                    <Link href={`/s/${slug}/products`} className="hover:text-[var(--primary-color)] transition-colors">Products</Link>
                    <span>/</span>
                    <span className="text-zinc-900 font-medium">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-20">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square w-full rounded-3xl bg-zinc-50 overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/50 group/gallery">
                            <AnimatePresence mode="wait">
                                {activeImg ? (
                                    <motion.img
                                        key={activeImg}
                                        src={activeImg}
                                        alt={product.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        onDragEnd={(e, info) => {
                                            if (info.offset.x > 100) handlePrevImage()
                                            else if (info.offset.x < -100) handleNextImage()
                                        }}
                                        className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-200 text-6xl">📦</div>
                                )}
                            </AnimatePresence>

                            {/* Floating Wishlist Button */}
                            <button
                                onClick={handleWishlist}
                                className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border ${wishlisted
                                        ? "bg-rose-500 text-white border-rose-400"
                                        : "bg-white/80 text-zinc-600 hover:bg-white border-zinc-200"
                                    }`}
                                title="Wishlist"
                            >
                                <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
                            </button>

                            {/* Arrows for Desktop */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-900 border border-zinc-200 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-900 border border-zinc-200 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-3">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 ${activeIndex === i ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5" : "border-zinc-100 bg-white hover:border-zinc-300"}`}
                                    >
                                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {product.category && (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full border border-[var(--primary-color)]/20">{product.category.name}</span>
                            )}
                            {stock > 0 ? (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">In Stock</span>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">Out of Stock</span>
                            )}
                        </div>
                        <h1 className="text-2xl font-medium tracking-tight text-zinc-900 mb-4">{product.name}</h1>
                        
                        {/* Rating Pill */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                                <span className="text-base font-bold text-zinc-900">{avgRating}</span>
                                <Star className="w-4 h-4 fill-emerald-600 text-emerald-600 mb-0.5" />
                                <span className="text-base font-medium text-zinc-400 ml-0.5">({localReviews.length.toLocaleString()})</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100">
                            {discount && discount > 0 && (
                                <div className="flex items-center gap-1 text-[26px] font-semibold text-emerald-600">
                                    <span className="mb-0.5">↓</span>
                                    <span>{discount}%</span>
                                </div>
                            )}
                            <div className="flex items-end gap-3 translate-y-0.5">
                                {product.compareAtPrice && product.compareAtPrice > price && (
                                    <span className="text-xl text-zinc-400 line-through font-medium">
                                        {formatPrice(product.compareAtPrice, currency).replace(".00", "")}
                                    </span>
                                )}
                                <span className="text-3xl font-bold text-zinc-900">
                                    {formatPrice(price, currency)}
                                </span>
                            </div>
                        </div>

                        {/* Description Summary */}
                        {product.description && (
                            <div className="mb-8">
                                <p className="text-zinc-600 leading-relaxed font-medium line-clamp-3">{product.description}</p>
                                <button onClick={() => setActiveTab("description")} className="text-[var(--primary-color)] text-sm font-bold mt-2 uppercase tracking-widest hover:underline">Read full description</button>
                            </div>
                        )}

                        {/* Dynamic Attribute Selectors */}
                        {attributes.length > 0 && (
                            <div className="space-y-6 mb-8">
                                {attributes.map((attr: any) => {
                                    const attrNameLower = attr.name.toLowerCase()
                                    const isStatic = ['brand', 'model name', 'material'].includes(attrNameLower)
                                    
                                    if (isStatic) return null; // These will go into Info tab

                                    return (
                                        <div key={attr.name}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-black text-zinc-900 uppercase tracking-widest italic">{attr.name}</span>
                                                {selectedOptions[attr.name] && <span className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest">{selectedOptions[attr.name]}</span>}
                                            </div>
                                            <div className="flex gap-3 flex-wrap items-center">
                                                {(Array.isArray(attr.values) ? attr.values.flatMap((v: any) => typeof v === 'string' ? v.split('|') : [v]) : []).map((v: string) => {
                                                    const isSelected = selectedOptions[attr.name] === v
                                                    const isColorAttr = attrNameLower === 'color' || attrNameLower === 'colour'
                                                    
                                                    if (isColorAttr) {
                                                        const colorMap: Record<string, string> = {
                                                            'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e',
                                                            'yellow': '#eab308', 'black': '#000000', 'white': '#ffffff',
                                                            'purple': '#a855f7', 'pink': '#ec4899', 'orange': '#f97316',
                                                            'gray': '#6b7280', 'grey': '#6b7280', 'indigo': '#6366f1',
                                                        }
                                                        const colorValue = colorMap[v.toLowerCase()] || v.toLowerCase()
                                                        
                                                        return (
                                                            <button
                                                                key={v}
                                                                onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: v }))}
                                                                title={v}
                                                                className={`relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${isSelected ? "border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/20" : "border-zinc-200 hover:border-zinc-400"}`}
                                                            >
                                                                <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: colorValue }} />
                                                                {isSelected && <Check className={`absolute w-4 h-4 ${v.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`} />}
                                                            </button>
                                                        )
                                                    }

                                                    return (
                                                        <button
                                                            key={v}
                                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: v }))}
                                                            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border rounded-2xl transition-all ${isSelected ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-xl shadow-[var(--primary-color)]/20" : "bg-white border-zinc-200 text-zinc-700 hover:border-[var(--primary-color)]/50 shadow-sm"}`}
                                                        >
                                                            {v}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest italic">Quantity</span>
                                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl p-1 shadow-inner">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-white hover:text-[var(--primary-color)] rounded-xl transition-all"><Minus className="w-4 h-4" /></button>
                                    <span className="w-12 text-center text-sm font-black text-zinc-900">{quantity}</span>
                                    <button onClick={() => setQuantity(q => Math.min(stock || 99, q + 1))} className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-white hover:text-[var(--primary-color)] rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    disabled={stock === 0 || (product.type === "VARIABLE" && Object.keys(selectedOptions).length < attributes.length)}
                                    onClick={handleAddToCart}
                                    className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] transition-all border ${addedToCart ? "bg-emerald-500 text-white border-emerald-400" : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 disabled:opacity-40"}`}
                                >
                                    {addedToCart ? "Added to Cart!" : stock === 0 ? "Out of Stock" : "Add to Cart"}
                                </button>

                                <button
                                    disabled={stock === 0 || (product.type === "VARIABLE" && Object.keys(selectedOptions).length < attributes.length)}
                                    onClick={handleBuyNow}
                                    className="w-full py-4 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] transition-all shadow-xl shadow-[var(--primary-color)]/20 flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90"
                                >
                                    <Zap size={14} className="fill-current" />
                                    Buy Now
                                </button>
                            </div>

                             <div className="flex gap-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Fast Delivery & Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed section */}
                <div className="border-t border-zinc-100 pt-16 mb-20">
                    <div className="flex flex-wrap gap-8 border-b border-zinc-100 mb-10">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? "text-[var(--primary-color)]" : "text-zinc-400 hover:text-zinc-900"}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary-color)] rounded-full" />}
                            </button>
                        ))}
                    </div>

                    <div className="animate-fade-in">
                        {activeTab === "description" && (
                            <div className="prose prose-zinc max-w-none">
                                <p className="text-zinc-600 leading-loose text-lg font-medium whitespace-pre-wrap">{product.description || "No description available for this product."}</p>
                            </div>
                        )}

                        {activeTab === "information" && (
                            <div className="max-w-2xl">
                                <table className="w-full border-collapse">
                                    <tbody className="divide-y divide-zinc-100">
                                        {attributes.map((attr: any) => (
                                            <tr key={attr.name}>
                                                <td className="py-4 text-xs font-black text-zinc-500 uppercase tracking-widest w-1/3 italic">{attr.name}</td>
                                                <td className="py-4 text-sm text-zinc-900 font-bold">{Array.isArray(attr.values) ? attr.values.join(", ") : attr.values}</td>
                                            </tr>
                                        ))}
                                        <tr><td className="py-4 text-xs font-black text-zinc-500 uppercase tracking-widest italic">Weight</td><td className="py-4 text-sm text-zinc-900 font-bold">{product.weight || 0} kg</td></tr>
                                        <tr><td className="py-4 text-xs font-black text-zinc-500 uppercase tracking-widest italic">Dimensions</td><td className="py-4 text-sm text-zinc-900 font-bold">{product.length || 0}L x {product.width || 0}W x {product.height || 0}H cm</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Reviews List */}
                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-widest italic">Customer Reviews</h3>
                                    {localReviews.length === 0 ? (
                                        <div className="p-8 bg-zinc-50 rounded-3xl text-center border border-zinc-100">
                                            <p className="text-zinc-400 font-bold">No reviews yet. Be the first to review!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {localReviews.map(review => (
                                                <div key={review.id} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center font-bold text-[var(--primary-color)] border border-[var(--primary-color)]/20">
                                                                {review.user?.image ? <img src={review.user.image} className="w-full h-full rounded-full object-cover" /> : review.user?.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-zinc-900 uppercase tracking-widest">{review.user?.name || "Anonymous"}</p>
                                                                <p className="text-[10px] text-zinc-400 font-bold italic">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex text-yellow-500">
                                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-current" : "text-zinc-200"}`} />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-4">{review.comment}</p>
                                                    {review.images && JSON.parse(review.images).length > 0 && (
                                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                            {JSON.parse(review.images).map((img: string, i: number) => (
                                                                <img key={i} src={img} className="w-20 h-20 rounded-xl object-cover border border-zinc-200" alt="Review" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Review Form */}
                                <div className="p-10 bg-zinc-50 border border-zinc-200 rounded-[40px] shadow-sm h-fit">
                                    <h3 className="text-xl font-black uppercase tracking-widest italic mb-2 text-zinc-900">Share your experience</h3>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8 text-zinc-400">Tell us what you think about this product</p>
                                    
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic">Your Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(r => (
                                                    <button key={r} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: r }))} className={`p-2 transition-all ${reviewForm.rating >= r ? "text-yellow-500" : "text-zinc-300 hover:text-yellow-500"}`}>
                                                        <Star className={`w-6 h-6 ${reviewForm.rating >= r ? "fill-current" : ""}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic">Detailed Comment</label>
                                            <textarea
                                                required
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                placeholder="Write your review here..."
                                                className="w-full px-6 py-4 bg-white border border-zinc-200 rounded-2xl text-sm font-medium min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 text-zinc-900 placeholder-zinc-300 shadow-sm"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic">Attach Photos (Optional)</label>
                                            <div className="flex flex-wrap gap-3">
                                                {reviewImages.map((img, i) => (
                                                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 group">
                                                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeImage(i)}
                                                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {reviewImages.length < 5 && (
                                                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 transition-all text-zinc-400 hover:text-[var(--primary-color)]">
                                                        <Camera size={20} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest mt-1">Add</span>
                                                        <input 
                                                            type="file" 
                                                            multiple 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={handleFileChange} 
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            disabled={isSubmittingReview || isUploading}
                                            type="submit"
                                            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="pt-20 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2 uppercase italic">Related Products</h2>
                                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest italic">Products you might be interested in</p>
                            </div>
                            <Link href={`/s/${slug}/products`} className="text-[var(--primary-color)] text-xs font-black uppercase tracking-widest hover:underline">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                            {relatedProducts.map(p => (
                                <HomeProductCard 
                                    key={p.id} 
                                    product={p as any} 
                                    slug={slug} 
                                    currency={currency} 
                                    storeTheme={storeTheme}
                                    layoutStyle={layoutStyle}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Mobile Sticky Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-3 z-50 flex gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
                <button
                    disabled={stock === 0 || (product.type === "VARIABLE" && Object.keys(selectedOptions).length < attributes.length)}
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
                >
                    {addedToCart ? "Added!" : "Add to cart"}
                </button>
                <button
                    disabled={stock === 0 || (product.type === "VARIABLE" && Object.keys(selectedOptions).length < attributes.length)}
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-[var(--primary-color)] text-white font-bold text-sm active:scale-95 transition-all shadow-xl shadow-[var(--primary-color)]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Zap size={14} className="fill-current" />
                    Buy at {formatPrice(price, currency).replace(".00", "")}
                </button>
            </div>
        </div>
    )
}
