"use client"

import { useCompare } from "@/context/CompareContext"
import Link from "next/link"
import { X, GitCompare } from "lucide-react"
import { use } from "react"

export default function ComparePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const { items, removeItem, clearCompare } = useCompare()

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-50 py-16 px-4">
                <div className="w-24 h-24 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center mb-6">
                    <GitCompare className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">No products to compare</h2>
                <p className="text-zinc-500 mb-8 text-center max-w-sm">Add products from the shop to compare them side by side.</p>
                <Link href={`/s/${slug}/products`} className="px-8 py-4 bg-[var(--primary-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--primary-color)]/20">
                    Browse Products
                </Link>
            </div>
        )
    }

    const attributes = ["Price", "In Stock", "Description"]

    return (
        <div className="bg-zinc-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-zinc-900">Compare Products ({items.length})</h1>
                    <button onClick={clearCompare} className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-all">
                        <X className="w-4 h-4" /> Clear All
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <td className="p-5 font-semibold text-zinc-500 text-sm w-36">Product</td>
                                {items.map((item) => (
                                    <td key={item.id} className="p-5 text-center">
                                        <div className="relative">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-200 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <Link href={`/s/${slug}/products/${item.slug}`}>
                                                <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-zinc-900 text-sm line-clamp-2 hover:text-[var(--primary-color)] transition-colors">{item.name}</p>
                                            </Link>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-zinc-100">
                                <td className="p-5 text-sm font-semibold text-zinc-500">Price</td>
                                {items.map((item) => (
                                    <td key={item.id} className="p-5 text-center">
                                        <span className="text-xl font-bold text-zinc-900">${item.price.toFixed(2)}</span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-zinc-100">
                                <td className="p-5 text-sm font-semibold text-zinc-500">Availability</td>
                                {items.map((item) => (
                                    <td key={item.id} className="p-5 text-center">
                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${item.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                            {item.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-5 text-sm font-semibold text-zinc-500">Description</td>
                                {items.map((item) => (
                                    <td key={item.id} className="p-5 text-center">
                                        <p className="text-sm text-zinc-600 line-clamp-3 text-left">{item.description || "No description available."}</p>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-zinc-100 bg-zinc-50">
                                <td className="p-5"></td>
                                {items.map((item) => (
                                    <td key={item.id} className="p-5 text-center">
                                        <Link
                                            href={`/s/${slug}/products/${item.slug}`}
                                            className="inline-block w-full py-2.5 bg-[var(--primary-color)] hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all"
                                        >
                                            View Product
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
