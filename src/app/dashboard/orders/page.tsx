"use client"

import { useState, useEffect } from "react"
import { 
    Clock, CheckCircle, Truck, Package, XCircle, Search, 
    MoreVertical, Eye, FileText, Loader2, ArrowRight, TruckIcon, MapPin, Calendar, 
    ChevronDown, ChevronUp, History as HistoryIcon, ExternalLink, Plus, ChevronLeft, ChevronRight, QrCode
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

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
        address?: string
        city?: string
        state?: string
        pincode?: string
    } | null
    shippingAddress?: string
    billingAddress?: string
    items: OrderItem[]
    payments: Array<{
        provider: string
        status: string
        upiUTR?: string
        upiProofImage?: string
    }>
    trackingNumber?: string
    carrier?: string
    trackingUrl?: string
    activities?: Array<{
        id: string
        status: string
        comment: string | null
        createdAt: string
    }>
}

export default function OrdersPage() {
    const { currency } = useDashboardStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showTrackingModal, setShowTrackingModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [trackingForm, setTrackingForm] = useState({
        carrier: "",
        trackingNumber: "",
        comment: "",
        status: ""
    })

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/orders?ownerId=${ownerId}` : "/api/dashboard/orders"
            
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            
            const contentType = res.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Received non-JSON response from server")
            }

            const data = await res.json()
            setOrders(Array.isArray(data) ? data : [])
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

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/orders?ownerId=${ownerId}` : "/api/dashboard/orders"

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus })
            })
            if (res.ok) fetchOrders()
        } catch (error) {
            console.error("Update failed:", error)
        } finally {
            setUpdatingId(null)
        }
    }

    const updateTracking = async () => {
        if (!selectedOrder) return
        setUpdatingId(selectedOrder.id)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/orders?ownerId=${ownerId}` : "/api/dashboard/orders"

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    orderId: selectedOrder.id, 
                    ...trackingForm 
                })
            })
            if (res.ok) {
                fetchOrders()
                setShowTrackingModal(false)
                setSelectedOrder(null)
            }
        } catch (error) {
            console.error("Update failed:", error)
        } finally {
            setUpdatingId(null)
        }
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING": return <Clock size={14} />
            case "PAID": return <CheckCircle size={14} />
            case "SHIPPED": return <Truck size={14} />
            case "DELIVERED": return <Package size={14} />
            case "CANCELLED": return <XCircle size={14} />
            default: return null
        }
    }
    const renderAddress = (address: string | null | undefined) => {
        if (!address) return null
        try {
            if (address.trim().startsWith('{')) {
                const p = JSON.parse(address)
                return (
                    <div className="space-y-2 not-italic">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20" />
                            <span className="font-bold text-black dark:text-white capitalize tracking-tight text-xs">{p.firstName} {p.lastName}</span>
                        </div>
                        <div className="pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-1">
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium">{p.address}</p>
                            <p className="text-zinc-900 dark:text-zinc-200 font-medium">{p.city}, {p.state} {p.pincode}</p>
                            {p.phone && (
                                <p className="text-[10px] font-bold capitalize text-indigo-500 mt-2 inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
                                    <span className="w-1 h-1 rounded-full bg-indigo-500" />
                                    Tel: {p.phone}
                                </p>
                            )}
                        </div>
                    </div>
                )
            }
        } catch (e) {}
        return <p className="italic">{address}</p>
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Orders</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Track and manage your customer orders.</p>
                </div>
                <div className="relative group w-full sm:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search orders..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm md:w-64" 
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-zinc-400 mb-4" size={32} />
                    <p className="text-zinc-500">Loading your orders...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-20 text-center shadow-sm">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6 border border-zinc-100 dark:border-zinc-700 shadow-sm">
                        <Package className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">No orders found</h3>
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                        {search ? "Try adjusting your search filters." : "When customers place orders on your store, they will appear here."}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <table className="w-full text-[12px] sm:text-[14px] text-left">
                            <thead className="bg-[#F8FAFC] dark:bg-zinc-950 text-[#334155] dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-left">Order ID</th>
                                    <th className="px-6 py-4 text-left">Customer</th>
                                    <th className="px-6 py-4 text-left">Total</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {paginatedOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-black dark:text-white uppercase tracking-tight">#{order.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-black dark:text-white truncate max-w-[150px]">{order.customer?.firstName} {order.customer?.lastName}</span>
                                                <span className="text-xs text-zinc-400 truncate max-w-[150px]">{order.customer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-semibold text-black dark:text-white">
                                                {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{order.total.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyles(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                                {order.payments[0]?.provider === "UPI" && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md border border-indigo-500/20 flex items-center gap-1">
                                                        <QrCode size={10} /> UPI
                                                    </span>
                                                )}
                                                {order.payments[0]?.provider === "OFFLINE" && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-md">COD</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-zinc-500 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select 
                                                    value={order.status}
                                                    disabled={updatingId === order.id}
                                                    onChange={e => updateStatus(order.id, e.target.value)}
                                                    className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PAID">Paid</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setShowDetailsModal(true)
                                                    }}
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setTrackingForm({
                                                            carrier: order.carrier || "",
                                                            trackingNumber: order.trackingNumber || "",
                                                            comment: "",
                                                            status: order.status
                                                        })
                                                        setShowTrackingModal(true)
                                                    }}
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 transition-colors"
                                                    title="Manage Tracking"
                                                >
                                                    <TruckIcon size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
                                <div className="text-xs font-bold text-zinc-500">
                                    Showing <span className="text-black dark:text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-black dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-black dark:text-white font-bold">{filtered.length}</span> orders
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
                </div>
            )}

            {/* Tracking Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white">Order Tracking</h3>
                                <p className="text-zinc-500 text-xs mt-1 uppercase font-black tracking-widest italic">#{selectedOrder.id.substring(0, 12)}</p>
                            </div>
                            <button onClick={() => setShowTrackingModal(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <XCircle size={24} className="text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Form */}
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Shipping Carrier</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. FedEx, BlueDart" 
                                        value={trackingForm.carrier}
                                        onChange={e => setTrackingForm(f => ({ ...f, carrier: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Tracking Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter tracking ID" 
                                        value={trackingForm.trackingNumber}
                                        onChange={e => setTrackingForm(f => ({ ...f, trackingNumber: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Update Status</label>
                                    <select 
                                        value={trackingForm.status}
                                        onChange={e => setTrackingForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none cursor-pointer"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Add Comment</label>
                                    <textarea 
                                        placeholder="Internal note or customer message..." 
                                        value={trackingForm.comment}
                                        onChange={e => setTrackingForm(f => ({ ...f, comment: e.target.value }))}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px] resize-none"
                                    />
                                </div>
                                <button 
                                    disabled={updatingId === selectedOrder.id}
                                    onClick={updateTracking}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {updatingId === selectedOrder.id ? "Updating..." : "Save Tracking Info"}
                                </button>
                            </div>

                            {/* Activity Log */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <HistoryIcon size={16} className="text-zinc-400" />
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Activity History</label>
                                </div>
                                
                                <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-zinc-100 dark:before:bg-zinc-800">
                                    {(selectedOrder.activities || []).map((activity, idx) => (
                                        <div key={activity.id} className="relative pl-10">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center ${idx === 0 ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                                                {idx === 0 && <span className="w-1 h-1 bg-white rounded-full animate-ping" />}
                                            </div>
                                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{activity.status}</span>
                                                    <span className="text-[10px] text-zinc-400 font-bold">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">"{activity.comment || "Status updated"}"</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedOrder.activities || selectedOrder.activities.length === 0) && (
                                        <div className="pl-10 text-zinc-400 text-sm font-medium italic">No activity logged yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white">Order Details</h3>
                                <p className="text-zinc-500 text-xs mt-1 uppercase font-black tracking-widest italic">#{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => { setShowDetailsModal(false); setSelectedOrder(null); }} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <XCircle size={24} className="text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Items & Summary */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Package size={14} />
                                                Order Items
                                            </h4>
                                            <span className="text-[10px] font-bold text-zinc-400 px-2 py-0.5 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
                                                {selectedOrder.items.length} Items
                                            </span>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="text-[10px] uppercase font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left">Product</th>
                                                    <th className="px-6 py-3 text-center">Qty</th>
                                                    <th className="px-6 py-3 text-right">Price</th>
                                                    <th className="px-6 py-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {selectedOrder.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-black dark:text-white">{item.product.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-zinc-500 font-medium">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-zinc-500 font-medium">
                                                            {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{item.price.toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-black dark:text-white">
                                                            {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{(item.quantity * item.price).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-zinc-100/30 dark:bg-zinc-800/30">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-zinc-500 italic">Total Amount</td>
                                                    <td className="px-6 py-4 text-right text-lg font-black text-indigo-600">
                                                        {currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}{selectedOrder.total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2 italic">
                                                <FileText size={14} />
                                                Payment Method
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-bold text-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                                        {selectedOrder.payments[0]?.provider === 'UPI' && <QrCode size={20} className="text-indigo-600" />}
                                                        {selectedOrder.payments[0]?.provider || "N/A"}
                                                    </p>
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedOrder.payments[0]?.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                        {selectedOrder.payments[0]?.status || "PENDING"}
                                                    </span>
                                                </div>

                                                {selectedOrder.payments[0]?.provider === 'UPI' && (selectedOrder.payments[0]?.upiUTR || selectedOrder.payments[0]?.upiProofImage) && (
                                                    <div className="pt-4 mt-4 border-t border-emerald-100 dark:border-emerald-500/10 space-y-4">
                                                        {selectedOrder.payments[0]?.upiUTR && (
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Transaction ID / UTR</p>
                                                                <p className="text-sm font-bold text-indigo-600 tracking-tight">{selectedOrder.payments[0].upiUTR}</p>
                                                            </div>
                                                        )}
                                                        {selectedOrder.payments[0]?.upiProofImage && (
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Payment Proof Screenshot</p>
                                                                <a 
                                                                    href={selectedOrder.payments[0].upiProofImage} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="block relative group overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                                                >
                                                                    <img 
                                                                        src={selectedOrder.payments[0].upiProofImage} 
                                                                        alt="Payment Proof" 
                                                                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <ExternalLink size={20} className="text-white" />
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {selectedOrder.payments[0]?.status !== 'COMPLETED' && (selectedOrder.payments[0]?.provider === 'UPI' || selectedOrder.payments[0]?.provider === 'OFFLINE') && (
                                                    <button 
                                                        onClick={() => updateStatus(selectedOrder.id, "PAID")}
                                                        disabled={updatingId === selectedOrder.id}
                                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-4"
                                                    >
                                                        <CheckCircle size={14} /> Verify & Mark as Paid
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 bg-blue-50/30 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2 italic">
                                                <Truck size={14} />
                                                Shipping Status
                                            </h4>
                                            <div className="space-y-2">
                                                <p className="text-xl font-bold text-black dark:text-white">{selectedOrder.status}</p>
                                                {selectedOrder.trackingNumber && (
                                                    <p className="text-xs text-zinc-500 font-medium">Tracking: <span className="text-blue-600">{selectedOrder.trackingNumber}</span> ({selectedOrder.carrier})</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Customer & Address */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 italic">
                                                Customer Information
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[10px] text-zinc-400 font-bold uppercase block">Name</label>
                                                    <p className="text-sm font-bold text-black dark:text-white">{selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-zinc-400 font-bold uppercase block">Email</label>
                                                    <p className="text-sm font-medium text-indigo-600">{selectedOrder.customer?.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-zinc-400 font-bold uppercase block">Phone</label>
                                                    <p className="text-sm font-medium text-black dark:text-white">{selectedOrder.customer?.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 italic">
                                                Shipping Address
                                            </h4>
                                            <div className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                                                <MapPin className="shrink-0 text-zinc-300" size={18} />
                                                <div className="text-sm font-medium leading-relaxed italic w-full">
                                                    {selectedOrder.shippingAddress ? (
                                                        renderAddress(selectedOrder.shippingAddress)
                                                    ) : selectedOrder.customer?.address ? (
                                                        renderAddress(selectedOrder.customer.address)
                                                    ) : (
                                                        <p>
                                                            {(selectedOrder.customer?.city || selectedOrder.customer?.state) && (
                                                                <>{[selectedOrder.customer?.city, selectedOrder.customer?.state].filter(Boolean).join(", ")}<br /></>
                                                            )}
                                                            {selectedOrder.customer?.pincode}
                                                        </p>
                                                    )}
                                                    {!selectedOrder.shippingAddress && !selectedOrder.customer?.address && !selectedOrder.customer?.city && (
                                                        <span className="text-zinc-400">No address provided.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 italic">
                                                Order Timeline
                                            </h4>
                                            <div className="space-y-4">
                                                {(selectedOrder.activities || []).slice(0, 3).map((activity) => (
                                                    <div key={activity.id} className="flex gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-black dark:text-white uppercase">{activity.status}</p>
                                                            <p className="text-[10px] text-zinc-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setShowTrackingModal(true);
                                        }}
                                        className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <TruckIcon size={16} />
                                        Manage Shipping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
