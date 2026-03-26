"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader2 } from "lucide-react"
import { use, useState, useEffect } from "react"
import { formatPrice } from "../utils"

export default function CartPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
    const [currency, setCurrency] = useState("INR")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/store-info?slug=${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.currency) setCurrency(data.currency)
                setLoading(false)
            })
    }, [slug])

    const shipping = totalPrice > 499 ? 0 : totalPrice === 0 ? 0 : 50
    const total = totalPrice + shipping

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-zinc-500">
            <Loader2 className="animate-spin text-[var(--primary-color)]" size={32} /> 
            <p className="font-medium tracking-tight">Loading cart details...</p>
        </div>
    )

    if (totalItems === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-50 py-16 px-4">
                <div className="w-24 h-24 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h2>
                <p className="text-zinc-500 mb-8 text-center max-w-sm">You haven't added anything yet. Discover our amazing products!</p>
                <Link href={`/s/${slug}/products`} className="px-8 py-4 bg-[var(--primary-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--primary-color)]/20">
                    Start Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-zinc-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-zinc-900 mb-8">Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200">
                            <ul className="divide-y divide-zinc-100">
                                {items.map((item) => (
                                    <li key={item.id} className="p-5 flex gap-4 sm:gap-6 items-start">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between gap-2">
                                                <div>
                                                    <Link href={`/s/${slug}/products/${item.slug}`} className="font-semibold text-zinc-900 hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                                                        {item.name}
                                                    </Link>
                                                    <div className="flex gap-2 mt-1 text-xs text-zinc-500">
                                                        {item.options && Object.entries(item.options).map(([name, value]) => (
                                                            <span key={name} className="px-2 py-0.5 bg-zinc-100 rounded-full">{name}: {value}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="font-bold text-zinc-900 text-right whitespace-nowrap">
                                                    {formatPrice(item.price * item.quantity, currency)}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-3 py-1.5 text-sm font-semibold text-zinc-900 border-x border-zinc-200">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-zinc-900 mb-5">Order Summary</h2>

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm text-zinc-600">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="font-medium text-zinc-900">{formatPrice(totalPrice, currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-600">
                                    <span>Shipping</span>
                                    <span className={`font-medium ${shipping === 0 && totalPrice > 0 ? "text-emerald-600" : "text-zinc-900"}`}>
                                        {shipping === 0 && totalPrice > 0 ? "FREE 🎉" : formatPrice(shipping, currency)}
                                    </span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-xs text-zinc-400">Add {formatPrice(499 - totalPrice, currency)} more for free shipping</p>
                                )}
                            </div>

                            <div className="border-t border-zinc-200 pt-4 flex justify-between mb-6">
                                <span className="font-bold text-zinc-900">Total</span>
                                <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(total, currency)}</span>
                            </div>

                            <Link
                                href={`/s/${slug}/checkout`}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--primary-color)]/20"
                            >
                                Checkout <ArrowRight className="w-4 h-4" />
                            </Link>

                            <div className="mt-4 text-center">
                                <Link href={`/s/${slug}/products`} className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 font-medium">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
