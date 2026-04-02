"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    Search, Truck, Package, CheckCircle, Clock, 
    AlertCircle, Loader2, ChevronRight, MessageCircle,
    Calendar, MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
// Replace date-fns with a simple native formatter
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(date);
};

export default function TrackOrderPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = use(params)
    const slug = resolvedParams.slug
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const [orderId, setOrderId] = useState(searchParams.get("id") || "")
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [storeInfo, setStoreInfo] = useState<any>(null)

    useEffect(() => {
        const fetchStore = async () => {
            const res = await fetch(`/api/store-info?slug=${slug}`)
            if (res.ok) setStoreInfo(await res.json())
        }
        fetchStore()
    }, [slug])

    const fetchOrder = async (id: string) => {
        if (!id) return
        
        // Clean the ID: remove #, spaces, and "ORD-" prefix
        const cleanId = id.trim().replace(/^#/, '').replace(/^ORD-/, '').replace(/\s/g, '').toUpperCase()
        
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/ordertrack?id=${cleanId}`)
            if (res.ok) {
                setOrder(await res.json())
            } else {
                setError("Order not found. Please check the ID and try again.")
                setOrder(null)
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const id = searchParams.get("id")
        if (id) {
            setOrderId(id)
            fetchOrder(id)
        }
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!orderId) return
        router.push(`/s/${slug}/track?id=${orderId}`)
        fetchOrder(orderId)
    }

    const statuses = [
        { key: 'PENDING', label: 'Order Placed', icon: Clock, desc: 'We have received your order.' },
        { key: 'PAID', label: 'Payment Confirmed', icon: CheckCircle, desc: 'Your payment was successful.' },
        { key: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'Your package is on its way.' },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Package, desc: 'The delivery partner is nearby.' },
        { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, desc: 'Package delivered successfully!' }
    ]

    const getStatusIndex = (currentStatus: string) => {
        return statuses.findIndex(s => s.key === currentStatus)
    }

    const currentStatusIndex = order ? getStatusIndex(order.status) : -1

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronRight className="rotate-180 text-zinc-600" size={20} />
                    </button>
                    <h1 className="text-lg font-black text-zinc-900 tracking-tight italic">Track Order</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 pt-8">
                {/* Search Box */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Enter Order ID (e.g. ord_...)" 
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="w-full pl-12 pr-4 py-5 bg-white border-2 border-zinc-100 rounded-3xl text-sm font-bold focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-xl shadow-indigo-500/5 group-hover:border-zinc-200"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-indigo-500 transition-colors" size={20} />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : "Track"}
                        </button>
                    </div>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex flex-col items-center text-center gap-4"
                        >
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-red-900">Wait a minute!</p>
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {!order && !loading && !error && (
                        <div className="text-center py-10 opacity-50 space-y-4">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                <Package size={40} />
                            </div>
                            <p className="text-sm font-bold text-zinc-500 max-w-xs mx-auto text-balance">Enter your Order ID found in your confirmation message to track its live status.</p>
                        </div>
                    )}

                    {order && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <Truck size={100} />
                                </div>
                                
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full animate-pulse ${order.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                                <span className="text-2xl font-black text-zinc-900 tracking-tight italic">{order.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Order ID</p>
                                            <p className="text-sm font-bold text-zinc-900">#ORD-{order.id.substring(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ordered On</span>
                                            </div>
                                            <p className="text-xs font-bold text-zinc-900">{formatDate(new Date(order.createdAt))}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <Truck size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Courier</span>
                                            </div>
                                            <p className="text-xs font-bold text-zinc-900">{order.carrier || "Processing..."}</p>
                                        </div>
                                    </div>

                                    {order.trackingNumber && (
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Tracking Number</p>
                                            <p className="text-sm font-black text-indigo-900 tracking-wider">{order.trackingNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200 shadow-sm">
                                <h3 className="text-lg font-black text-zinc-900 tracking-tight italic mb-8">Shipment Progress</h3>
                                
                                <div className="relative pl-10 space-y-12">
                                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-zinc-100" />
                                    
                                    {statuses.map((status, index) => {
                                        const isCompleted = index <= currentStatusIndex
                                        const isCurrent = index === currentStatusIndex
                                        const StatusIcon = status.icon

                                        return (
                                            <div key={status.key} className="relative">
                                                {/* Dot/Icon */}
                                                <div className={`absolute -left-10 top-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                                    isCompleted 
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                                        : 'bg-zinc-100 text-zinc-400'
                                                }`}>
                                                    <StatusIcon size={16} />
                                                </div>

                                                {/* Content */}
                                                <div className={isCompleted ? 'opacity-100' : 'opacity-40'}>
                                                    <h4 className={`text-sm font-black ${isCurrent ? 'text-indigo-600' : 'text-zinc-900'}`}>{status.label}</h4>
                                                    <p className="text-[10px] font-medium text-zinc-500">{status.desc}</p>
                                                    {isCurrent && (
                                                        <div className="mt-2 inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">
                                                            Active Step
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Need Help WhatsApp */}
                            {storeInfo?.whatsappNumber && (
                                <a 
                                    href={`https://wa.me/${storeInfo.whatsappNumber.replace(/\D/g, '')}?text=Hi, I need help with my order #${order.id.substring(0, 8).toUpperCase()}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] group hover:bg-emerald-100 transition-all text-center"
                                >
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                                        <MessageCircle size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-emerald-900 tracking-tight italic">Need Help with Order?</h3>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">Talk to us on WhatsApp</p>
                                </a>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
