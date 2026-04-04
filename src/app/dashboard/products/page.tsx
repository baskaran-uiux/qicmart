"use client"

import { useState, useEffect } from "react"
import { Search, Pencil, Trash2, Package, ChevronLeft, ChevronRight, Loader2, Check, AlertCircle, Star, Zap, Download, RefreshCw } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { useRouter } from "next/navigation"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion } from "framer-motion"
import { KpiCardSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    type: string // SIMPLE, VARIABLE
    price: number
    compareAtPrice: number | null
    stock: number
    isActive: boolean
    isBestSeller: boolean
    images: string
    sku: string | null
    categoryId: string | null
    attributes: string // JSON
    variations: string // JSON
    weight: number | null
    length: number | null
    width: number | null
    height: number | null
    category?: { name: string } | null
}

interface Category { id: string; name: string }

export default function ProductsPage() {
    const router = useRouter()
    const { currency, subscription, t } = useDashboardStore()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const [isBulkMode, setIsBulkMode] = useState(false)
    const [bulkStocks, setBulkStocks] = useState<Record<string, number>>({})

    const fetch_ = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const productsUrl = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"
            const categoriesUrl = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"

            const [pRes, cRes] = await Promise.all([
                fetch(productsUrl),
                fetch(categoriesUrl),
            ])

            if (!pRes.ok) throw new Error(`Products fetch failed: ${pRes.status}`)
            if (!cRes.ok) throw new Error(`Categories fetch failed: ${cRes.status}`)

            const [p, c] = await Promise.all([
                pRes.json(),
                cRes.json(),
            ])

            setProducts(Array.isArray(p) ? p : [])
            setCategories(Array.isArray(c) ? c : [])
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetch_() }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const openEdit = (p: Product) => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        router.push(ownerId ? `/dashboard/products/${p.id}/edit?ownerId=${ownerId}` : `/dashboard/products/${p.id}/edit`)
    }
    const openAdd = () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        router.push(ownerId ? `/dashboard/products/new?ownerId=${ownerId}` : `/dashboard/products/new`)
    }

    const confirmDelete = async () => {
        if (!productToDelete) return
        setDeleting(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/products?id=${productToDelete}&ownerId=${ownerId}` : `/api/dashboard/products?id=${productToDelete}`
            
            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                fetch_()
                setShowDeleteModal(false)
                setProductToDelete(null)
            }
        } catch (e) {
            console.error("Failed to delete product", e)
        }
        setDeleting(false)
    }

    const deleteProduct = (id: string) => {
        setProductToDelete(id)
        setShowDeleteModal(true)
    }

    const toggleBestSeller = async (p: Product) => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: p.id, isBestSeller: !p.isBestSeller }),
            })
            if (res.ok) {
                const newProducts = products.map(item => item.id === p.id ? { ...item, isBestSeller: !item.isBestSeller } : item)
                setProducts(newProducts)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const filtered = (Array.isArray(products) ? products : []).filter(p => 
        (p.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.sku?.toLowerCase() || "").includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    
    const isNormalPlan = true 
    const isAtLimit = false

    // KPI Calculations
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.isActive).length
    const activeRate = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0
    const lowStockProducts = products.filter(p => p.stock <= 5).length
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0)

    const handleExport = () => {
        if (products.length === 0) return
        
        const headers = ["ID", "Name", "SKU", "Price", "Stock", "Category", "Status", "Type"]
        const csvRows = products.map(p => [
            p.id,
            `"${p.name.replace(/"/g, '""')}"`,
            p.sku || "",
            p.price,
            p.stock,
            `"${(p.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
            p.isActive ? "Active" : "Draft",
            p.type
        ])

        const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const containerVariants: import("framer-motion").Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants: import("framer-motion").Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">{t("products")}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{products.length} {t("itemsInStore")}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => {
                            if (isBulkMode) {
                                setIsBulkMode(false)
                                setBulkStocks({})
                            } else {
                                setIsBulkMode(true)
                                const initial: Record<string, number> = {}
                                products.forEach(p => initial[p.id] = p.stock)
                                setBulkStocks(initial)
                            }
                        }}
                        className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 ${isBulkMode ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"} rounded-2xl text-[11px] font-bold capitalize flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap min-h-[46px]`}
                    >
                        <RefreshCw size={16} className={isBulkMode ? "animate-spin" : ""} /> 
                        <span>{isBulkMode ? t("cancelBulkEdit") : t("bulkStockEdit")}</span>
                    </button>
                    {isBulkMode && (
                        <button 
                            onClick={async () => {
                                try {
                                    const updates = Object.entries(bulkStocks).map(([id, stock]) => ({ id, stock }))
                                    const params = new URLSearchParams(window.location.search)
                                    const ownerId = params.get("ownerId")
                                    const url = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"
                                    const res = await fetch(url, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(updates)
                                    })
                                    if (res.ok) {
                                        fetch_()
                                        setIsBulkMode(false)
                                    }
                                } catch (error) {
                                    console.error("Bulk update failed:", error)
                                }
                            }}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-bold capitalize flex items-center justify-center gap-2 transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/20 whitespace-nowrap min-h-[46px]"
                        >
                            <Check size={16} /> <span>{t("applyChanges")}</span>
                        </button>
                    )}
                    <button 
                        onClick={handleExport}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-[11px] font-bold capitalize flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all whitespace-nowrap min-h-[46px]"
                    >
                        <Download size={16} /> <span>{t("export")}</span>
                    </button>
                    <PremiumButton 
                        onClick={() => openAdd()}
                        icon={Package}
                        className="min-h-[46px]"
                    >
                        {t("addProduct")}
                    </PremiumButton>
                </div>
            </div>

            {/* KPI Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {loading ? (
                    [...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)
                ) : (
                    <>
                        <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-zinc-400 capitalize">{t("totalProducts")}</p>
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Package size={16} className="text-blue-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-black dark:text-white">{totalProducts}</p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">{t("allProducts")}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-zinc-400 capitalize">{t("activeProducts")}</p>
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Check size={16} className="text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-black dark:text-white">{activeProducts}</p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">{activeRate}% active rate</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-zinc-400 capitalize">{t("lowStock")}</p>
                                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <AlertCircle size={16} className="text-amber-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-black dark:text-white">{lowStockProducts}</p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">{t("needRestocking")}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-zinc-400 capitalize">{t("totalValue")}</p>
                                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Zap size={16} className="text-purple-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-black dark:text-white">
                                {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">{t("inventoryValue")}</p>
                        </motion.div>
                    </>
                )}
            </motion.div>
            <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder={t("searchProducts")} 
                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm md:w-64" 
                />
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm pb-10">
                {loading ? (
                    <div className="p-4">
                        <TableSkeleton />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-zinc-100 dark:border-zinc-700 shadow-xl">
                            <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-slate-900 dark:text-zinc-400 font-bold text-xl">{t("noProductsFound")}</p>
                        <p className="text-zinc-500 text-sm mt-3">{t("startAddingProducts")}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <table className="w-full text-[12px] sm:text-[14px] text-left min-w-[800px]">
                            <thead className="bg-[#F8FAFC] dark:bg-zinc-950 text-[#334155] dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 sm:px-8 py-6 text-left">{t("product")}</th>
                                    <th className="px-6 py-6 text-left">{t("category")}</th>
                                    <th className="px-6 py-6 text-left">{t("price")}</th>
                                    <th className="px-6 py-6 text-left">{t("stock")}</th>
                                    <th className="px-6 py-6 text-left">{t("status")}</th>
                                    <th className="px-6 sm:px-8 py-6 text-right">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {paginatedProducts.map((p) => {
                                    const imgs = JSON.parse(p.images)
                                    return (
                                        <tr key={p.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                            <td className="px-6 sm:px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 transition-transform shrink-0">
                                                        {imgs[0] ? <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-400 text-2xl">📦</div>}
                                                    </div>
                                                    <span className="font-medium text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-none">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400 text-xs font-medium">{p.category?.name || "—"}</td>
                                            <td className="px-6 py-5 text-slate-900 dark:text-white font-bold text-lg tracking-tighter">
                                                {currency === "INR" ? "₹" : currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "USD" ? "$" : "₹"}{p.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-5">
                                                {isBulkMode ? (
                                                    <input 
                                                       type="number"
                                                       value={bulkStocks[p.id] ?? p.stock}
                                                       onChange={(e) => setBulkStocks(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                                                       className="w-24 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold outline-none ring-2 ring-indigo-500/20"
                                                    />
                                                ) : (
                                                    <span className={`text-[10px] font-bold capitalize px-3 py-1 rounded-full border whitespace-nowrap ${p.stock > 10 ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" : p.stock > 0 ? "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20" : "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20"}`}>{p.stock} {t("units")}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold capitalize shadow-sm ${p.isActive ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/10" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-700"}`}>{p.isActive ? t("active") : t("draft")}</span>
                                            </td>
                                            <td className="px-6 sm:px-8 py-5">
                                                <div className="flex items-center justify-end gap-3 transition-all">
                                                    <button 
                                                        onClick={() => toggleBestSeller(p)} 
                                                        className={`p-2.5 rounded-xl transition-all ${p.isBestSeller ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-zinc-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`} 
                                                        title="Toggle Best Seller"
                                                    >
                                                        <Star size={18} fill={p.isBestSeller ? "currentColor" : "none"} />
                                                    </button>

                                                    <button onClick={() => openEdit(p)} className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit"><Pencil size={18} /></button>
                                                    <button onClick={() => deleteProduct(p.id)} disabled={deletingId === p.id} className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
                                <div className="text-xs font-bold text-zinc-500">
                                    {t("showing")} <span className="text-black dark:text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> {t("to")} <span className="text-black dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> {t("of")} <span className="text-black dark:text-white font-bold">{filtered.length}</span> {t("products")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1.5 mx-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show only first, last, current, and surrounding pages
                                            if (
                                                pageNum === 1 || 
                                                pageNum === totalPages || 
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button 
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${currentPage === pageNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500"}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            }
                                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                return <span key={pageNum} className="text-zinc-400 font-bold px-1">...</span>
                                            }
                                            return null
                                        })}
                                    </div>

                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setProductToDelete(null)
                    }
                }}
                onConfirm={confirmDelete}
                loading={deleting}
                title={t("deleteProductTitle")}
                description={t("deleteProductDesc")}
            />
        </div>
    )
}
