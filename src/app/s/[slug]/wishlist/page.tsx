"use client"

import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { use } from "react"

export default function WishlistPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const { items, removeItem } = useWishlist()
    const { addItem, isInCart } = useCart()

    const handleAddToCart = (item: typeof items[0]) => {
        addItem({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            slug: item.slug,
        })
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-50 py-16 px-4">
                <div className="w-24 h-24 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your wishlist is empty</h2>
                <p className="text-zinc-500 mb-8 text-center max-w-sm">Save products you love and come back to them later.</p>
                <Link href={`/s/${slug}/products`} className="px-8 py-4 bg-[var(--primary-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--primary-color)]/20">
                    Browse Products
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-zinc-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">My Wishlist ({items.length})</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const inCart = isInCart(item.id)
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                <Link href={`/s/${slug}/products/${item.slug}`}>
                                    <div className="aspect-square bg-zinc-100 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link href={`/s/${slug}/products/${item.slug}`}>
                                        <h3 className="font-semibold text-zinc-900 text-sm mb-2 line-clamp-1 hover:text-[var(--primary-color)] transition-colors">{item.name}</h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="font-bold text-zinc-900">${item.price.toFixed(2)}</span>
                                        {item.compareAtPrice && (
                                            <span className="text-xs text-zinc-400 line-through">${item.compareAtPrice.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl transition-all ${inCart ? "bg-[var(--primary-color)]/20 text-[var(--primary-color)]" : "bg-[var(--primary-color)] text-white hover:opacity-90"}`}
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            {inCart ? "In Cart" : "Add to Cart"}
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-zinc-200"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
