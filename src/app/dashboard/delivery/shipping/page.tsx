"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
    Plus, Edit2, Trash2, Loader2, CheckCircle, 
    ChevronRight, X, ShieldCheck, Map, Search, ChevronDown
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import PremiumButton from "@/components/dashboard/PremiumButton"
import { INDIAN_REGIONS } from "@/constants/regions"
import { TableSkeleton, KpiCardSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface ShippingMethod {
    id: string
    name: string
    type: string // FLAT, FREE, PICKUP
    price: number
    minOrderValue?: number
    isActive: boolean
    deliveryTime?: string
}

interface ShippingLocation {
    id: string
    type: string // REGION
    value: string
}

interface ShippingZone {
    id: string
    name: string
    isActive: boolean
    ShippingLocation: ShippingLocation[]
    ShippingMethod: ShippingMethod[]
}

const ALL_STATES = Object.keys(INDIAN_REGIONS).sort()

export default function ShippingManagementPage() {
    return <Suspense fallback={<Loader2 className="animate-spin" />}><ShippingManagementContent /></Suspense>
}

function ShippingManagementContent() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    const paramsStr = `?dashboardType=${dashboardType}${ownerId ? `&ownerId=${ownerId}` : ""}`

    const { currency, t } = useDashboardStore()
    const [zones, setZones] = useState<ShippingZone[]>([])
    const [loading, setLoading] = useState(true)
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)

    // Form State for Zone
    const [zoneName, setZoneName] = useState("")
    const [selectedRegions, setSelectedRegions] = useState<string[]>([])
    const [zoneMethods, setZoneMethods] = useState<Partial<ShippingMethod>[]>([])
    const [regionSearch, setRegionSearch] = useState("")
    const [expandedStates, setExpandedStates] = useState<string[]>([])

    const fetchZones = async () => {
        try {
            const res = await fetch(`/api/dashboard/delivery/zones${paramsStr}`)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setZones(data)
        } catch (error) {
            console.error("Fetch error:", error)
            setZones([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchZones()
    }, [])

    const openCreateModal = () => {
        setEditingZone(null)
        setZoneName("")
        setSelectedRegions([])
        setRegionSearch("")
        setExpandedStates([])
        setZoneMethods([{ name: "Standard Shipping", type: "FLAT", price: 0, isActive: true }])
        setIsZoneModalOpen(true)
    }

    const openEditModal = (zone: ShippingZone) => {
        setEditingZone(zone)
        setZoneName(zone.name)
        setSelectedRegions(zone.ShippingLocation.map(l => l.value))
        setRegionSearch("")
        setExpandedStates([])
        setZoneMethods(zone.ShippingMethod)
        setIsZoneModalOpen(true)
    }

    const handleSaveZone = async () => {
        if (!zoneName) return toast.error("Zone name is required")
        setIsSaving(true)
        try {
            const res = await fetch(`/api/dashboard/delivery/zones${paramsStr}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingZone?.id,
                    name: zoneName,
                    isActive: true,
                    locations: selectedRegions.map(r => ({ type: "REGION", value: r })),
                    methods: zoneMethods
                })
            })
            if (res.ok) {
                toast.success("Zone saved successfully")
                setIsZoneModalOpen(false)
                fetchZones()
            } else {
                const err = await res.json()
                toast.error(err.error || "Failed to save")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteZone = async (id: string) => {
        if (!confirm("Are you sure you want to delete this zone?")) return
        try {
            const res = await fetch(`/api/dashboard/delivery/zones/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Zone deleted")
                fetchZones()
            }
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const addMethodToForm = () => {
        setZoneMethods([...zoneMethods, { name: "New Method", type: "FLAT", price: 0, isActive: true }])
    }

    const updateMethodInForm = (index: number, data: Partial<ShippingMethod>) => {
        const newMethods = [...zoneMethods]
        newMethods[index] = { ...newMethods[index], ...data }
        setZoneMethods(newMethods)
    }

    const removeMethodFromForm = (index: number) => {
        setZoneMethods(zoneMethods.filter((_, i) => i !== index))
    }

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev => 
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        )
    }

    const toggleExpand = (state: string) => {
        setExpandedStates(prev => 
            prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
        )
    }

    const filteredStates = useMemo(() => {
        if (!regionSearch) return ALL_STATES
        const searchLow = regionSearch.toLowerCase()
        return ALL_STATES.filter(state => {
            const stateMatch = state.toLowerCase().includes(searchLow)
            const districtMatch = INDIAN_REGIONS[state].some(d => d.toLowerCase().includes(searchLow))
            return stateMatch || districtMatch
        })
    }, [regionSearch])

    // Effect to auto-expand states when searching for districts
    useEffect(() => {
        if (regionSearch.length > 2) {
            const searchLow = regionSearch.toLowerCase()
            const matchingStates = ALL_STATES.filter(state => 
                INDIAN_REGIONS[state].some(d => d.toLowerCase().includes(searchLow))
            )
            setExpandedStates(prev => Array.from(new Set([...prev, ...matchingStates])))
        }
    }, [regionSearch])

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <h2 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 capitalize">
                        Shipping Management
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-normal">Manage hyper-local shipping zones and delivery rates for all India.</p>
                </div>
                <PremiumButton 
                    onClick={openCreateModal}
                    icon={Plus}
                >
                    Add Shipping Zone
                </PremiumButton>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        <TableSkeleton />
                    </div>
                ) : zones.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900/40 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                            <Map className="text-zinc-300 dark:text-zinc-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Shipping Zones Defined</h3>
                        <button onClick={openCreateModal} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                            Create your first zone <ChevronRight size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {zones.map((zone) => (
                            <div key={zone.id} className="bg-white dark:bg-zinc-900/40 rounded-[32px] border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-zinc-500/5 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-[24px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors">
                                        <Map size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{zone.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {zone.ShippingLocation.length === 0 ? (
                                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">All India (Default)</span>
                                            ) : (
                                                zone.ShippingLocation.slice(0, 4).map(loc => (
                                                    <span key={loc.id} className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800/50 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 rounded-md truncate max-w-[150px]">{loc.value}</span>
                                                ))
                                            )}
                                            {zone.ShippingLocation.length > 4 && <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">+{zone.ShippingLocation.length - 4} more</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12 w-full md:w-auto">
                                    <div className="flex flex-col gap-1 items-end">
                                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Methods</p>
                                        <div className="flex -space-x-2">
                                            {zone.ShippingMethod.map((m) => (
                                                <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] shadow-sm bg-indigo-600 text-white font-bold">{m.name[0]}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditModal(zone)} className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Manage</button>
                                        <button onClick={() => handleDeleteZone(zone.id)} className="p-3 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isZoneModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsZoneModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-zinc-900 w-full max-w-6xl max-h-[95vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative z-10 border dark:border-zinc-800">
                            <div className="px-10 py-10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Map size={28} /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{editingZone ? "Edit Shipping Zone" : "New Shipping Zone"}</h3>
                                        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">Define regions and delivery methods.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsZoneModalOpen(false)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"><X size={28} /></button>
                            </div>

                             <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-16 border-b border-zinc-50 dark:border-zinc-800/50">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Zone Name</label>
                                        <input type="text" value={zoneName} onChange={e => setZoneName(e.target.value)} placeholder="e.g. Local District, State Delivery" className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-3xl text-sm font-medium focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/20 transition-all outline-none text-zinc-900 dark:text-zinc-100" />
                                    </div>
 
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Select Regions</label>
                                            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50">{selectedRegions.length} selected</div>
                                        </div>
                                        <div className="relative group/search">
                                            <input type="text" value={regionSearch} onChange={e => setRegionSearch(e.target.value)} placeholder="Search states or districts..." className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-bold outline-none group-focus-within/search:bg-white dark:group-focus-within/search:bg-zinc-800 transition-all pl-12 text-zinc-900 dark:text-zinc-100" />
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                        </div>

                                         {/* Selected Regions Pills */}
                                        {selectedRegions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-zinc-800/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm max-h-[120px] overflow-y-auto custom-scrollbar">
                                                {selectedRegions.map(region => (
                                                    <div 
                                                        key={region} 
                                                        className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all cursor-default"
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">{region}</span>
                                                        <button 
                                                            onClick={() => toggleRegion(region)}
                                                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                        >
                                                            <X size={10} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
 
                                        <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-[32px] p-6 border-2 border-zinc-50 dark:border-zinc-800/50 max-h-[450px] overflow-y-auto space-y-3 custom-scrollbar">
                                            {regionSearch.length === 0 ? (
                                                <div className="py-20 text-center space-y-4">
                                                    <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-600">
                                                        <Search size={24} />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Start typing to find states or districts</p>
                                                </div>
                                            ) : (
                                                filteredStates.map(state => {
                                                    const districts = INDIAN_REGIONS[state];
                                                    const searchLow = regionSearch.toLowerCase();
                                                    const isStateMatch = state.toLowerCase().includes(searchLow);
                                                    const filteredDistricts = isStateMatch ? districts : districts.filter(d => d.toLowerCase().includes(searchLow));
                                                    const isExpanded = expandedStates.includes(state);

                                                    return (
                                                        <div key={state} className="space-y-2">
                                                            <div 
                                                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                                                                    selectedRegions.includes(state) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md text-zinc-600 dark:text-zinc-400 font-bold bg-white/50 dark:bg-zinc-800/30'
                                                                }`}
                                                                onClick={(e) => {
                                                                    if ((e.target as HTMLElement).closest('.expand-btn')) return;
                                                                    toggleRegion(state);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {selectedRegions.includes(state) ? <CheckCircle size={16} /> : <div className="w-4" />}
                                                                    <span className="text-xs uppercase tracking-wider">{state}</span>
                                                                </div>
                                                                {districts.length > 0 && (
                                                                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(state); }} className={`p-2 rounded-xl transition-all expand-btn ${selectedRegions.includes(state) ? 'hover:bg-white/20' : 'hover:bg-zinc-700/50'}`}>
                                                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {isExpanded && (
                                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pl-8 grid grid-cols-1 gap-2 border-l-2 border-zinc-100 dark:border-zinc-800 ml-6 py-2">
                                                                    {filteredDistricts.map(dist => {
                                                                        const distValue = `${state}: ${dist}`;
                                                                        const isSelected = selectedRegions.includes(distValue);
                                                                        return (
                                                                            <div key={dist} onClick={() => toggleRegion(distValue)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-[11px] font-bold transition-all ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50' : 'bg-white dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                                                                                <span>{dist}</span>
                                                                                {isSelected && <CheckCircle size={12} />}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                    {filteredDistricts.length === 0 && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic p-3">No districts matching search</p>}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Shipping Methods</label>
                                        <button onClick={addMethodToForm} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">+ Add Method</button>
                                    </div>
                                    <div className="space-y-6">
                                        {zoneMethods.map((method, idx) => (
                                            <div key={idx} className="bg-white dark:bg-zinc-800/30 rounded-[32px] p-8 border-2 border-zinc-50 dark:border-zinc-800/50 shadow-sm space-y-8 relative hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group/method">
                                                <button onClick={() => removeMethodFromForm(idx)} className="absolute -top-3 -right-3 text-zinc-400 hover:text-white p-2.5 bg-white dark:bg-zinc-800 hover:bg-red-500 rounded-full border border-zinc-100 dark:border-zinc-800 hover:border-red-500 transition-all shadow-xl hover:scale-110 active:scale-95 z-20">
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Name</label>
                                                        <input type="text" value={method.name} onChange={e => updateMethodInForm(idx, { name: e.target.value })} className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-semibold outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-200 dark:focus:border-zinc-700 transition-all text-zinc-900 dark:text-zinc-100" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Type</label>
                                                        <select value={method.type} onChange={e => updateMethodInForm(idx, { type: e.target.value })} className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-semibold outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-200 dark:focus:border-zinc-700 transition-all text-zinc-900 dark:text-zinc-100">
                                                            <option value="FLAT">Flat Rate</option>
                                                            <option value="FREE">Free Shipping</option>
                                                            <option value="PICKUP">Local Pickup</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Cost ({currency})</label>
                                                        <div className="relative">
                                                            <input type="number" value={method.price} onChange={e => updateMethodInForm(idx, { price: parseFloat(e.target.value) })} className="w-full pl-10 pr-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-semibold outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all text-zinc-900 dark:text-zinc-100" />
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[10px]">{currency === 'INR' ? '₹' : '$'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Delivery Time</label>
                                                        <input type="text" value={method.deliveryTime || ""} onChange={e => updateMethodInForm(idx, { deliveryTime: e.target.value })} placeholder="e.g. 3-5 days" className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-semibold outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all text-zinc-900 dark:text-zinc-100" />
                                                    </div>
                                                </div>
                                                {method.type === 'FREE' && (
                                                    <div className="space-y-3 pt-2">
                                                        <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider ml-1">Min Order Value ({currency})</label>
                                                        <input type="number" value={method.minOrderValue || ""} onChange={e => updateMethodInForm(idx, { minOrderValue: parseFloat(e.target.value) })} className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-50 dark:border-zinc-800 rounded-[20px] text-xs font-semibold outline-none text-zinc-900 dark:text-zinc-100" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-10 bg-zinc-50 dark:bg-zinc-800/50 flex gap-6">
                                <button onClick={() => setIsZoneModalOpen(false)} className="flex-1 py-5 px-8 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:bg-white dark:hover:bg-zinc-800 transition-all">Cancel</button>
                                <PremiumButton 
                                    onClick={handleSaveZone} 
                                    isLoading={isSaving}
                                    className="flex-[2] py-5 px-14"
                                    icon={isSaving ? Loader2 : ShieldCheck}
                                >
                                    Save Zone & Shipping Methods
                                </PremiumButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 20px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
            `}</style>
        </div>
    )
}
