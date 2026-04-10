"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Loader2, Check, Star, RefreshCw, AlertCircle, Upload, Zap, Eye, X, Image as ImageIcon, Package, Plus, Trash2, Sparkles } from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion, AnimatePresence } from "framer-motion"
import MediaPicker from "@/components/dashboard/MediaPicker"
import PremiumButton from "@/components/dashboard/PremiumButton"
import { toast } from "sonner"
import MagicStudioModal from "@/components/dashboard/MagicStudioModal"

interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    type: string
    price: number
    compareAtPrice: number | null
    stock: number
    isActive: boolean
    isBestSeller: boolean
    images: string
    sku: string | null
    categoryId: string | null
    attributes: string
    variations: string
    weight: number | null
    length: number | null
    width: number | null
    height: number | null
    seoTitle?: string
    seoDescription?: string
    focusKeyword?: string
    seoScore?: number
}

interface Category { id: string; name: string }

// --- Color Conversion Helpers (HSV Model) ---
const hexToHsv = (hex: string) => {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min
    let h = 0, s = max === 0 ? 0 : d / max, v = max
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return [h * 360, s * 100, v * 100]
}

const hsvToHex = (h: number, s: number, v: number) => {
    let r: number = 0, g: number = 0, b: number = 0
    h /= 360; s /= 100; v /= 100
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break
        case 1: r = q; g = v; b = p; break
        case 2: r = p; g = v; b = t; break
        case 3: r = p; g = q; b = v; break
        case 4: r = t; g = p; b = v; break
        case 5: r = v; g = p; b = q; break
    }
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

