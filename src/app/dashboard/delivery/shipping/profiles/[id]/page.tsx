"use client"

import { useState, useEffect, use } from "react"
import { 
    ArrowLeft, Plus, Globe, Trash2, Edit2, 
    Loader2, Save, MapPin, Package, 
    ChevronRight, Info, AlertCircle, 
    CheckCircle, ShieldCheck, X, Search, Truck
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface ShippingRate {
    id: string
    name: string
    type: "FLAT" | "WEIGHT_BASED" | "PRICE_BASED"
    minWeight?: number | null
    maxWeight?: number | null
    minPrice?: number | null
    maxPrice?: number | null
    price: number
    isActive: boolean
    deliveryTime?: string | null
}

interface ShippingZone {
    id: string
    name: string
    regions: string[]
    rates: ShippingRate[]
}

interface ShippingProfile {
    id: string
    name: string
    isDefault: boolean
    zones: ShippingZone[]
    products: { id: string, name: string, images: string[] }[]
}

const REGIONS_DATA = [
    {
        id: 'IN',
        name: 'India',
        states: [
            { id: 'IN-TN', name: 'Tamil Nadu' },
            { id: 'IN-KA', name: 'Karnataka' },
            { id: 'IN-KL', name: 'Kerala' },
            { id: 'IN-MH', name: 'Maharashtra' },
            { id: 'IN-DL', name: 'Delhi' },
            { id: 'IN-AP', name: 'Andhra Pradesh' },
            { id: 'IN-TG', name: 'Telangana' },
            { id: 'IN-PY', name: 'Puducherry' },
        ]
    },
    {
        id: 'US',
        name: 'United States (US)',
        states: [
            { id: 'US-CA', name: 'California' },
            { id: 'US-NY', name: 'New York' },
            { id: 'US-TX', name: 'Texas' },
            { id: 'US-FL', name: 'Florida' }
        ]
    },
    {
        id: 'GB',
        name: 'United Kingdom (UK)',
        states: []
    },
    {
        id: 'AE',
        name: 'United Arab Emirates (UAE)',
        states: []
    },
    {
        id: 'SG',
        name: 'Singapore',
        states: []
    },
    {
        id: 'ROW',
        name: 'Rest of the World',
        states: []
    }
]

export default function ProfileEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { currency, t } = useDashboardStore()
    const [profile, setProfile] = useState<ShippingProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && id) {
            fetchProfile()
            fetchAllProducts()
        }
    }, [mounted, id])

    // Modals
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
    const [isRateModalOpen, setIsRateModalOpen] = useState(false)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    
    // Form States
    const [editingZone, setEditingZone] = useState<any>(null)
    const [editingRate, setEditingRate] = useState<any>(null)
    const [rateStep, setRateStep] = useState(1)
    const [allProducts, setAllProducts] = useState<any[]>([])
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

    if (!mounted) return null

    const fetchProfile = async () => {
        if (!id) return
        try {
            const res = await fetch(`/api/dashboard/shipping/profiles/${id}`)
            if (!res.ok) throw new Error("Not found")
            const data = await res.json()
            setProfile(data)
            setSelectedProductIds(data.products.map((p: any) => p.id))
        } catch (error) {
            toast.error("Failed to load profile")
            router.push("/dashboard/delivery/shipping")
        } finally {
            setLoading(false)
        }
    }

    const fetchAllProducts = async () => {
        try {
            const res = await fetch("/api/dashboard/products?limit=100")
            const data = await res.json()
            setAllProducts(data.products || [])
        } catch (error) {}
    }

    const handleUpdateProfile = async (updates: any) => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/dashboard/shipping/profiles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                toast.success("Profile updated")
                fetchProfile()
            }
        } catch (error) {
            toast.error("Update failed")
        } finally {
            setIsSaving(false)
        }
    }

    const handleZoneAction = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingZone?.id ? "PATCH" : "POST"
        const url = editingZone?.id ? `/api/dashboard/shipping/zones/${editingZone.id}` : "/api/dashboard/shipping/zones"
        
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: id,
                    name: editingZone.name,
                    regions: editingZone.regions
                })
            })
            if (res.ok) {
                toast.success(`Zone ${editingZone?.id ? "updated" : "created"}`)
                setIsZoneModalOpen(false)
                fetchProfile()
            }
        } catch (error) {
            toast.error("Zone action failed")
        }
    }

    const handleDeleteZone = async (id: string) => {
        if (!confirm("Delete this zone and all its rates?")) return
        try {
            const res = await fetch(`/api/dashboard/shipping/zones/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Zone deleted")
                fetchProfile()
            }
        } catch (error) {}
    }

    const handleRateAction = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editingRate?.id ? "PATCH" : "POST"
        const url = editingRate?.id ? `/api/dashboard/shipping/rates/${editingRate.id}` : "/api/dashboard/shipping/rates"
        
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingRate)
            })
            if (res.ok) {
                toast.success(`Rate ${editingRate?.id ? "updated" : "added"}`)
                setIsRateModalOpen(false)
                fetchProfile()
            }
        } catch (error) {
            toast.error("Rate action failed")
        }
    }

    const handleDeleteRate = async (id: string) => {
        if (!confirm("Delete this shipping rate?")) return
        try {
            const res = await fetch(`/api/dashboard/shipping/rates/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Rate deleted")
                fetchProfile()
            }
        } catch (error) {}
    }

    const handleToggleRateStatus = async (rateId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/dashboard/shipping/rates/${rateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus })
            })
            if (res.ok) {
                toast.success(`Shipping method ${!currentStatus ? "enabled" : "disabled"}`)
                fetchProfile()
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-indigo-500/20" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 animate-pulse">Loading Profile Config...</p>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-10 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => router.back()}
                        className="p-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white rounded-[24px] border border-zinc-100 dark:border-zinc-700/50 transition-all shadow-sm hover:shadow-xl hover:scale-105"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
                                {profile.name}
                            </h2>
                            {profile.isDefault && (
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest">General</span>
                            )}
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Define where you ship and how much you charge.</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleUpdateProfile({ productIds: selectedProductIds })}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[28px] font-bold text-[12px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-zinc-500/10"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                    Save Profile
                </button>
            </header>

            {/* Products Section */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700">
                <div className="p-10 sm:p-12 border-b border-zinc-50 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600/10 text-indigo-600 rounded-[22px] flex items-center justify-center shadow-inner shadow-indigo-500/10">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-black dark:text-white">Products</h3>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{profile.products.length} Items Linked</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-8 py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-[24px] font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700/50"
                    >
                        Choose Products
                    </button>
                </div>
                <div className="p-10 sm:p-12">
                    <div className="flex flex-wrap gap-4">
                        {profile.products.slice(0, 5).map(p => (
                            <div key={p.id} className="group relative w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-sm hover:scale-110 transition-transform">
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                    <span className="text-[10px] text-white font-bold px-2 text-center truncate">{p.name}</span>
                                </div>
                            </div>
                        ))}
                        {profile.products.length > 5 && (
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center text-[11px] font-bold text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
                                +{profile.products.length - 5}
                            </div>
                        )}
                        {profile.products.length === 0 && (
                            <div className="py-6 w-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[32px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 italic">No products assigned to this profile</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Shipping Zones Table (WooCommerce Style) */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700">
                <div className="p-10 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-black dark:text-white">Shipping zones</h3>
                        <p className="text-xs text-zinc-400 font-medium mt-1">A shipping zone consists of the region(s) you'd like to ship to and the shipping method(s) offered.</p>
                    </div>
                    <button 
                        onClick={() => { setEditingZone({ name: '', regions: [] }); setIsZoneModalOpen(true); }}
                        className="shrink-0 px-6 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-sm"
                    >
                        Add zone
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="w-12"></th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Zone name</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Region(s)</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Shipping method(s)</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {profile.zones.map((zone) => (
                                <tr key={zone.id} className="group hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="pl-8 py-8">
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-zinc-300" />)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <button 
                                            onClick={() => { setEditingZone(zone); setIsZoneModalOpen(true); }}
                                            className="text-sm font-bold text-indigo-600 hover:underline text-left block"
                                        >
                                            {zone.name}
                                        </button>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xs">
                                            {Array.isArray(zone.regions) ? zone.regions.map(r => REGIONS_DATA.find(rd => rd.id === r)?.name || REGIONS_DATA.flatMap(rd => rd.states).find(s => s.id === r)?.name || r).join(", ") : "All Regions"}
                                        </p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col gap-3">
                                            {zone.rates.map(rate => (
                                                <div key={rate.id} className="group/rate flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:border-indigo-500/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rate.isActive ? "bg-indigo-600/10 text-indigo-600" : "bg-zinc-100 text-zinc-400"}`}>
                                                            {rate.name.toLowerCase().includes("pickup") ? <MapPin size={18} /> : <Truck size={18} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-[11px] font-black uppercase tracking-tight ${rate.isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
                                                                    {rate.name}
                                                                </span>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <button 
                                                                        onClick={() => { setEditingRate(rate); setRateStep(2); setIsRateModalOpen(true); }}
                                                                        className="text-indigo-500 hover:text-indigo-600 font-bold text-[9px] uppercase tracking-widest"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <span className="text-zinc-200 dark:text-zinc-800">|</span>
                                                                    <button 
                                                                        onClick={() => handleDeleteRate(rate.id)}
                                                                        className="text-rose-500 hover:text-rose-600 font-bold text-[9px] uppercase tracking-widest"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className={`text-xs font-black ${rate.isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
                                                                {currency}{rate.price.toFixed(2)}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 font-medium">{rate.deliveryTime || "3-5 days"}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggleRateStatus(rate.id, rate.isActive)}
                                                            className={`relative w-10 h-6 flex items-center ${rate.isActive ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"} rounded-full transition-colors duration-300 focus:outline-none`}
                                                        >
                                                            <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${rate.isActive ? "translate-x-5" : "translate-x-1"}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => { setEditingRate({ zoneId: zone.id, name: '', type: 'FLAT', price: 0, isActive: true }); setRateStep(1); setIsRateModalOpen(true); }}
                                                className="w-full py-4 border-2 border-dashed border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/20 hover:bg-indigo-50/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all"
                                            >
                                                <Plus size={14} /> Add shipping method
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-8">
                                            <button 
                                                onClick={() => { setEditingZone(zone); setIsZoneModalOpen(true); }}
                                                className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 px-3 py-1"
                                            >
                                                Edit
                                            </button>
                                            <span className="text-zinc-300">|</span>
                                            <button 
                                                onClick={() => handleDeleteZone(zone.id)}
                                                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 px-3 py-1"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {profile.zones.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                         <div className="flex flex-col items-center">
                                            <Globe size={40} className="text-zinc-200 mb-4" />
                                            <h4 className="text-lg font-bold text-black dark:text-white">No zones found</h4>
                                            <p className="text-xs text-zinc-400 mt-1">Start by adding your first shipping zone.</p>
                                         </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modals Strategy: I will implement them inside the same file for now to keep it consolidated, but using premium styling */}
            
            {/* Zone Modal */}
            <AnimatePresence>
                {isZoneModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-10 sm:p-12 pb-6 flex items-center justify-between">
                                <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{editingZone?.id ? "Edit Zone" : "Add Shipping Zone"}</h3>
                                <button onClick={() => setIsZoneModalOpen(false)} className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-[20px] transition-all">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>
                            <form onSubmit={handleZoneAction} className="p-10 sm:p-12 pt-0 space-y-8 flex flex-col h-[60vh]">
                                <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block pl-1">Zone Name</label>
                                        <input 
                                            autoFocus
                                            required
                                            type="text" 
                                            placeholder="e.g., Domestic, North America" 
                                            value={editingZone?.name || ""}
                                            onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                                            className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[28px] text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-black dark:text-white"
                                        />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block pl-1">Regions & States</label>
                                        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
                                            {REGIONS_DATA.map(reg => (
                                                <div key={reg.id} className="space-y-2">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input 
                                                            type="checkbox"
                                                            checked={editingZone.regions?.includes(reg.id)}
                                                            onChange={() => {
                                                                const current = editingZone.regions || []
                                                                const next = current.includes(reg.id) ? current.filter((r: any) => r !== reg.id) : [...current, reg.id]
                                                                setEditingZone({ ...editingZone, regions: next })
                                                            }}
                                                            className="w-5 h-5 rounded-lg border-2 border-zinc-200 text-indigo-600 focus:ring-indigo-500 transition-all"
                                                        />
                                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 transition-colors">{reg.name}</span>
                                                    </label>
                                                    {reg.states.length > 0 && editingZone.regions?.includes(reg.id) && (
                                                        <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
                                                            {reg.states.map(state => (
                                                                <label key={state.id} className="flex items-center gap-2 cursor-pointer group/state">
                                                                    <input 
                                                                        type="checkbox"
                                                                        checked={editingZone.regions?.includes(state.id)}
                                                                        onChange={() => {
                                                                            const current = editingZone.regions || []
                                                                            const next = current.includes(state.id) ? current.filter((r: any) => r !== state.id) : [...current, state.id]
                                                                            setEditingZone({ ...editingZone, regions: next })
                                                                        }}
                                                                        className="w-4 h-4 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover/state:text-indigo-400 transition-colors uppercase font-bold tracking-wider">{state.name}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 pt-6 border-t border-zinc-50 dark:border-zinc-800/50 flex-shrink-0">
                                    <button 
                                        type="button"
                                        onClick={() => setIsZoneModalOpen(false)}
                                        className="flex-1 py-5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-3xl text-[11px] font-bold uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-3xl text-[11px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rate Modal */}
            <AnimatePresence>
                {isRateModalOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-10 pb-6 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50">
                                <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">{editingRate?.id ? "Edit Rate" : "Add Rate"}</h3>
                                <button onClick={() => setIsRateModalOpen(false)} className="p-3 hover:bg-zinc-100 rounded-full transition-colors">
                                    <X size={20} className="text-zinc-400" />
                                </button>
                            </div>
                            <div className="p-10 space-y-8">
                                {rateStep === 1 ? (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">Select the shipping method you wish to add to this zone.</p>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'FLAT', name: 'Flat rate', desc: 'Lets you charge a fixed rate for shipping.' },
                                                { id: 'FREE', name: 'Free shipping', desc: 'A special method which can be triggered with coupons and minimum spends.' },
                                                { id: 'PICKUP', name: 'Local pickup', desc: 'Allow customers to pick up orders themselves. By default, when using local pickup, base taxes will apply regardless of customer address.' }
                                            ].map(method => (
                                                <button 
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const nameMap: any = { FLAT: 'Flat rate', FREE: 'Free shipping', PICKUP: 'Local pickup' };
                                                        setEditingRate({ ...editingRate, type: method.id === 'FREE' ? 'PRICE_BASED' : 'FLAT', name: nameMap[method.id], price: 0 });
                                                        setRateStep(2);
                                                    }}
                                                    className="w-full text-left p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-[32px] hover:border-indigo-500/30 hover:bg-indigo-50/10 transition-all group"
                                                >
                                                    <p className="text-sm font-bold text-black dark:text-white group-hover:text-indigo-600 transition-colors">{method.name}</p>
                                                    <p className="text-xs text-zinc-400 font-medium mt-1">{method.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRateAction} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block pl-1">Method title</label>
                                                <input 
                                                    autoFocus
                                                    required
                                                    type="text" 
                                                    value={editingRate?.name || ""}
                                                    onChange={e => setEditingRate({ ...editingRate, name: e.target.value })}
                                                    className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[28px] text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-black dark:text-white"
                                                />
                                                <p className="text-[10px] text-zinc-400 italic pl-1">This title the user sees during checkout.</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block pl-1">Cost ({currency})</label>
                                                    <input 
                                                        required
                                                        type="number" 
                                                        step="0.01"
                                                        value={editingRate?.price ?? ""}
                                                        onChange={e => setEditingRate({ ...editingRate, price: e.target.value })}
                                                        className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[28px] text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-black dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block pl-1">Tax status</label>
                                                    <select className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-[28px] text-sm font-bold outline-none appearance-none">
                                                        <option>Taxable</option>
                                                        <option>None</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button 
                                                type="button"
                                                onClick={() => setRateStep(1)}
                                                className="flex-1 py-5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-3xl text-[11px] font-bold uppercase tracking-widest"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                type="submit"
                                                className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                                            >
                                                Save method
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Selector Modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[80vh] rounded-[48px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col"
                        >
                            <div className="p-10 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-black dark:text-white">Choose Products</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Select items for this profile</p>
                                </div>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-4 hover:bg-zinc-100 rounded-[20px] transition-all">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>
                            
                            <div className="p-10 pt-6 flex-shrink-0">
                                <div className="relative group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search products by name..." 
                                        className="w-full pl-14 pr-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-2 custom-scrollbar">
                                {allProducts.map(p => (
                                    <label 
                                        key={p.id}
                                        className={`flex items-center gap-4 p-4 rounded-[40px] border-2 cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-600/40" : "bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent hover:border-zinc-200"}`}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={selectedProductIds.includes(p.id)}
                                            onChange={() => {
                                                const next = selectedProductIds.includes(p.id) ? selectedProductIds.filter(id => id !== p.id) : [...selectedProductIds, p.id]
                                                setSelectedProductIds(next)
                                            }}
                                            className="hidden"
                                        />
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                            <img src={p.images?.[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-black dark:text-white truncate">{p.name}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{currency} {p.price}</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedProductIds.includes(p.id) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "border-zinc-200"}`}>
                                            {selectedProductIds.includes(p.id) && <ShieldCheck size={16} strokeWidth={3} />}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="p-10 border-t border-zinc-50 dark:border-zinc-800/50 flex-shrink-0 bg-white dark:bg-zinc-900">
                                <button 
                                    onClick={() => {
                                        setProfile({ ...profile, products: allProducts.filter(p => selectedProductIds.includes(p.id)) })
                                        setIsProductModalOpen(false)
                                    }}
                                    className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[28px] font-extrabold text-[12px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Confirm Selection ({selectedProductIds.length})
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
