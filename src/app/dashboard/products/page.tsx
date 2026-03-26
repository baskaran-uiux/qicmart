"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Package, LayoutGrid, List, ChevronLeft, ChevronRight, Loader2, X, Upload, Check, AlertCircle, Eye, Star, Image as ImageIcon, Zap, Download, RefreshCw } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion } from "framer-motion"

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
    const { currency, subscription } = useDashboardStore()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [editItem, setEditItem] = useState<Product | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewItem, setViewItem] = useState<Product | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [initialForm, setInitialForm] = useState<any>(null)
    const [lastSaved, setLastSaved] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const [isBulkMode, setIsBulkMode] = useState(false)
    const [bulkStocks, setBulkStocks] = useState<Record<string, number>>({})
    const [form, setForm] = useState({
        name: "", 
        description: "",
        type: "SIMPLE",
        price: "", 
        compareAtPrice: "", 
        stock: "", 
        sku: "",
        categoryId: "",
        isActive: true, 
        isBestSeller: false,
        imageUrl: "",
        gallery: [] as string[],
        attributes: [] as { name: string, values: string[] }[],
        variations: [] as any[],
        weight: "", length: "", width: "", height: "",
        seoTitle: "",
        seoDescription: "",
        focusKeyword: "",
        seoScore: 0,
    })

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

    useEffect(() => {
        const calculateScore = () => {
            let s = 0
            const title = form.seoTitle || form.name
            const desc = form.seoDescription || form.description
            const kw = form.focusKeyword.toLowerCase()

            if (kw) {
                s += 20
                if (title.toLowerCase().includes(kw)) s += 30
                if (desc.toLowerCase().includes(kw)) s += 20
            }
            if (title.length >= 40 && title.length <= 60) s += 15
            if (desc.length >= 120 && desc.length <= 160) s += 15
            
            setForm(f => ({ ...f, seoScore: s }))
        }
        calculateScore()
    }, [form.name, form.description, form.focusKeyword, form.seoTitle, form.seoDescription])

    const openEdit = (p: Product) => {
        setEditItem(p)
        let imgs: string[] = []
        try { imgs = JSON.parse(p.images) } catch { }
        
        let attrs = []
        try { attrs = JSON.parse(p.attributes || "[]") } catch { }
        
        let vars = []
        try { vars = JSON.parse(p.variations || "[]") } catch { }

        const initial = {
            name: p.name,
            description: p.description || "",
            type: p.type || "SIMPLE",
            price: String(p.price),
            compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
            stock: String(p.stock),
            sku: p.sku || "",
            categoryId: p.categoryId || "",
            isActive: p.isActive,
            isBestSeller: p.isBestSeller,
            imageUrl: imgs[0] || "",
            gallery: imgs,
            attributes: attrs,
            variations: vars,
            weight: p.weight ? String(p.weight) : "",
            length: p.length ? String(p.length) : "",
            width: p.width ? String(p.width) : "",
            height: p.height ? String(p.height) : "",
            seoTitle: (p as any).seoTitle || "",
            seoDescription: (p as any).seoDescription || "",
            focusKeyword: (p as any).focusKeyword || "",
            seoScore: (p as any).seoScore || 0,
        }
        setForm(initial)
        setInitialForm(initial)
        setIsDirty(false)
        setIsModalOpen(true)
    }
    const openAdd = () => {
        setEditItem(null)
        const initial = {
            name: "", description: "", type: "SIMPLE", price: "", compareAtPrice: "", stock: "", sku: "", 
            categoryId: "", isActive: true, isBestSeller: false, imageUrl: "", gallery: [], 
            attributes: [], variations: [], weight: "", length: "", width: "", height: "",
            seoTitle: "", seoDescription: "", focusKeyword: "", seoScore: 0,
        }
        setForm(initial)
        setInitialForm(initial)
        setIsDirty(false)
        setIsModalOpen(true)
    }

    const handleAutoSave = async () => {
        if (!editItem || !form.name.trim()) return
        
        // Check if actually changed from last initial form
        if (JSON.stringify(form) === JSON.stringify(initialForm)) return

        setSaving(true)
        const allImages = [...form.gallery]
        if (form.imageUrl && !allImages.includes(form.imageUrl)) {
            allImages.unshift(form.imageUrl)
        }
        const images = JSON.stringify(allImages)
        
        const formattedVariations = form.variations.map(v => ({
            ...v,
            price: parseFloat(String(v.price)) || 0,
            stock: parseInt(String(v.stock)) || 0
        }))

        const payload = {
            id: editItem.id,
            name: form.name,
            description: form.description,
            type: form.type,
            price: parseFloat(form.price) || 0,
            compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
            stock: parseInt(form.stock) || 0,
            sku: form.sku,
            images,
            attributes: JSON.stringify(form.attributes),
            variations: JSON.stringify(formattedVariations),
            categoryId: form.categoryId || null,
            weight: parseFloat(form.weight) || null,
            length: parseFloat(form.length) || null,
            width: parseFloat(form.width) || null,
            height: parseFloat(form.height) || null,
            isActive: form.isActive,
            isBestSeller: form.isBestSeller,
            seoTitle: form.seoTitle,
            seoDescription: form.seoDescription,
            focusKeyword: form.focusKeyword,
            seoScore: form.seoScore,
        }

        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setInitialForm({ ...form })
                setIsDirty(false)
                setLastSaved(new Date().toLocaleTimeString())
                // Optionally refresh list in background
                const pRes = await fetch(ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products")
                const pData = await pRes.json()
                setProducts(Array.isArray(pData) ? pData : [])
            }
        } catch (err) {
            console.error("Auto-save failed:", err)
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (!isModalOpen || !editItem) return
        
        const hasChanged = JSON.stringify(form) !== JSON.stringify(initialForm)
        setIsDirty(hasChanged)

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleAutoSave()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [form, isModalOpen, editItem])

    const generateVariations = () => {
        if (form.attributes.length === 0) return
        
        // Generate Cartesian product
        const generate = (index: number, current: any): any[] => {
            if (index === form.attributes.length) {
                // Check if this variation already exists to preserve its data
                const existing = form.variations.find(v => 
                    Object.entries(current).every(([name, value]) => v.options[name] === value)
                )

                return [{
                    sku: existing?.sku || `${form.sku}-${Object.values(current).join("-")}`,
                    price: existing?.price || form.price,
                    stock: existing?.stock || form.stock,
                    image: existing?.image || form.imageUrl,
                    options: { ...current }
                }]
            }
            
            const attribute = form.attributes[index]
            let results: any[] = []
            for (const val of attribute.values) {
                results = [...results, ...generate(index + 1, { ...current, [attribute.name]: val })]
            }
            return results
        }
        
        const newVariations = generate(0, {})
        setForm(f => ({ ...f, variations: newVariations }))
    }

    const handleVariationImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"
            const res = await fetch(url, { method: "POST", body: formData })
            const data = await res.json()
            if (data.url) {
                const newVars = [...form.variations]
                newVars[index].image = data.url
                setForm(f => ({ ...f, variations: newVars }))
            }
        } catch (err) {
            console.error(err)
            alert("Failed to upload image")
        }
        setUploading(false)
    }

    const save = async () => {
        if (!form.name.trim()) {
            alert("Product name is required")
            return
        }
        
        if (editItem) {
            await handleAutoSave()
            setIsModalOpen(false)
            return
        }

        setSaving(true)
        const allImages = [...form.gallery]
        if (form.imageUrl && !allImages.includes(form.imageUrl)) {
            allImages.unshift(form.imageUrl)
        }
        const images = JSON.stringify(allImages)
        
        const formattedVariations = form.variations.map(v => ({
            ...v,
            price: parseFloat(String(v.price)) || 0,
            stock: parseInt(String(v.stock)) || 0
        }))

        const payload = {
            name: form.name,
            description: form.description,
            type: form.type,
            price: parseFloat(form.price) || 0,
            compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
            stock: parseInt(form.stock) || 0,
            sku: form.sku,
            images,
            attributes: JSON.stringify(form.attributes),
            variations: JSON.stringify(formattedVariations),
            categoryId: form.categoryId || null,
            weight: parseFloat(form.weight) || null,
            length: parseFloat(form.length) || null,
            width: parseFloat(form.width) || null,
            height: parseFloat(form.height) || null,
            isActive: form.isActive,
            isBestSeller: form.isBestSeller,
            seoTitle: form.seoTitle,
            seoDescription: form.seoDescription,
            focusKeyword: form.focusKeyword,
            seoScore: form.seoScore,
        }

        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            setEditItem(null)
            fetch_()
            setIsModalOpen(false)
        }
        setSaving(false)
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

    const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"
            const res = await fetch(url, { method: "POST", body: formData })
            const data = await res.json()
            if (data.url) setForm(f => ({ ...f, imageUrl: data.url }))
        } catch (err) {
            console.error(err)
            alert("Failed to upload image")
        }
        setUploading(false)
    }

    const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setUploading(true)
        const uploadedUrls: string[] = []

        for (const file of files) {
            const formData = new FormData()
            formData.append("file", file)
            try {
                const params = new URLSearchParams(window.location.search)
                const ownerId = params.get("ownerId")
                const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"
                const res = await fetch(url, { method: "POST", body: formData })
                const data = await res.json()
                if (data.url) uploadedUrls.push(data.url)
            } catch (err) {
                console.error(err)
            }
        }

        setForm(f => ({ ...f, gallery: [...f.gallery, ...uploadedUrls] }))
        setUploading(false)
    }

    const filtered = (Array.isArray(products) ? products : []).filter(p => 
        (p.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.sku?.toLowerCase() || "").includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    
    const isNormalPlan = !subscription || subscription.plan === "Normal"
    const maxProducts = subscription?.maxProducts || 50
    const isAtLimit = isNormalPlan && products.length >= maxProducts

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
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
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Products</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{products.length} Items In Your Store. Manage your stock.</p>
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
                        className={`flex-1 sm:flex-none px-6 py-3.5 ${isBulkMode ? "bg-amber-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"} rounded-2xl text-[10px] font-bold capitalize flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95`}
                    >
                        <RefreshCw size={18} className={isBulkMode ? "animate-spin" : ""} /> {isBulkMode ? "Cancel Bulk Edit" : "Bulk Stock Edit"}
                    </button>
                    {isBulkMode && (
                        <button 
                            onClick={async () => {
                                setSaving(true)
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
                                } finally {
                                    setSaving(false)
                                }
                            }}
                            className="flex-1 sm:flex-none px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold capitalize flex items-center justify-center gap-2 transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/20"
                        >
                            <Check size={18} /> Apply Changes
                        </button>
                    )}
                    <button 
                        onClick={handleExport}
                        className="flex-1 sm:flex-none px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-[10px] font-bold capitalize flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                        <Download size={18} /> Export
                    </button>
                    <button 
                        onClick={() => {
                            if (isAtLimit && !editItem) {
                                alert(`You have reached the product limit (${maxProducts}) for your Normal plan. Please upgrade to Pro to add more.`);
                                return;
                            }
                            openAdd();
                        }}
                        className={`flex-1 sm:flex-none px-8 py-3.5 ${isAtLimit && !editItem ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-indigo-600 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95"} rounded-2xl text-[10px] font-bold capitalize flex items-center justify-center gap-2 shadow-xl transition-all shadow-indigo-500/10`}
                    >
                        <Package size={18} /> + Add Product {isAtLimit && !editItem && "🔒"}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 capitalize">Total Products</p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Package size={16} className="text-blue-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-black dark:text-white">{totalProducts}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">All products</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 capitalize">Active Products</p>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Check size={16} className="text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-black dark:text-white">{activeProducts}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">{activeRate}% active rate</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 capitalize">Low Stock</p>
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <AlertCircle size={16} className="text-amber-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-black dark:text-white">{lowStockProducts}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">Need restocking</p>
                </motion.div>
                <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 capitalize">Total Value</p>
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <Zap size={16} className="text-purple-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-black dark:text-white">
                        {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 capitalize">Inventory value</p>
                </motion.div>
            </motion.div>
            <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search products..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm md:w-64" 
                />
            </div>

            {/* Quick View Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-[70] bg-black/40 dark:bg-black/90 backdrop-blur-xl overflow-y-auto py-8 transition-all duration-500 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Quick View</h3>
                                <p className="text-zinc-400 text-sm mt-1">{viewItem.name}</p>
                            </div>
                            <button onClick={() => setViewItem(null)} className="p-3 text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"><X size={24} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Images */}
                                <div className="space-y-4">
                                    <div className="aspect-square rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                                        {JSON.parse(viewItem.images)[0] ? (
                                            <img src={JSON.parse(viewItem.images)[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <ImageIcon size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {JSON.parse(viewItem.images).map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800" />
                                        ))}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold capitalize tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">{viewItem.type}</span>
                                            {viewItem.isActive ? (
                                                <span className="text-[10px] font-bold capitalize tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">Active</span>
                                            ) : (
                                                <span className="text-[10px] font-bold capitalize tracking-wide px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-700">Draft</span>
                                            )}
                                        </div>
                                        <h4 className="text-3xl font-medium text-black dark:text-white">{viewItem.name}</h4>
                                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed">{viewItem.description || "No description provided."}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-semibold text-zinc-400 capitalize">Price</p>
                                            <p className="text-3xl font-bold text-black dark:text-white">
                                                {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{viewItem.price.toFixed(2)}
                                            </p>
                                        </div>
                                        {viewItem.compareAtPrice && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold text-zinc-400 capitalize">MRP</p>
                                                <p className="text-xl font-bold text-zinc-400 line-through">
                                                    {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{viewItem.compareAtPrice.toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700">
                                            <p className="text-[10px] font-semibold text-zinc-400 capitalize mb-1">Stock</p>
                                            <p className="text-lg font-bold text-black dark:text-white">{viewItem.stock} Units</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700">
                                            <p className="text-[10px] font-semibold text-zinc-400 capitalize mb-1">SKU</p>
                                            <p className="text-lg font-bold text-black dark:text-white truncate">{viewItem.sku || "—"}</p>
                                        </div>
                                    </div>

                                    {/* Logistics Read-only */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-semibold text-zinc-400 capitalize">Specifications</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-center">
                                                <p className="text-[8px] font-bold text-zinc-400 capitalize">WT</p>
                                                <p className="text-xs font-bold">{viewItem.weight || 0}kg</p>
                                            </div>
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-center">
                                                <p className="text-[8px] font-bold text-zinc-400 capitalize">L</p>
                                                <p className="text-xs font-bold">{viewItem.length || 0}cm</p>
                                            </div>
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-center">
                                                <p className="text-[8px] font-bold text-zinc-400 capitalize">W</p>
                                                <p className="text-xs font-bold">{viewItem.width || 0}cm</p>
                                            </div>
                                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-center">
                                                <p className="text-[8px] font-bold text-zinc-400 capitalize">H</p>
                                                <p className="text-xs font-bold">{viewItem.height || 0}cm</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attributes & Variations */}
                            {viewItem.type === "VARIABLE" && (
                                <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800 space-y-8">
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-black dark:text-white capitalize italic">Defined Attributes</h5>
                                        <div className="flex flex-wrap gap-3">
                                            {JSON.parse(viewItem.attributes).map((attr: any, i: number) => (
                                                <div key={i} className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                                    <p className="text-[10px] font-semibold text-zinc-400 capitalize mb-1">{attr.name}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(Array.isArray(attr.values) ? attr.values.flatMap((v: any) => typeof v === 'string' ? v.split('|') : [v]) : []).map((v: string, j: number) => (
                                                            <span key={j} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-md text-[10px] font-bold">{v}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-bold text-black dark:text-white capitalize italic">Variation Matrix</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {JSON.parse(viewItem.variations).map((v: any, i: number) => (
                                                <div key={i} className="p-4 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700 shadow-sm flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-100 dark:border-zinc-800 shrink-0">
                                                        {v.image && <img src={v.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-black dark:text-white capitalize truncate">{Object.values(v.options).join(" • ")}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 truncate tracking-tighter">{currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{v.price} • {v.stock} in stock</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 flex gap-4 shrink-0">
                            <button onClick={() => setViewItem(null)} className="flex-1 px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-bold capitalize text-[10px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Close</button>
                            <button 
                                onClick={() => {
                                    const p = viewItem;
                                    setViewItem(null);
                                    openEdit(p);
                                }} 
                                className="flex-1 px-8 py-4 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl font-bold capitalize text-[10px] shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Edit Product
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-[40px] w-full max-w-5xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white tracking-tighter italic">{editItem ? "Edit Product" : "New Product"}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-semibold capitalize mt-1">Configure your product listings accurately</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setForm(f => ({ ...f, isBestSeller: !f.isBestSeller }))} 
                                    className={`p-3 rounded-2xl transition-all ${form.isBestSeller ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                    title="Toggle Best Seller"
                                >
                                    <Star size={20} fill={form.isBestSeller ? "currentColor" : "none"} />
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"><X size={20} /></button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12 custom-scrollbar">
                            {/* Media Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize">Product Imagery</label>
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] space-y-6">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 rounded-[28px] bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                                            {form.imageUrl ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-zinc-300" />}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Paste image URL..." className="w-full px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold placeholder-zinc-400 outline-none focus:ring-2 focus:ring-black/5" />
                                            <div className="flex items-center gap-3">
                                                <label className="cursor-pointer">
                                                    <div className="px-6 py-2.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 flex items-center gap-2.5 text-[10px] font-bold capitalize transition-all shadow-indigo-500/10">
                                                        <Upload size={14} /> Upload Main
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageFile} />
                                                </label>
                                                <label className="cursor-pointer">
                                                    <div className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-zinc-200 flex items-center gap-2 text-[10px] font-bold capitalize">
                                                        + Gallery Photos
                                                    </div>
                                                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryFiles} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    {form.gallery.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            {form.gallery.map((img, i) => (
                                                <div key={i} className="relative group">
                                                    <img src={img} className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700" />
                                                    <button onClick={() => setForm(f => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }))} className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow-lg hover:scale-110 active:scale-95"><X size={10} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-2xl">
                                <button onClick={() => setForm(f => ({ ...f, type: "SIMPLE" }))} className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-bold capitalize transition-all ${form.type === "SIMPLE" ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-500"}`}>Simple</button>
                                <button onClick={() => { if (isNormalPlan) { alert("Variable products are available on Pro plan."); return; } setForm(f => ({ ...f, type: "VARIABLE" })) }} className={`flex-1 py-3 px-6 rounded-xl text-[10px] font-bold capitalize transition-all ${form.type === "VARIABLE" ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm" : "text-zinc-500"} ${isNormalPlan ? "opacity-50" : ""}`}>Variable {isNormalPlan && "🔒"}</button>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Product Name</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Classic Collection Tee" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Category</label>
                                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-6 py-[18px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold appearance-none outline-none">
                                        <option value="">Choose Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Description</label>
                                <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-medium min-h-[120px] resize-none outline-none" />
                            </div>

                            {/* Variable Product Configuration */}
                            {form.type === "VARIABLE" && (
                                <div className="space-y-12 animate-in slide-in-from-top-4 duration-500">
                                    {/* Attributes Management */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-bold text-black dark:text-white capitalize italic">Product Attributes</h4>
                                            <button 
                                                onClick={() => setForm(f => ({ ...f, attributes: [...f.attributes, { name: "", values: [] }] }))}
                                                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-bold capitalize border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 transition-all"
                                            >
                                                + Add Attribute
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {form.attributes.map((attr, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row gap-4 p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl relative group">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Attribute Name</label>
                                                        <input 
                                                            value={attr.name} 
                                                            onChange={e => {
                                                                const newAttrs = [...form.attributes]
                                                                newAttrs[i].name = e.target.value
                                                                setForm(f => ({ ...f, attributes: newAttrs }))
                                                            }}
                                                            placeholder="e.g. Color" 
                                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-[2] space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Values (Comma Separated)</label>
                                                        <input 
                                                            value={attr.values.join(", ")} 
                                                            onChange={e => {
                                                                const newAttrs = [...form.attributes]
                                                                newAttrs[i].values = e.target.value.split(",").map(v => v.trim()).filter(Boolean)
                                                                setForm(f => ({ ...f, attributes: newAttrs }))
                                                            }}
                                                            placeholder="Red, Blue, Green" 
                                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => setForm(f => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }))}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Generate Variations Button */}
                                        <button 
                                            onClick={generateVariations}
                                            className="w-full py-4 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-bold capitalize shadow-xl hover:scale-[1.01] active:scale-95 transition-all shadow-indigo-500/10"
                                        >
                                            Generate / Update Variation Matrix
                                        </button>
                                    </div>

                                    {/* Variation Matrix */}
                                    {form.variations.length > 0 && (
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold text-black dark:text-white capitalize italic">Variation Matrix</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {form.variations.map((v, i) => (
                                                    <div key={i} className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm">
                                                        {/* Variation Title & Image */}
                                                        <div className="flex items-center gap-4 lg:w-48 shrink-0">
                                                            <label className="relative group cursor-pointer w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                                                                {v.image ? (
                                                                    <img src={v.image} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                                        <Upload size={16} />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                    <Upload size={14} />
                                                                </div>
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariationImage(i, e)} />
                                                            </label>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-bold text-black dark:text-white capitalize truncate">
                                                                    {Object.values(v.options).join(" • ")}
                                                                </p>
                                                                <p className="text-[8px] font-semibold text-zinc-400 capitalize mt-0.5">Edit Variation Details</p>
                                                            </div>
                                                        </div>

                                                        {/* Variation Inputs */}
                                                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[8px] font-bold text-zinc-400 capitalize leading-none block">Price ({currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"})</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={v.price}
                                                                    onChange={e => {
                                                                        const newVars = [...form.variations]
                                                                        newVars[i].price = e.target.value
                                                                        setForm(f => ({ ...f, variations: newVars }))
                                                                    }}
                                                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black outline-none" 
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[8px] font-bold text-zinc-400 capitalize leading-none block">Stock</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={v.stock}
                                                                    onChange={e => {
                                                                        const newVars = [...form.variations]
                                                                        newVars[i].stock = e.target.value
                                                                        setForm(f => ({ ...f, variations: newVars }))
                                                                    }}
                                                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black outline-none" 
                                                                />
                                                            </div>
                                                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                                                <label className="text-[8px] font-bold text-zinc-400 capitalize leading-none block">SKU Override</label>
                                                                <input 
                                                                    value={v.sku}
                                                                    onChange={e => {
                                                                        const newVars = [...form.variations]
                                                                        newVars[i].sku = e.target.value
                                                                        setForm(f => ({ ...f, variations: newVars }))
                                                                    }}
                                                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black outline-none" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Simple Product Fields (Hidden if Variable) */}
                            {form.type === "SIMPLE" && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Pricing</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black">{currency === "INR" ? "₹" : currency === "USD" ? "$" : "₹"}</span>
                                                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-lg font-black outline-none" placeholder="0.00" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Regular MRP</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black">{currency === "INR" ? "₹" : currency === "USD" ? "$" : "₹"}</span>
                                                <input type="number" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-lg font-black outline-none" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Stock Inventory</label>
                                            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none" placeholder="0" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">SKU ID</label>
                                            <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none" placeholder="e.g. TEE-BLK-LG" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* SEO Section */}
                            <div className="space-y-8 pt-12 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[12px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Search size={16} /> Search Engine Optimization
                                    </h4>
                                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                        <Zap size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Score: {form.seoScore}/100</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">Focus Keyword</label>
                                            <input 
                                                value={form.focusKeyword} 
                                                onChange={e => setForm(f => ({ ...f, focusKeyword: e.target.value }))} 
                                                placeholder="e.g. running shoes" 
                                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">SEO Title</label>
                                            <input 
                                                value={form.seoTitle} 
                                                onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} 
                                                placeholder={form.name || "Custom SEO Title"} 
                                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-semibold outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2">SEO Description</label>
                                            <textarea 
                                                value={form.seoDescription} 
                                                onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} 
                                                placeholder={form.description || "Custom meta description..."} 
                                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-medium min-h-[100px] resize-none outline-none" 
                                            />
                                        </div>
                                    </div>

                                    {/* Google Preview */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-400 capitalize pl-2 flex items-center gap-2">
                                            Google Search Preview <Eye size={12} />
                                        </label>
                                        <div className="p-8 bg-white dark:bg-black rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-inner flex flex-col gap-1.5 group cursor-default">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400">G</div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] text-zinc-900 dark:text-zinc-200 font-medium">NamMart Standard Store</span>
                                                    <span className="text-[10px] text-zinc-500 font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">https://yourstore.com › products › {form.name.toLowerCase().replace(/\s+/g, '-')}</span>
                                                </div>
                                            </div>
                                            <h3 className="text-[18px] text-indigo-700 dark:text-indigo-400 font-medium hover:underline cursor-pointer transition-colors leading-tight">
                                                {form.seoTitle || form.name || "Product Name"}
                                            </h3>
                                            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                                {form.seoDescription || form.description || "Enter a description to see how your product will appear in Google search results."}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic font-medium px-2 leading-relaxed">
                                            *This is an approximate preview of how your product might appear in Google's search results.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics Section */}
                            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-black dark:text-white capitalize italic">Shipping Dimensions</h4>
                                    <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`px-5 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all ${form.isActive ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>{form.isActive ? "Public" : "Draft Mode"}</button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['Weight', 'Length', 'Width', 'Height'].map((l) => (
                                        <div key={l} className="space-y-2">
                                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">{l}</label>
                                            <input type="number" value={form[l.toLowerCase() as keyof typeof form] as string} onChange={e => setForm(f => ({ ...f, [l.toLowerCase()]: e.target.value }))} className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-black outline-none" placeholder="0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                            <div className="flex flex-col">
                                {saving ? (
                                    <div className="flex items-center gap-2 text-indigo-500">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Saving changes...</span>
                                    </div>
                                ) : lastSaved ? (
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <Check size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">All changes saved at {lastSaved}</span>
                                    </div>
                                ) : isDirty ? (
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <RefreshCw size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Unsaved changes</span>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsModalOpen(false)} className="px-0 py-4 text-zinc-400 hover:text-rose-500 font-bold capitalize text-[10px] transition-all">Discard Changes</button>
                                )}
                            </div>
                            <button onClick={save} disabled={saving || uploading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-semibold capitalize hover:opacity-90 transition-all shadow-xl shadow-indigo-500/10 active:scale-95 disabled:opacity-50">
                                {(saving || uploading) ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                {saving ? "Auto-saving..." : uploading ? "Uploading..." : editItem ? "Done & Sync" : "Publish to Store"}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Products Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm pb-10">
                {loading ? (
                    <div className="py-24 text-center text-zinc-400 font-medium">Gathering your products...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-zinc-100 dark:border-zinc-700 shadow-xl">
                            <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-slate-900 dark:text-zinc-400 font-bold text-xl">No products found</p>
                        <p className="text-zinc-500 text-sm mt-3">Start adding items to populate your store</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <table className="w-full text-[12px] sm:text-[14px] text-left min-w-[800px]">
                            <thead className="bg-[#F8FAFC] dark:bg-zinc-950 text-[#334155] dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 sm:px-8 py-6 text-left">Product</th>
                                    <th className="px-6 py-6 text-left">Category</th>
                                    <th className="px-6 py-6 text-left">Price</th>
                                    <th className="px-6 py-6 text-left">Stock</th>
                                    <th className="px-6 py-6 text-left">Status</th>
                                    <th className="px-6 sm:px-8 py-6 text-right">Actions</th>
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
                                                    <span className={`text-[10px] font-bold capitalize px-3 py-1 rounded-full border whitespace-nowrap ${p.stock > 10 ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" : p.stock > 0 ? "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20" : "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20"}`}>{p.stock} units</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold capitalize shadow-sm ${p.isActive ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/10" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-700"}`}>{p.isActive ? "Active" : "Draft"}</span>
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
                                                    <button onClick={() => setViewItem(p)} className="p-2.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Quick View"><Eye size={18} /></button>
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
                                    Showing <span className="text-black dark:text-white font-black">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-black dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-black dark:text-white font-black">{filtered.length}</span> products
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
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${currentPage === pageNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500"}`}
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
                title="Delete Product?"
                description="This product will be permanently removed from your inventory. This action cannot be undone."
            />
        </div>
    )
}
