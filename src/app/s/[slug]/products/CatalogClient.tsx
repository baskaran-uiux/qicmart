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
}: {
    products: Product[]
    categories: Category[]
    slug: string
    currency?: string
}) {
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
        const images = JSON.parse(product.images)
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
        const images = JSON.parse(product.images)
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
            {categories.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">Categories</h3>
                    <div className="space-y-2">
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
                                    className="flex items-center gap-2 cursor-pointer group"
                                    style={{ marginLeft: `${cat.depth * 16}px` }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={() => setSelectedCategories(prev => 
                                            prev.includes(cat.name) 
                                            ? prev.filter(c => c !== cat.name) 
                                            : [...prev, cat.name]
                                        )}
                                        className="w-4 h-4 rounded border-zinc-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                    />
                                    <span className={`text-sm transition-colors ${selectedCategories.includes(cat.name) ? "text-[var(--primary-color)] font-bold" : "text-zinc-600 group-hover:text-zinc-900"}`}>
                                        {cat.name}
                                    </span>
                                </label>
                            ))
                        })()}
                    </div>
                </div>
            )}

            {/* Price Range Slider UI */}
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">Price Range ({currency})</h3>
                <div className="space-y-4">
                    <input 
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={currentRange.max}
                        onChange={(e) => setCurrentRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                        <span>{formatPrice(priceRange.min, currency)}</span>
                        <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-2 py-1 rounded-md">Up to {formatPrice(currentRange.max, currency)}</span>
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
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:border-[var(--primary-color)]/50"
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
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
