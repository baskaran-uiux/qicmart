"use client"

import { useState, useEffect } from "react"
import { 
    Truck, Search, MoreVertical, Edit2, 
    ExternalLink, Loader2, Package, MapPin, 
    Calendar, CheckCircle, Clock, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface Order {
    id: string
    status: string
    carrier: string | null
    trackingNumber: string | null
    updatedAt: string
    customer: {
        firstName: string
        lastName: string
    } | null
}

export default function OrderTrackingPage() {
    const { t } = useDashboardStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchTrackingOrders = async () => {
        try {
            const res = await fetch("/api/dashboard/orders")
            const data = await res.json()
            // Filter orders that are typically in transit or delivered
            const trackingOrders = (data || []).filter((o: Order) => 
                ["SHIPPED", "DELIVERED"].includes(o.status) || o.trackingNumber
            )
            setOrders(trackingOrders)
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrackingOrders()
    }, [])

    const filteredOrders = orders.filter(o => 
        o.id.toLowerCase().includes(search.toLowerCase()) || 
        o.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize truncate">
                        {t("orderTracking") || "Order Tracking"}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Monitor shipments and update customer tracking information</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">In Transit</p>
                        <p className="text-lg font-bold text-indigo-600">{orders.filter(o => o.status === "SHIPPED").length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by Order ID, Tracking No, or Customer..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="animate-spin inline-block text-indigo-500" size={32} />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="col-span-full py-20 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 text-center">
                        <Truck size={48} className="mx-auto text-zinc-100 mb-4" />
                        <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">No shipments found matching your search</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl">
                                    <Package size={20} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                    order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Order ID</p>
                                    <h3 className="text-lg font-bold text-black dark:text-white uppercase tracking-tight">#{order.id.substring(0, 12)}</h3>
                                </div>

                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Truck size={16} className="text-zinc-400" />
                                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{order.carrier || "Carrier not assigned"}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-zinc-400" />
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{order.trackingNumber || "No Tracking ID"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-zinc-400" />
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(order.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Link href={`/dashboard/orders?id=${order.id}`} className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                        <ExternalLink size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
