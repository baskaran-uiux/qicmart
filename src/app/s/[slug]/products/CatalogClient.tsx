"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Heart, ShoppingCart, SlidersHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { formatPrice } from "../utils"
import HomeProductCard from "../HomeProductCard"

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const COLORS = [
    { name: "Black", hex: "#18181b" },
    { name: "White", hex: "#f4f4f5" },
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
]
const PRICE_RANGES = [
    { label: "Under ₹25", min: 0, max: 25 },
    { label: "₹25 – ₹50", min: 25, max: 50 },
    { label: "₹50 – ₹100", min: 50, max: 100 },
    { label: "Over ₹100", min: 100, max: 99999 },
]
const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Recommended", value: "recommended" },
]

interface Product {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    images: string
    stock: number
    description: string | null
    categoryId: string | null
}

interface Category {
    id: string
    name: string
    parentId?: string | null
}

export default function CatalogClient({
    products: allProducts,
    categories,
    slug,
    currency = "INR",
    themeConfig: themeConfigRaw,
}: {
    products: Product[]
    categories: Category[]
    slug: string
    currency?: string
    themeConfig?: string | null
}) {
    const themeConfig = themeConfigRaw ? JSON.parse(themeConfigRaw) : {}
    const storeTheme = themeConfig.storeTheme || "modern"
    const layoutStyle = storeTheme === 'nextgen' ? 'nextgen' : (themeConfig.layoutStyle || "default")
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const { addItem, isInCart } = useCart()
    const { toggleItem, isWishlisted } = useWishlist()

    const q = searchParams.get("q") || ""
    const catQuery = searchParams.get("category") || ""
    const [selectedCategories, setSelectedCategories] = useState<string[]>(catQuery ? [catQuery] : [])
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
    const [currentRange, setCurrentRange] = useState({ min: 0, max: 5000 })
    const [sort, setSort] = useState("newest")
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

    const gridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    useEffect(() => {
        if (allProducts.length > 0) {
            const prices = allProducts.map(p => p.price)
            const min = Math.floor(Math.min(...prices))
            const max = Math.ceil(Math.max(...prices))
            setPriceRange({ min, max })
            setCurrentRange({ min, max })
        }
    }, [allProducts])

    useEffect(() => {
        const cat = searchParams.get("category")
        if (cat) {
            setSelectedCategories([cat])
        } else {
            setSelectedCategories([])
        }
    }, [searchParams])

    const [addedId, setAddedId] = useState<string | null>(null)

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: images[0] || "",
            quantity: 1,
            slug: product.slug,
        })
        setAddedId(product.id)
        setTimeout(() => setAddedId(null), 2000)
    }

    const handleWishlist = (product: Product, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0] || "",
            slug: product.slug,
            compareAtPrice: product.compareAtPrice,
        })
    }



    const getCategoryIds = (catNames: string[]) => {
        const ids: string[] = []
        catNames.forEach(name => {
            const cat = categories.find(c => c.name === name)
            if (cat) {
                ids.push(cat.id)
                // Also add all sub-category IDs
                const getChildren = (parentId: string) => {
                    const children = (categories as any[]).filter(c => c.parentId === parentId)
                    children.forEach(child => {
                        ids.push(child.id)
                        getChildren(child.id)
                    })
                }
                getChildren(cat.id)
            }
        })
        return ids
    }

    let filtered = allProducts.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
        if (selectedCategories.length > 0) {
            const targetIds = getCategoryIds(selectedCategories)
            if (!p.categoryId || !targetIds.includes(p.categoryId)) return false
        }
        if (p.price < currentRange.min || p.price > currentRange.max) return false
        return true
    })

    filtered = filtered.sort((a, b) => {
        if (sort === "price_asc") return a.price - b.price
        if (sort === "price_desc") return b.price - a.price
        return 0
    })

    const resetFilters = () => {
        setSelectedCategories([])
        setCurrentRange(priceRange)
        setSort("newest")
    }

    const hasActiveFilters = selectedCategories.length > 0 || currentRange.min !== priceRange.min || currentRange.max !== priceRange.max

    const filters = (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">Filters</h2>
                {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 font-medium flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear all
                    </button>
                )}
            </div>

            {/* Categories */}
            {/* Categories */}
            {categories.length > 0 && (
                <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100">
                    <h3 className="text-[10px] font-black text-zinc-400 mb-6 uppercase tracking-[0.2em]">Categories</h3>
                    <div className="space-y-3">
                        {(() => {
                            const buildTree = (items: Category[]) => {
                                const map = new Map<string, any>()
                                const roots: any[] = []
                                items.forEach(item => map.set(item.id, { ...item, children: [] }))
                                items.forEach(item => {
                                    if (item.parentId && map.has(item.parentId)) {
                                        map.get(item.parentId).children.push(map.get(item.id))
                                    } else {
                                        roots.push(map.get(item.id))
                                    }
                                })
                                return roots
                            }
                            const flattenTree = (tree: any[], depth = 0): any[] => {
                                return tree.reduce((acc: any[], item) => {
                                    acc.push({ ...item, depth })
                                    if (item.children && item.children.length > 0) {
                                        acc.push(...flattenTree(item.children, depth + 1))
                                    }
                                    return acc
                                }, [])
                            }
                            return flattenTree(buildTree(categories)).map((cat) => (
                                <label 
                                    key={cat.id} 
                                    className="flex items-center gap-3 cursor-pointer group/item"
                                    style={{ marginLeft: `${cat.depth * 12}px` }}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.name)}
                                            onChange={() => setSelectedCategories(prev => 
                                                prev.includes(cat.name) 
                                                ? prev.filter(c => c !== cat.name) 
                                                : [...prev, cat.name]
                                            )}
                                            className="peer w-5 h-5 rounded-lg border-zinc-200 text-black focus:ring-black transition-all appearance-none bg-white checked:bg-black checked:border-black"
                                        />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    <span className={`text-[13px] transition-all ${selectedCategories.includes(cat.name) ? "text-black font-bold" : "text-zinc-500 group-hover/item:text-zinc-900 group-hover/item:translate-x-1"}`}>
                                        {cat.name}
                                    </span>
                                </label>
                            ))
                        })()}
                    </div>
                </div>
            )}

            {/* Price Range Slider UI */}
            <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100">
                <h3 className="text-[10px] font-black text-zinc-400 mb-6 uppercase tracking-[0.2em]">Price Range ({currency})</h3>
                <div className="space-y-6">
                    <div className="relative h-1 bg-zinc-200 rounded-full">
                        <div 
                            className="absolute h-full bg-black rounded-full"
                            style={{ 
                                left: `${((currentRange.min - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                                right: `${100 - ((currentRange.max - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`
                            }}
                        />
                        <input 
                            type="range"
                            min={priceRange.min}
                            max={priceRange.max}
                            value={currentRange.max}
                            onChange={(e) => setCurrentRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                            className="absolute inset-0 w-full h-1 bg-black/0 appearance-none cursor-pointer accent-black pointer-events-auto"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-zinc-400 uppercase">Min</span>
                            <span className="text-[12px] font-bold text-black">{formatPrice(priceRange.min, currency)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-400 uppercase">Max</span>
                            <span className="text-[12px] font-bold text-black">{formatPrice(currentRange.max, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="bg-zinc-50 border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-extrabold text-zinc-900">
                        {q ? `Results for "${q}"` : "Shop"}
                    </h1>
                    <p className="text-zinc-500 mt-1">{filtered.length} products found</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Filter Sidebar */}
                    <aside className={`w-64 shrink-0 hidden lg:block`}>
                        <div className="sticky top-24">
                            {filters}
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Sort Bar */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:border-[var(--primary-color)]/50 transition-all active:scale-95"
                            >
                                <SlidersHorizontal className="w-4 h-4" /> Filters {hasActiveFilters && `(${selectedCategories.length + (currentRange.max < priceRange.max ? 1 : 0)})`}
                            </button>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="ml-auto px-3 py-2 border border-zinc-300 rounded-lg text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30"
                            >
                                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="py-24 text-center text-zinc-400">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-lg font-medium">No products found</p>
                                <button onClick={resetFilters} className="mt-4 text-[var(--primary-color)] text-sm underline">Clear filters</button>
                            </div>
                        ) : (
                            <motion.div 
                                layout
                                initial="hidden"
                                animate="visible"
                                variants={gridVariants}
                                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.9, y: 20 },
                                                visible: { opacity: 1, scale: 1, y: 0 }
                                            }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <HomeProductCard 
                                                product={product} 
                                                slug={slug} 
                                                currency={currency} 
                                                storeTheme={storeTheme}
                                                layoutStyle={layoutStyle}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] z-[100] lg:hidden max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                                <h3 className="font-bold text-lg">Filters</h3>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {filters}
                            </div>
                            <div className="p-4 bg-zinc-50 border-t border-zinc-100 shrink-0 pb-8 sm:pb-4">
                                <button 
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
