"use client"

import { useState, useEffect } from "react"
import { 
    RotateCcw, CheckCircle, XCircle, Search, 
    MoreVertical, Eye, Loader2, Filter, 
    ArrowLeft, Calendar, Package, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { KpiCardSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface Order {
    id: string
    total: number
    status: string
    createdAt: string
    customer: {
        firstName: string
        lastName: string
        email: string
    } | null
    items: Array<{
        id: string
        quantity: number
        price: number
        product: { name: string }
    }>
}

export default function ReturnsPage() {
    const { currency, t } = useDashboardStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const fetchReturns = async () => {
        try {
            const res = await fetch("/api/dashboard/orders")
            const data = await res.json()
            // Filter orders that have return-related statuses
            const returnOrders = Array.isArray(data) ? data.filter((o: Order) => 
                ["RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(o.status)
            ) : []
            setOrders(returnOrders)
        } catch (error) {
            console.error("Failed to fetch returns:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReturns()
    }, [])

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(search.toLowerCase()) ||
            `${order.customer?.firstName} ${order.customer?.lastName}`.toLowerCase().includes(search.toLowerCase())
        
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
        
        return matchesSearch && matchesStatus
    })

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/orders" className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-90">
                            <ArrowLeft size={18} className="text-zinc-500" />
                        </Link>
                        <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize truncate">
                            {t("returnsRefunds") || "Returns & Refunds"}
                        </h2>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal ml-12">Manage customer returns and process refunds</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-[24px] border border-amber-100 dark:border-amber-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Pending Requests</p>
                            <h3 className="text-2xl font-bold text-black dark:text-white">{orders.filter(o => o.status === "RETURN_REQUESTED").length}</h3>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-[24px] border border-emerald-100 dark:border-emerald-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <CheckCircle size={20} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Refunded Total</p>
                            <h3 className="text-2xl font-bold text-black dark:text-white">{orders.filter(o => o.status === "REFUNDED").length}</h3>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by ID or customer name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-zinc-400 ml-2" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:w-[200px] p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm shadow-sm outline-none cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="RETURN_REQUESTED">Requested</option>
                        <option value="RETURNED">Returned</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Order Details</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <TableSkeleton />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <RotateCcw size={48} className="text-zinc-200" />
                                            <p className="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">No return requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-black dark:text-white uppercase">#{order.id.substring(0, 8)}</p>
                                                    <p className="text-xs text-zinc-500 font-bold mt-0.5">{order.items.length} Items • {currency}{order.total.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-black dark:text-white">{order.customer?.firstName} {order.customer?.lastName}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold">{order.customer?.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                order.status === 'REFUNDED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                order.status === 'RETURN_REQUESTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Calendar size={14} />
                                                <p className="text-[10px] font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={`/dashboard/orders?id=${order.id}`} className="p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all text-zinc-500 hover:text-indigo-600 inline-block">
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
