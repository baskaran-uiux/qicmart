"use client"

import { useState, useEffect, use } from "react"
import { 
    ChevronLeft, Save, Package, Truck, CheckCircle, 
    Clock, MapPin, User, Mail, Phone, Calendar, 
    CreditCard, Receipt, History, AlertCircle, ExternalLink,
    ArrowLeft, Trash2, Plus, Minus, Search, Edit3
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderDetailsSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface OrderItem {
    id: string
    quantity: number
    price: number
    product: {
        id: string
        name: string
        sku?: string
    }
}

interface Order {
    id: string
    total: number
    status: string
    createdAt: string
    customer: {
        firstName: string
        lastName: string
        email: string
        phone?: string
    } | null
    shippingAddress?: string
    carrier?: string
    trackingNumber?: string
    items: OrderItem[]
    shippingCost: number
    taxRun: number
}

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { currency, t } = useDashboardStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState("")
    const [carrier, setCarrier] = useState("")
    const [trackingNumber, setTrackingNumber] = useState("")

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search)
                const url = `/api/dashboard/orders/${id}?${searchParams.toString()}`
                
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data)
                    setStatus(data.status)
                    setCarrier(data.carrier || "")
                    setTrackingNumber(data.trackingNumber || "")
                }
            } catch (error) {
                console.error("Failed to fetch order:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const searchParams = new URLSearchParams(window.location.search)
            const ownerId = searchParams.get("ownerId")
            const url = ownerId ? `/api/dashboard/orders?ownerId=${ownerId}` : "/api/dashboard/orders"

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    orderId: id, 
                    status,
                    carrier,
                    trackingNumber
                })
            })
            if (res.ok) {
                router.push(`/dashboard/orders/${id}${window.location.search}`)
            }
        } catch (error) {
            console.error("Failed to save order:", error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <OrderDetailsSkeleton />

    if (!order) return (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800">
            <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-xl font-bold tracking-tight">Order Profile Not Found</h3>
            <p className="text-zinc-500 mt-2 text-sm font-medium italic">No manifest found for this identifier.</p>
            <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Go Back</button>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto px-4 pb-16 animate-fade-in font-sans">
            {/* Header - Refined style */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 group shadow-sm"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Modify Profile</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold capitalize tracking-wide text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 italic">Override Mode</span>
                            <p className="text-zinc-400 text-xs font-semibold font-mono tracking-wider ml-1">#{order.id.slice(-12).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-[12px] capitalize tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Sync Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Status Override Bento */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8"
                    >
                        <div className="flex items-center gap-4 border-b border-zinc-50 dark:border-zinc-800 pb-6">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                <History size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight leading-none italic">Logistics Pipeline</h3>
                                <p className="text-[10px] font-semibold capitalize tracking-wide text-zinc-400 mt-1">Update manifest status and tracking</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-400 capitalize tracking-wide italic">Manifest Status</label>
                                <div className="relative group">
                                    <select 
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="PENDING">Pending Approval</option>
                                        <option value="PAID">Confirmed Payment</option>
                                        <option value="SHIPPED">In Transit</option>
                                        <option value="DELIVERED">Archive Success</option>
                                        <option value="CANCELLED">Terminated</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-400 capitalize tracking-wide italic">Carrier Assignment</label>
                                <div className="relative group">
                                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. FedEx Terminal" 
                                        value={carrier}
                                        onChange={e => setCarrier(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-zinc-400 capitalize tracking-wide italic">Global Tracking Identifier</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Enter tracking ID provided by carrier" 
                                    value={trackingNumber}
                                    onChange={e => setTrackingNumber(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-mono tracking-widest uppercase"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Order Manifest Bento */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-7 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30">
                            <h3 className="text-lg font-bold tracking-tight italic">Inventory Data</h3>
                            <span className="text-[10px] font-bold text-zinc-400 italic">Locked for structural integrity</span>
                        </div>
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-7 flex items-center gap-6 opacity-60 grayscale-[0.5]">
                                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                        <Package className="text-zinc-200" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-xs truncate uppercase tracking-tight">{item.product.name}</h4>
                                        <p className="text-[10px] font-semibold text-zinc-400 mt-1 italic">SKU: {item.product.sku || '---'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white">× {item.quantity}</p>
                                        <p className="text-[11px] font-semibold text-zinc-400 italic">{currency === "INR" ? "₹" : "$"}{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-[11px] font-bold capitalize text-zinc-400 italic">Net Value Assessment</span>
                            <span className="text-xl font-bold tracking-tighter font-mono text-indigo-600">{currency === "INR" ? "₹" : "$"}{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Subject Information Bento */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 border border-emerald-100/50 shadow-sm">
                            <User size={18} />
                        </div>
                        <h3 className="text-[11px] font-semibold capitalize tracking-wide text-zinc-400 italic mb-1.5">Subject Identity</h3>
                        <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none truncate mb-8">{order.customer?.firstName} {order.customer?.lastName}</h4>
                        
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-300 group-hover:text-emerald-500 transition-colors">
                                    <Mail size={14} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] font-semibold text-zinc-400 italic mb-1">Terminal</span>
                                    <span className="text-xs font-bold text-zinc-500 truncate tracking-tight">{order.customer?.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-300 group-hover:text-indigo-500 transition-colors">
                                    <Phone size={14} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] font-semibold text-zinc-400 italic mb-1">Voice Path</span>
                                    <span className="text-xs font-bold text-zinc-500 tracking-tight">{order.customer?.phone || 'Unregistered'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Warning Bento */}
                    <div className="bg-rose-50 dark:bg-rose-500/5 p-7 rounded-[32px] border border-rose-100 dark:border-rose-500/10">
                        <div className="flex items-center gap-3 mb-3 text-rose-500">
                            <AlertCircle size={18} />
                            <h4 className="text-[11px] font-bold capitalize tracking-wide italic">Manifest Restriction</h4>
                        </div>
                        <p className="text-[11px] font-medium text-rose-600/70 leading-relaxed italic">
                            Modifying the manifest status will trigger automated notifications. Ensure carrier identifiers are cross-verified before syncing.
                        </p>
                    </div>

                    {/* Dark Profile Bento - Matches summary look */}
                    <div className="bg-zinc-950 p-8 rounded-[40px] border border-zinc-900 shadow-2xl text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[11px] font-bold capitalize tracking-[0.2em] text-zinc-500 italic mb-8">Destination Axis</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin size={18} className="text-indigo-500 mt-1 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-zinc-400 italic uppercase">Logistics Target</p>
                                        <p className="text-sm font-bold text-zinc-100 leading-relaxed uppercase tracking-tight">
                                            {order.shippingAddress ? (
                                                order.shippingAddress.startsWith('{') ? JSON.parse(order.shippingAddress).address : order.shippingAddress
                                            ) : 'No address defined'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 text-zinc-900/40 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                            <MapPin size={150} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Loader2({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