const ColorPicker = ({ color, onChange, onSelect, onClose }: { color: string, onChange: (hex: string) => void, onSelect: (hex: string) => void, onClose: () => void }) => {
    const [h, s, v] = hexToHsv(color || "#6366F1")
    const [hue, setHue] = useState(h)
    const [sat, setSat] = useState(s)
    const [val, setVal] = useState(v)

    const boxRef = useRef<HTMLDivElement>(null)
    const hueRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (color && color.toUpperCase() !== hsvToHex(hue, sat, val).toUpperCase()) {
            const [h, s, v] = hexToHsv(color)
            setHue(h)
            setSat(s)
            setVal(v)
        }
    }, [color])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onSelect(hsvToHex(hue, sat, val))
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [hue, sat, val, onSelect])

    const handleBoxMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!boxRef.current) return
        const rect = boxRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
        const newSat = x * 100
        const newVal = (1 - y) * 100
        setSat(newSat)
        setVal(newVal)
        onChange(hsvToHex(hue, newSat, newVal))
    }, [hue, onChange])

    const handleHueMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!hueRef.current) return
        const rect = hueRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const newHue = x * 360
        setHue(newHue)
        onChange(hsvToHex(newHue, sat, val))
    }, [sat, val, onChange])

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onSelect(hsvToHex(hue, sat, val))
            }
        }
        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [hue, sat, val, onSelect])

    useEffect(() => {
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleBoxMove as any)
            window.removeEventListener('mousemove', handleHueMove as any)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleBoxMove as any)
            window.removeEventListener('mousemove', handleHueMove as any)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [handleBoxMove, handleHueMove])

    const presets = ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0088FF", "#0000FF", "#8800FF", "#FF00FF", "#000000", "#FFFFFF"]

    return (
        <div ref={containerRef} className="absolute z-[100] mt-2 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-[280px] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Color Picker</span>
                <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={14} /></button>
            </div>

            <div 
                ref={boxRef}
                onMouseDown={(e) => {
                    handleBoxMove(e)
                    window.addEventListener('mousemove', handleBoxMove)
                    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', handleBoxMove))
                }}
                className="relative w-full h-40 rounded-xl overflow-hidden cursor-crosshair mb-4"
                style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div 
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 translate-y-1/2"
                    style={{ left: `${sat}%`, bottom: `${val}%` }}
                />
            </div>

            <div 
                ref={hueRef}
                onMouseDown={(e) => {
                    handleHueMove(e)
                    window.addEventListener('mousemove', handleHueMove)
                    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', handleHueMove))
                }}
                className="relative h-4 w-full rounded-full cursor-pointer mb-6"
                style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            >
                <div 
                    className="absolute w-5 h-5 bg-white border-2 border-zinc-200 dark:border-zinc-700 rounded-full shadow-md -top-0.5 transform -translate-x-1/2"
                    style={{ left: `${(hue / 360) * 100}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Hex Code</label>
                    <input 
                        value={color} 
                        onChange={e => onChange(e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase"
                    />
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                    {presets.map(p => (
                        <button 
                            key={p} 
                            onClick={() => onChange(p)}
                            className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                            style={{ backgroundColor: p }}
                        />
                    ))}
                </div>
            </div>
            
            <button 
                onClick={() => onSelect(hsvToHex(hue, sat, val))}
                className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
                Done Selection
            </button>
        </div>
    )
}

interface ProductEditorProps {
    productId?: string
}

export default function ProductEditor({ productId }: ProductEditorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const { id: storeId, currency, subscription, aiCredits, updateCredits } = useDashboardStore()
    
    const TABS = [
        { id: "general", label: "General Information" },
        { id: "pricing", label: "Pricing & Value" },
        { id: "inventory", label: "Inventory & Stock" },
        { id: "content", label: "Rich Content" },
        { id: "variants", label: "Product Options" },
        { id: "advanced", label: "Search & Advanced" }
    ]

    const [loading, setLoading] = useState(!!productId)
    const [categories, setCategories] = useState<Category[]>([])
    const [activeTab, setActiveTab] = useState("general")
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSaved, setLastSaved] = useState<string | null>(null)
    const [initialForm, setInitialForm] = useState<any>(null)
    const [pickingColor, setPickingColor] = useState("#6366F1")

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
        shippingProfileId: "",
    })

    const [isGenerating, setIsGenerating] = useState<string | null>(null)
    const [showMagicStudio, setShowMagicStudio] = useState(false)

    const generateAIContent = async (field: 'description' | 'seo' | 'seoTitle' | 'keywords') => {
        if (!form.name.trim()) {
            toast.error("Please enter a product name first")
            return
        }
        if (aiCredits <= 0) {
            toast.error("Insufficient AI credits")
            return
        }

        setIsGenerating(field)
        try {
            let aiType = "product"
            let localPrompt = ""

            if (field === 'description') {
                aiType = "product"
                localPrompt = `Write a detailed, high-converting product description for "${form.name}".`
            } else if (field === 'seoTitle') {
                aiType = "seoTitle"
                localPrompt = `Generate a compelling meta title for "${form.name}".`
            } else if (field === 'seo') {
                aiType = "seoDescription"
                localPrompt = `Generate a high-CTR meta description for "${form.name}".`
            } else if (field === 'keywords') {
                aiType = "keywords"
                localPrompt = `Provide comma-separated focus keywords for "${form.name}".`
            }

            const res = await fetch(`/api/ai?storeId=${storeId}&type=${aiType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: localPrompt,
                    context: { productName: form.name, category: categories.find(c => c.id === form.categoryId)?.name }
                })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            if (field === 'description') {
                setForm(f => ({ ...f, description: data.response }))
            } else if (field === 'seo') {
                setForm(f => ({ ...f, seoDescription: data.response }))
            } else if (field === 'seoTitle') {
                setForm(f => ({ ...f, seoTitle: data.response }))
            } else if (field === 'keywords') {
                setForm(f => ({ ...f, focusKeyword: data.response }))
            }
            
            // Update credits in real-time
            if (data.creditsRemaining !== undefined) {
                updateCredits(data.creditsRemaining)
            }

            toast.success("AI content generated!")
        } catch (err: any) {
            toast.error(err.message || "AI generation failed")
        } finally {
            setIsGenerating(null)
        }
    }

    const [shippingProfiles, setShippingProfiles] = useState<{id: string, name: string, isDefault: boolean}[]>([])

    const [picker, setPicker] = useState<{ open: boolean, field: 'cover' | 'gallery' | 'variation', variationIndex?: number }>({
        open: false,
        field: 'cover'
    })


    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesUrl = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"
                const cRes = await fetch(categoriesUrl)
                const cData = await cRes.json()
                setCategories(Array.isArray(cData) ? cData : [])

                const profilesUrl = ownerId ? `/api/dashboard/shipping/profiles?ownerId=${ownerId}` : "/api/dashboard/shipping/profiles"
                const sRes = await fetch(profilesUrl)
                const sData = await sRes.json()
                setShippingProfiles(Array.isArray(sData) ? sData : [])

                if (productId) {
                    const productUrl = ownerId ? `/api/dashboard/products?id=${productId}&ownerId=${ownerId}` : `/api/dashboard/products?id=${productId}`
                    const pRes = await fetch(productUrl)
                    const p = await pRes.json()
                    
                    if (p) {
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
                            seoTitle: p.seoTitle || "",
                            seoDescription: p.seoDescription || "",
                            focusKeyword: p.focusKeyword || "",
                            seoScore: p.seoScore || 0,
                            shippingProfileId: p.shippingZoneId || "",
                        }
                        setForm(initial)
                        setInitialForm(initial)
                    }
                } else {
                    const initial = { ...form }
                    setInitialForm(initial)
                }
            } catch (error) {
                console.error("Failed to fetch editor data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [productId, ownerId])

    useEffect(() => {
        const calculateScore = () => {
            let s = 0
            const title = (form.seoTitle || form.name).toLowerCase()
            const desc = (form.seoDescription || form.description).toLowerCase()
            const keywordList = form.focusKeyword.toLowerCase().split(',').map(k => k.trim()).filter(k => k)
            
            if (keywordList.length > 0) {
                s += 20 // Base score for having keywords
                
                const primaryKeyword = keywordList[0]
                
                // Check primary keyword presence
                if (title.includes(primaryKeyword)) s += 30
                if (desc.includes(primaryKeyword)) s += 20
                
                // Bonus for other keywords
                const otherKeywords = keywordList.slice(1)
                const secondaryMatch = otherKeywords.some(k => title.includes(k) || desc.includes(k))
                if (secondaryMatch) s += 5
            }

            // Length optimizations
            const titleLen = (form.seoTitle || form.name).length
            const descLen = (form.seoDescription || form.description).length

            if (titleLen >= 30 && titleLen <= 65) s += 15
            if (descLen >= 100 && descLen <= 170) s += 10
            
            setForm(f => ({ ...f, seoScore: Math.min(100, s) }))
        }
        calculateScore()
    }, [form.name, form.description, form.focusKeyword, form.seoTitle, form.seoDescription])

    const handleAutoSave = async () => {
        if (!productId || !form.name.trim()) return
        if (JSON.stringify(form) === JSON.stringify(initialForm)) return

        setSaving(true)
        // CRITICAL SYNC: Ensure imageUrl is ALWAYS at images[0]
        let allImages = [...form.gallery]
        if (form.imageUrl) {
            allImages = [form.imageUrl, ...allImages.filter(img => img !== form.imageUrl)]
        }
        const images = JSON.stringify(allImages)
        
        const formattedVariations = form.variations.map(v => ({
            ...v,
            price: parseFloat(String(v.price)) || 0,
        }))
        
        const payload = {
            id: productId,
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
            shippingZoneId: form.shippingProfileId || null,
        }

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
            }
        } catch (err) {
            console.error("Auto-save failed:", err)
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (!productId) return
        const hasChanged = JSON.stringify(form) !== JSON.stringify(initialForm)
        setIsDirty(hasChanged)

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleAutoSave()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [form, productId])

    useEffect(() => {
        if (form.type === "VARIABLE") {
            generateVariations()
        }
    }, [form.attributes])

    const save = async () => {
        if (!form.name.trim()) {
            toast.error("Product name is required to save")
            return
        }
        
        if (productId) {
            await handleAutoSave()
            router.push(ownerId ? `/dashboard/products?ownerId=${ownerId}` : "/dashboard/products")
            return
        }

        setSaving(true)
        // CRITICAL SYNC: Ensure imageUrl is ALWAYS at images[0]
        let allImages = [...form.gallery]
        if (form.imageUrl) {
            allImages = [form.imageUrl, ...allImages.filter(img => img !== form.imageUrl)]
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
            shippingZoneId: form.shippingProfileId || null,
        }

        const url = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                router.push(ownerId ? `/dashboard/products?ownerId=${ownerId}` : "/dashboard/products")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const generateVariations = () => {
        if (form.attributes.length === 0) {
            setForm(f => ({ ...f, variations: [] }))
            return
        }
        const generate = (index: number, current: any): any[] => {
            if (index === form.attributes.length) {
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

    const currentTabIndex = TABS.findIndex(t => t.id === activeTab)
    const nextTab = () => {
        if (currentTabIndex < TABS.length - 1) {
            setActiveTab(TABS[currentTabIndex + 1].id)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }
    const prevTab = () => {
        if (currentTabIndex > 0) {
            setActiveTab(TABS[currentTabIndex - 1].id)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }


    const handlePickGallery = (urls: string[]) => {
        setForm(f => ({ ...f, gallery: [...f.gallery, ...urls] }))
    }

    const handlePickVariation = (url: string) => {
        if (picker.variationIndex !== undefined) {
            const newVars = [...form.variations]
            newVars[picker.variationIndex].image = url
            setForm(f => ({ ...f, variations: newVars }))
        }
    }


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
                <p className="text-zinc-500 font-bold text-sm">Preparing workspace...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
            {/* Premium Header - Page Style */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm mb-8 transition-all">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => router.push(ownerId ? `/dashboard/products?ownerId=${ownerId}` : "/dashboard/products")}
                        className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-zinc-500 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">{productId ? "Edit Product" : "Create Product"}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold capitalize mt-1">Fill in the details to {productId ? "update" : "list"} your product</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:flex md:items-center gap-3 sm:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-zinc-400 border border-zinc-100 dark:border-zinc-800 justify-center">
                        {saving ? (
                            <>
                                <Loader2 size={12} className="animate-spin text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Auto-saving</span>
                            </>
                        ) : lastSaved ? (
                            <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Saved</span>
                            </>
                        ) : isDirty ? (
                            <>
                                <RefreshCw size={12} className="text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Unsaved</span>
                            </>
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Synced</span>
                        )}
                    </div>

                    <button 
                        onClick={() => setForm(f => ({ ...f, isBestSeller: !f.isBestSeller }))} 
                        className={`py-3 rounded-2xl transition-all border flex items-center justify-center gap-2 ${form.isBestSeller ? "text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20" : "text-zinc-400 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                        title="Toggle Best Seller"
                    >
                        <Star size={16} fill={form.isBestSeller ? "currentColor" : "none"} />
                        <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Best Seller</span>
                    </button>

                    <button 
                        onClick={() => router.push(ownerId ? `/dashboard/products?ownerId=${ownerId}` : "/dashboard/products")}
                        className="py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-[11px] font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm text-center"
                    >
                        Cancel
                    </button>

                    <PremiumButton 
                        onClick={save}
                        disabled={saving || uploading}
                        isLoading={saving}
                        className="!py-3 !px-4 w-full"
                        icon={Check}
                    >
                        {productId ? "Update" : "Save"}
                    </PremiumButton>
                </div>
            </div>

            {/* Main Editor Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
                {/* Internal Tabs - Optimized for Mobile */}
                <div className="px-5 sm:px-8 pt-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-6 sm:gap-10 pb-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 sm:py-5 text-[12px] sm:text-[14px] font-bold capitalize whitespace-nowrap border-b-2 transition-all ${
                                    activeTab === tab.id 
                                    ? "border-indigo-600 text-indigo-600" 
                                    : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="block sm:hidden h-1.5 w-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentTabIndex + 1) / TABS.length) * 100}%` }}
                        className="h-full bg-indigo-600"
                    />
                    <div className="px-6 py-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <span>Phase {currentTabIndex + 1} of {TABS.length}</span>
                        <span className="text-indigo-600">{Math.round(((currentTabIndex + 1) / TABS.length) * 100)}% Complete</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 sm:p-12 bg-zinc-50/50 dark:bg-zinc-950/30">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-5xl mx-auto"
                        >
                            {activeTab === "general" && (
                                <div className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                            <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Product Information</h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Product Name</label>
                                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Wait, what are you selling?" className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize">Product Description</label>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => generateAIContent('description')}
                                                            disabled={!!isGenerating}
                                                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                                        >
                                                            {isGenerating === 'description' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} fill="currentColor" />}
                                                            Generate with AI
                                                        </button>
                                                        {form.description && (
                                                            <button 
                                                                onClick={() => {
                                                                    if (productId) {
                                                                        handleAutoSave()
                                                                        toast.success("Description Saved!")
                                                                    } else {
                                                                        save()
                                                                    }
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                                            >
                                                                Quick Save
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell your customers more about this product..." className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm min-h-[250px] resize-none" />
                                            </div>
                                            
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">SKU (Stock Keeping Unit)</label>
                                                    <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. TEE-BLK-LG" className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Category</label>
                                                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-6 py-[18px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-semibold appearance-none outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm">
                                                        <option value="">Choose Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Product Tax (%)</label>
                                                    <select className="w-full px-6 py-[18px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-semibold appearance-none outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm">
                                                        <option value="0">Zero Tax (0%)</option>
                                                        <option value="5">GST (5%)</option>
                                                        <option value="12">GST (12%)</option>
                                                        <option value="18">GST (18%)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                                            <h4 className="text-[18px] font-black text-black dark:text-white uppercase tracking-tight">Product Imagery</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                 <div className="flex items-center justify-between ml-1">
                                                     <label className="text-[12px] font-bold text-zinc-400 capitalize">Cover Image</label>
                                                     {form.imageUrl && (
                                                         <button 
                                                             onClick={() => setShowMagicStudio(true)}
                                                             className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                                                         >
                                                             <Sparkles size={10} fill="currentColor" />
                                                             Magic Studio
                                                         </button>
                                                     )}
                                                 </div>
                                                <div className="relative group overflow-hidden rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 aspect-video flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-50/10 shadow-sm">
                                                    {form.imageUrl ? (
                                                        <>
                                                            <img src={form.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                <label className="cursor-pointer p-4 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-2xl">
                                                                    <Upload size={20} />
                                                                </label>
                                                                <button onClick={() => setForm(f => ({ ...f, imageUrl: "" }))} className="p-4 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-2xl"><X size={20} /></button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-300 group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-black text-black dark:text-white">Select from Library</p>
                                                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">PNG, JPG or WebP (Max 5MB)</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => setPicker({ open: true, field: 'cover' })}
                                                                className="absolute inset-0 cursor-pointer z-10"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Gallery Images</label>
                                                <div className="relative group overflow-hidden rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[300px] flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-50/10 shadow-sm">
                                                    {form.gallery.length > 0 ? (
                                                        <div className="w-full p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                            {form.gallery.map((img, i) => (
                                                                <div key={i} className="relative aspect-square rounded-[28px] overflow-hidden border border-zinc-100 dark:border-zinc-800 group/item shadow-md hover:shadow-xl transition-all hover:scale-[1.02]">
                                                                    <img src={img} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const deletedUrl = form.gallery[i]
                                                                                setForm(f => ({ 
                                                                                    ...f, 
                                                                                    gallery: f.gallery.filter((_, idx) => idx !== i),
                                                                                    // If the deleted image was the cover, clear the cover too
                                                                                    imageUrl: f.imageUrl === deletedUrl ? "" : f.imageUrl
                                                                                }))
                                                                            }}
                                                                            className="p-3 bg-white text-rose-500 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all"
                                                                        >
                                                                            <X size={20} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <button 
                                                                onClick={() => setPicker({ open: true, field: 'gallery' })}
                                                                className="aspect-square rounded-[28px] bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-all gap-2"
                                                            >
                                                                <Plus size={24} className="text-indigo-500" />
                                                                <span className="text-[10px] font-black uppercase text-zinc-400">Add More</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-300 group-hover:scale-110 transition-transform"><ImageIcon size={32} /></div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-black text-black dark:text-white">Add product gallery</p>
                                                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">Select existing or new images</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => setPicker({ open: true, field: 'gallery' })}
                                                                className="absolute inset-0 cursor-pointer z-10"
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "pricing" && (
                                <div className="space-y-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                            <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Pricing Information</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Current Sale Price</label>
                                                <div className="relative group">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xl">{currency === "INR" ? "₹" : "$"}</span>
                                                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full pl-14 pr-8 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Regular MRP (Comparison)</label>
                                                <div className="relative group">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xl">{currency === "INR" ? "₹" : "$"}</span>
                                                    <input type="number" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} className="w-full pl-14 pr-8 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm text-zinc-400" placeholder="0.00" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 sm:p-8 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-[32px] sm:rounded-[40px] flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl text-amber-500 shadow-sm flex-shrink-0 animate-pulse">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h5 className="text-[14px] sm:text-[16px] font-black text-amber-900 dark:text-amber-400">Pricing Strategy Tip</h5>
                                            <p className="text-[12px] sm:text-[13px] text-amber-800/80 dark:text-amber-400/60 mt-1.5 sm:mt-2 leading-relaxed font-bold">
                                                Setting a regular MRP higher than your Sale Price creates a <span className="text-amber-600 dark:text-amber-500 underline decoration-2 underline-offset-2">"Discount"</span> psychological trigger. This simple tactic can increase checkout conversions by up to 34%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "inventory" && (
                                <div className="space-y-12">
                                     <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                            <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Stock & Shipping</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Quantity in Stock</label>
                                                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" placeholder="0" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Product SKU</label>
                                                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" placeholder="e.g. SKU-001" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Shipping Profile</label>
                                                <select 
                                                    value={form.shippingProfileId} 
                                                    onChange={e => setForm(f => ({ ...f, shippingProfileId: e.target.value }))}
                                                    className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-semibold appearance-none outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                                                >
                                                    <option value="">General Shipping</option>
                                                    {shippingProfiles.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} {p.isDefault ? "(General)" : ""}
                                                         </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-zinc-400 font-medium ml-2 italic">Groups this product with others for specific shipping rates.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h4 className="text-[12px] font-bold text-zinc-400 capitalize tracking-wide italic ml-1">Physical Package Dimensions</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                            {[
                                                { key: 'weight', label: 'Weight', unit: 'kg' },
                                                { key: 'length', label: 'Length', unit: 'cm' },
                                                { key: 'width', label: 'Width', unit: 'cm' },
                                                { key: 'height', label: 'Height', unit: 'cm' }
                                            ].map((dim) => (
                                                <div key={dim.key} className="space-y-3">
                                                    <label className="text-[11px] font-bold text-zinc-400 capitalize ml-1">{dim.label} ({dim.unit})</label>
                                                    <input type="number" value={form[dim.key as keyof typeof form] as string} onChange={e => setForm(f => ({ ...f, [dim.key]: e.target.value }))} className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm" placeholder="0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "content" && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                        <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Product Storytelling</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[12px] font-bold text-zinc-400 capitalize ml-1">Detailed Description / Specifications</label>
                                        <textarea 
                                            value={form.description || ""} 
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                                            placeholder="Tell your customers about the magic of this product..." 
                                            className="w-full px-8 py-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[48px] text-[15px] font-medium min-h-[500px] resize-none outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all leading-relaxed shadow-inner" 
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === "variants" && (
                                <div className="space-y-12">
                                    {form.type !== "VARIABLE" ? (
                                        <div className="py-32 flex flex-col items-center justify-center text-center space-y-8">
                                            <div className="p-10 bg-indigo-50 dark:bg-indigo-500/5 rounded-[48px] text-indigo-600 shadow-xl shadow-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 relative">
                                                <Zap size={64} fill="currentColor" className="opacity-20" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Plus size={32} className="text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="max-w-md">
                                                <h5 className="text-xl font-bold text-black dark:text-white tracking-tight">Enable Product Variations</h5>
                                                <p className="text-[13px] text-zinc-500 mt-3 font-semibold leading-relaxed">Boost your sales by offering different sizes, colors, or materials. Enabling variations will allow you to define multiple options for this product.</p>
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                                                    <button 
                                                        onClick={() => setForm(f => ({ ...f, type: "VARIABLE" }))} 
                                                        className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Enable Variations Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-12">

                                            <div className="space-y-10">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                                        <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Add Variants</h4>
                                                    </div>
                                                    <button 
                                                        onClick={() => setForm(f => ({ ...f, attributes: [...f.attributes, { name: "", values: [] }] }))}
                                                        className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[12px] font-bold capitalize border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <Plus size={16} /> Add Another Option
                                                    </button>
                                                </div>

                                                <div className="space-y-8">
                                                    {form.attributes.map((attr, i) => (
                                                        <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-6 items-end p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-sm group relative">
                                                            <div className="space-y-3">
                                                                <label className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                                                                    Option name <span className="text-rose-500">*</span>
                                                                </label>
                                                                <div className="relative">
                                                                    <select 
                                                                        value={["Size", "Color Picker"].includes(attr.name) ? attr.name : "Custom"}
                                                                        onChange={e => {
                                                                            const val = e.target.value
                                                                            const newAttrs = [...form.attributes]
                                                                            newAttrs[i].name = val === "Custom" ? "" : val
                                                                            newAttrs[i].values = []
                                                                            setForm(f => ({ ...f, attributes: newAttrs }))
                                                                        }}
                                                                        className="w-full px-5 py-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="Size">Size</option>
                                                                        <option value="Color Picker">Color Picker</option>
                                                                        <option value="Custom">Custom</option>
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                                                        <ChevronLeft size={16} className="-rotate-90" />
                                                                    </div>
                                                                </div>
                                                                {!["Size", "Color Picker"].includes(attr.name) && (
                                                                    <input 
                                                                        value={attr.name} 
                                                                        onChange={e => {
                                                                            const newAttrs = [...form.attributes]
                                                                            newAttrs[i].name = e.target.value
                                                                            setForm(f => ({ ...f, attributes: newAttrs }))
                                                                        }}
                                                                        placeholder="Attribute Name..." 
                                                                        className="mt-2 w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                                                                    Option values <span className="text-rose-500">*</span>
                                                                </label>
                                                                <div 
                                                                    onClick={(e) => {
                                                                        if (e.target === e.currentTarget) {
                                                                            const input = e.currentTarget.querySelector('input')
                                                                            if (input) input.focus()
                                                                        }
                                                                    }}
                                                                    className="flex flex-wrap gap-2 p-2 min-h-[58px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all cursor-text"
                                                                >
                                                                    {attr.values.map((val, vIdx) => (
                                                                        <span key={vIdx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                                                                            {val.startsWith('#') && (
                                                                                <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: val }} />
                                                                            )}
                                                                            {val}
                                                                            <button 
                                                                                onClick={() => {
                                                                                    const newAttrs = [...form.attributes]
                                                                                    newAttrs[i].values = newAttrs[i].values.filter((_, idx) => idx !== vIdx)
                                                                                    setForm(f => ({ ...f, attributes: newAttrs }))
                                                                                }}
                                                                                className="text-zinc-400 hover:text-rose-500 transition-colors"
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                    <div className="flex-1 flex items-center min-w-[200px]">
                                                                        <input 
                                                                            onFocus={() => {
                                                                                if (attr.name === "Color Picker") {
                                                                                    const updated = [...form.attributes]
                                                                                    ;(updated[i] as any).isPicking = true
                                                                                    setForm(f => ({ ...f, attributes: updated }))
                                                                                }
                                                                            }}
                                                                            onKeyDown={e => {
                                                                                if (e.key === 'Enter' || e.key === ',') {
                                                                                    e.preventDefault()
                                                                                    const val = (e.target as HTMLInputElement).value.trim()
                                                                                    if (val && !attr.values.includes(val)) {
                                                                                        const newAttrs = [...form.attributes]
                                                                                        newAttrs[i].values = [...newAttrs[i].values, val]
                                                                                        setForm(f => ({ ...f, attributes: newAttrs }))
                                                                                        ;(e.target as HTMLInputElement).value = ''
                                                                                    }
                                                                                }
                                                                            }}
                                                                            placeholder={attr.values.length === 0 ? (attr.name === "Color Picker" ? "Pick colors..." : "e.g. Small, Medium (Press Enter)") : "Add more..."}
                                                                            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold px-3 py-2 text-black dark:text-white"
                                                                        />
                                                                        {(attr as any).isPicking && attr.name === "Color Picker" && (
                                                                            <ColorPicker 
                                                                                color={pickingColor}
                                                                                onChange={setPickingColor} 
                                                                                onClose={() => {
                                                                                    const updated = [...form.attributes]
                                                                                    ;(updated[i] as any).isPicking = false
                                                                                    setForm(f => ({ ...f, attributes: updated }))
                                                                                }}
                                                                                onSelect={(hex) => {
                                                                                    const newAttrs = [...form.attributes]
                                                                                    if (!attr.values.includes(hex)) {
                                                                                        newAttrs[i].values = [...newAttrs[i].values, hex]
                                                                                    }
                                                                                    ;(newAttrs[i] as any).isPicking = false
                                                                                    setForm(f => ({ ...f, attributes: newAttrs }))
                                                                                    setPickingColor(hex)
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => setForm(f => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }))}
                                                                className="p-4 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all h-[58px] flex items-center justify-center"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                            </div>

                                            {form.variations.length > 0 && (
                                                <div className="space-y-8 pt-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                                                        <h4 className="text-[18px] font-black text-black dark:text-white uppercase tracking-tight">Variation Matrix ({form.variations.length})</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {form.variations.map((v, i) => (
                                                            <div key={i} className="flex flex-col lg:flex-row lg:items-center gap-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] shadow-sm hover:shadow-md transition-all group">
                                                                <div className="flex items-center gap-6 lg:w-64 shrink-0">
                                                                    <div 
                                                                        onClick={() => setPicker({ open: true, field: 'variation', variationIndex: i })}
                                                                        className="relative group cursor-pointer w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden border border-zinc-100 dark:border-zinc-700 shrink-0"
                                                                    >
                                                                        {v.image ? (
                                                                            <img src={v.image} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                                                <Upload size={20} />
                                                                            </div>
                                                                        )}
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                                            <Upload size={16} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[13px] font-black text-black dark:text-white capitalize truncate mb-1">
                                                                            {Object.values(v.options).join(" • ")}
                                                                        </p>
                                                                        <p className="text-[10px] font-bold text-zinc-400 capitalize tracking-widest tracking-normal">Variation SKU: {v.sku || "—"}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Price</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={v.price}
                                                                            onChange={e => {
                                                                                const newVars = [...form.variations]
                                                                                newVars[i].price = e.target.value
                                                                                setForm(f => ({ ...f, variations: newVars }))
                                                                            }}
                                                                            className="w-full px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Stock</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={v.stock}
                                                                            onChange={e => {
                                                                                const newVars = [...form.variations]
                                                                                newVars[i].stock = e.target.value
                                                                                setForm(f => ({ ...f, variations: newVars }))
                                                                            }}
                                                                            className="w-full px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                                                        />
                                                                    </div>
                                                                     <div className="space-y-2 col-span-2 lg:col-span-1">
                                                                        <div className="text-[10px] font-bold text-zinc-400 capitalize block ml-1 flex items-center justify-between">
                                                                            <span>SKU</span>
                                                                            <button onClick={() => {
                                                                                 const newVars = [...form.variations]
                                                                                 newVars[i].sku = `${form.sku}-${Object.values(v.options).join("-").toUpperCase()}`
                                                                                 setForm(f => ({ ...f, variations: newVars }))
                                                                            }} className="text-[8px] text-indigo-500 font-black tracking-widest">AUTO</button>
                                                                        </div>
                                                                        <input 
                                                                            value={v.sku}
                                                                            onChange={e => {
                                                                                const newVars = [...form.variations]
                                                                                newVars[i].sku = e.target.value
                                                                                setForm(f => ({ ...f, variations: newVars }))
                                                                            }}
                                                                            className="w-full px-6 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                                                        />
                                                                        <button onClick={() => setForm(f => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }))} className="p-3 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><X size={18} /></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "advanced" && (
                                <div className="space-y-12">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></div>
                                            <h4 className="text-[16px] font-bold text-black dark:text-white tracking-tight">Search Optimizer (SEO)</h4>
                                        </div>
                                        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 px-5 py-2.5 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm w-fit">
                                            <Zap size={14} className="text-emerald-500 fill-emerald-500" />
                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">SEO Visibility Score: {form.seoScore}%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize">Focus Keyword</label>
                                                    <button 
                                                        onClick={() => generateAIContent('keywords')}
                                                        disabled={!!isGenerating}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {isGenerating === 'keywords' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} fill="currentColor" />}
                                                        Generate Keywords
                                                    </button>
                                                </div>
                                                <input 
                                                    value={form.focusKeyword} 
                                                    onChange={e => setForm(f => ({ ...f, focusKeyword: e.target.value }))} 
                                                    placeholder="e.g. leather boots" 
                                                    className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] text-[15px] font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-sm" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize">Custom Meta Title</label>
                                                    <button 
                                                        onClick={() => generateAIContent('seoTitle')}
                                                        disabled={!!isGenerating}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {isGenerating === 'seoTitle' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} fill="currentColor" />}
                                                        Optimize Title
                                                    </button>
                                                </div>
                                                <input 
                                                    value={form.seoTitle} 
                                                    onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} 
                                                    placeholder={form.name || "Custom Title For Search Results"} 
                                                    className="w-full px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] text-[15px] font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-sm" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[12px] font-bold text-zinc-400 capitalize">Meta Description</label>
                                                    <button 
                                                        onClick={() => generateAIContent('seo')}
                                                        disabled={!!isGenerating}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {isGenerating === 'seo' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} fill="currentColor" />}
                                                        Generate Meta
                                                    </button>
                                                </div>
                                                <textarea 
                                                    value={form.seoDescription} 
                                                    onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} 
                                                    placeholder={form.description || "Enter meta description..."} 
                                                    className="w-full px-8 py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] text-[14px] font-medium min-h-[160px] resize-none outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-sm" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="text-[12px] font-bold text-zinc-400 capitalize ml-2 flex items-center gap-2">
                                                Google Search Result Preview <Eye size={16} />
                                            </label>
                                            <div className="p-10 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col gap-2 group cursor-default">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[12px] font-black text-zinc-400 border border-zinc-200 dark:border-zinc-700">Q</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] text-zinc-900 dark:text-zinc-200 font-bold">Your Store</span>
                                                        <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[250px]">https://qicmart.com › products › {form.name ? form.name.toLowerCase().split(' ').join('-') : '...' }</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-[20px] text-indigo-700 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-tight">
                                                    {form.seoTitle || form.name || "Product Name Displayed Here"}
                                                </h3>
                                                <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                                    {form.seoDescription || form.description || "Your optimized product description will appear here in search engine results globally."}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 italic font-bold px-4 leading-relaxed bg-zinc-100 dark:bg-zinc-800/50 py-3 rounded-2xl">
                                                💡 Pro Tip: Keeping your focus keyword in the first sentence of your description improves click-through rates by ~15%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Wizard Navigation Footer */}
                            <div className="mt-16 sm:mt-24 pt-10 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                                <button
                                    onClick={prevTab}
                                    disabled={currentTabIndex === 0}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[12px] font-bold transition-all border ${
                                        currentTabIndex === 0 
                                        ? "opacity-50 cursor-not-allowed text-zinc-400 border-zinc-100 dark:border-zinc-800" 
                                        : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    <ChevronLeft size={16} />
                                    Phase Back
                                </button>

                                {currentTabIndex < TABS.length - 1 ? (
                                    <button 
                                        onClick={nextTab}
                                        className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg transform active:scale-95 transition-all"
                                    >
                                        Save & Continue
                                        <Plus size={16} className="rotate-[-45deg]" />
                                    </button>
                                ) : (
                                    <PremiumButton 
                                        onClick={save}
                                        disabled={saving || uploading}
                                        isLoading={saving}
                                        className="px-10"
                                        icon={Check}
                                    >
                                        {productId ? "Confirm Update" : "Finish & List Product"}
                                    </PremiumButton>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Sticky Mobile Summary Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between sm:hidden animate-in slide-in-from-bottom duration-500">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pricing</span>
                    <span className="text-sm font-bold text-black dark:text-white">{currency} {form.price || '0.00'}</span>
                </div>
                <PremiumButton 
                    onClick={save}
                    disabled={saving || uploading}
                    isLoading={saving}
                    className="!py-2 !px-6 !rounded-xl !text-[11px]"
                >
                    {productId ? "Update" : "List Product"}
                </PremiumButton>
            </div>
            
            <MediaPicker 
                isOpen={picker.open}
                onClose={() => setPicker({ ...picker, open: false })}
                allowMultiple={picker.field === 'gallery'}
                onSelect={(url) => {
                    if (picker.field === 'cover') setForm(f => ({ ...f, imageUrl: url }))
                    if (picker.field === 'variation') handlePickVariation(url)
                }}
                onSelectMultiple={(urls) => {
                    if (picker.field === 'gallery') handlePickGallery(urls)
                }}
                title={picker.field === 'gallery' ? "Select Gallery Images" : "Select Cover Image"}
            />
            <MagicStudioModal 
                isOpen={showMagicStudio} 
                onClose={() => setShowMagicStudio(false)} 
                initialImage={form.imageUrl}
                onSave={(processedUrl) => {
                    setForm(f => ({ ...f, imageUrl: processedUrl, gallery: [processedUrl, ...f.gallery.filter(g => g !== f.imageUrl)] }))
                    setShowMagicStudio(false)
                    toast.success("Product stylized in AI Studio!")
                }}
            />
        </div>
    )
}
