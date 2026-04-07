"use client"

import { useState, useEffect } from "react"
import { 
    Clock, CheckCircle, Truck, Package, XCircle, Search, 
    MoreVertical, Eye, FileText, Loader2, ArrowRight, TruckIcon, MapPin, Calendar, 
    ChevronDown, ChevronUp, History as HistoryIcon, ExternalLink, Plus, ChevronLeft, ChevronRight, QrCode, Mail, MessageCircle, Filter, Download as DownloadIcon, TrendingUp, IndianRupee
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { KpiCardSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface OrderItem {
    id: string
    quantity: number
    price: number
    product: {
        name: string
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
    items: OrderItem[]
    payments: Array<{
        provider: string
        status: string
    }>
}

export default function OrdersPage() {
    const { currency, t, name: storeName, slug } = useDashboardStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/orders?ownerId=${ownerId}` : "/api/dashboard/orders"
            
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setOrders(Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === "PENDING").length,
        totalRevenue: orders.reduce((acc, o) => acc + o.total, 0),
        avgOrderValue: orders.length > 0 ? (orders.reduce((acc, o) => acc + o.total, 0) / orders.length) : 0
    }

    const filtered = (Array.isArray(orders) ? orders : []).filter(o => {
        const searchLower = search.toLowerCase().replace("#", "")
        return (o.id?.toLowerCase() || "").includes(searchLower) ||
            (o.customer?.firstName?.toLowerCase() || "").includes(searchLower) ||
            (o.customer?.lastName?.toLowerCase() || "").includes(searchLower) ||
            (o.customer?.email?.toLowerCase() || "").includes(searchLower)
    })

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
            case "PAID": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
            case "SHIPPED": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
            case "DELIVERED": return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20"
            case "CANCELLED": return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"
            default: return "bg-zinc-100 text-zinc-600 border-zinc-200"
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-10 pb-20 px-4"
        >
            {/* Premium Header consistent with Dashboard */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Order Management</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Manage and track your store sales effectively.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group w-full sm:w-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={12} />
                        <input 
                            type="text" 
                            placeholder="Search order ID or customer..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full sm:w-60 pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm min-h-[38px]" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-medium capitalize tracking-wide hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 min-h-[38px]">
                        <Filter size={14} /> {t("filter") || "Filter"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-medium capitalize tracking-wide text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm min-h-[38px]">
                        <DownloadIcon size={14} className="text-emerald-500" /> {t("export") || "Export"}
                    </button>
                </div>
            </div>

            {/* Stats Cards - Refined Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)
                ) : (
                    [
                        { label: "Total Orders", value: stats.totalOrders.toLocaleString(), last: "Lifetime", icon: Package, color: "bg-zinc-950 text-white", iconColor: "text-zinc-400" },
                        { label: "Pending", value: stats.pendingOrders.toLocaleString(), last: "Needs attention", icon: Clock, color: "bg-amber-500 text-white", iconColor: "text-amber-200" },
                        { label: "Revenue", value: `${currency === "INR" ? "₹" : "$"}${stats.totalRevenue.toLocaleString()}`, last: "Net sales", icon: IndianRupee, color: "bg-emerald-500 text-white", iconColor: "text-emerald-200" },
                        { label: "Avg. Value", value: `${currency === "INR" ? "₹" : "$"}${stats.avgOrderValue.toFixed(2)}`, last: "Per order", icon: TrendingUp, color: "bg-indigo-500 text-white", iconColor: "text-indigo-200" }
                    ].map((stat, i) => (
                        <motion.div 
                            key={stat.label} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-7 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group cursor-default"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[12px] sm:text-[14px] font-semibold text-zinc-400 dark:text-zinc-500 capitalize tracking-wide">{stat.label}</span>
                                <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[28px] sm:text-[32px] font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                                <p className="text-xs font-medium text-zinc-400 italic">{stat.last}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Orders Table Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
                <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic">{t("recentOrders") || "Recent Orders"}</h3>
                    <div className="text-zinc-400 text-xs font-semibold px-3 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-full italic">
                        Showing {paginatedOrders.length} of {filtered.length}
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4">
                            <TableSkeleton />
                        </div>
                    ) : paginatedOrders.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <Package className="w-8 h-8 text-zinc-200" />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Archive Empty</h4>
                            <p className="text-zinc-400 text-xs font-medium italic">No matches found in the current timeframe.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="text-[12px] sm:text-[14px] text-zinc-400 dark:text-zinc-500 capitalize bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold tracking-wide border-b border-zinc-50 dark:border-zinc-800">
                                <tr>
                                    <th className="px-7 py-4">Transaction</th>
                                    <th className="px-7 py-4">Customer</th>
                                    <th className="px-7 py-4">Status</th>
                                    <th className="px-7 py-4 text-right">Settlement</th>
                                    <th className="px-7 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {paginatedOrders.map((order) => (
                                    <tr key={order.id} className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all duration-300">
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 dark:text-white text-xs group-hover/row:text-indigo-600 transition-colors uppercase tracking-tight">
                                                    ORD-{order.id.slice(-8).toUpperCase()}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold mt-1 italic">
                                                    <Calendar size={10} />
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                                                    {order.customer?.firstName} {order.customer?.lastName}
                                                </span>
                                                <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[150px]">{order.customer?.email || 'Guest Terminal'}</span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold capitalize tracking-wide border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <p className="font-bold text-zinc-900 dark:text-white text-xs mb-0.5">{currency === "INR" ? "₹" : "$"}{order.total.toLocaleString()}</p>
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg italic">
                                                {order.payments[0]?.provider || "COD"}
                                            </span>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/orders/${order.id}${window.location.search}`}
                                                    className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-white dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 text-zinc-400 hover:text-indigo-600 transition-all shadow-sm"
                                                    title="Profile"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link 
                                                    href={`/dashboard/orders/${order.id}/edit${window.location.search}`}
                                                    className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-white dark:hover:bg-zinc-700 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 text-zinc-400 hover:text-emerald-600 transition-all shadow-sm"
                                                    title="Modify"
                                                >
                                                    <FileText size={16} />
                                                </Link>
                                                <button 
                                                    className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20 text-zinc-400 hover:text-rose-500 transition-all"
                                                    title="Purge"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Refined */}
                {totalPages > 1 && (
                    <div className="p-7 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30">
                        <p className="text-[11px] font-semibold text-zinc-400 capitalize tracking-wide italic">Manifest page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

