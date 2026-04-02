"use client"

import { useState, useEffect, use } from "react"
import { 
    ChevronLeft, Edit, Package, Truck, CheckCircle, 
    Clock, MapPin, User, Mail, Phone, Calendar, 
    CreditCard, Receipt, History, AlertCircle, ExternalLink,
    ArrowLeft, ShoppingBag
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { OrderDetailsSkeleton } from "@/components/dashboard/DashboardSkeletons"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface OrderItem {
    id: string
    quantity: number
    price: number
    product: {
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
    items: OrderItem[]
    payments: Array<{
        provider: string
        status: string
        upiUTR?: string
    }>
    activities?: Array<{
        id: string
        status: string
        comment: string | null
        createdAt: string
    }>
    shippingCost: number
    taxRun: number
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { currency, t } = useDashboardStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search)
                const url = `/api/dashboard/orders/${id}?${searchParams.toString()}`
                
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data)
                }
            } catch (error) {
                console.error("Failed to fetch order:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading) return <OrderDetailsSkeleton />

    if (!order) return (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800">
            <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-xl font-bold tracking-tight">Order Profile Not Found</h3>
            <p className="text-zinc-500 mt-2 text-sm font-medium italic">The requested manifest does not exist in the archive.</p>
            <button 
                onClick={() => router.back()}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20"
            >
                Go Back
            </button>
        </div>
    )

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const parsedAddress = order.shippingAddress ? (order.shippingAddress.startsWith('{') ? JSON.parse(order.shippingAddress) : { address: order.shippingAddress }) : {}
    const displayPincode = parsedAddress.pincode || parsedAddress.zip || '000000'

    return (
        <div className="max-w-7xl mx-auto px-4 pb-16 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => router.back()}
                        className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 group shadow-sm"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Order Profile</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold capitalize tracking-wide text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20 italic">Official Record</span>
                            <p className="text-zinc-400 text-xs font-semibold font-mono tracking-wider ml-1 underline decoration-dotted underline-offset-4">#{order.id.slice(-12).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <PremiumButton 
                        href={`/dashboard/orders/${id}/edit${window.location.search}`}
                        icon={Edit}
                    >
                        Update Details
                    </PremiumButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Status Bento */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000">
                        <Package size={120} />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        <div className="space-y-2">
                            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">Logistics Status</p>
                            <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${order.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className={`text-sm font-bold capitalize ${order.status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {order.status.toLowerCase()}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">Placement Date</p>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="space-y-2 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">Payment Via</p>
                            <div className="flex items-center gap-2">
                                <CreditCard size={14} className="text-zinc-400" />
                                <p className="text-sm font-bold text-zinc-900 dark:text-white capitalize">{order.payments[0]?.provider || "Offline"}</p>
                            </div>
                        </div>
                        <div className="space-y-2 border-l border-zinc-100 dark:border-zinc-800 pl-8">
                            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">Fulfillment Path</p>
                            <div className="flex items-center gap-2">
                                <Truck size={14} className="text-emerald-500" />
                                <p className="text-sm font-bold text-zinc-900 dark:text-white capitalize">Express Delivery</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Order Items */}
                <div className="md:col-span-2 flex flex-col">
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="p-7 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-950/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight leading-none italic">Inventory Manifest</h3>
                                    <p className="text-[10px] font-semibold capitalize tracking-wide text-zinc-400 mt-1">Listing items included</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold capitalize tracking-wide text-indigo-600 bg-indigo-100 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200/50">
                                {order.items.length} Elements
                            </span>
                        </div>
                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 flex-1">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-7 flex items-center gap-6 group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 flex-shrink-0 group-hover:scale-105 transition-all shadow-sm">
                                        <Package className="text-zinc-200" size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-zinc-900 dark:text-white text-md tracking-tight truncate">{item.product.name}</h4>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-semibold text-zinc-400 italic">Qty:</span>
                                                <span className="text-xs font-bold text-indigo-600">{item.quantity}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-semibold text-zinc-400 italic">SKU:</span>
                                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight">{item.product.sku || '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] font-semibold text-zinc-400 italic mb-0.5">Unit Value</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{currency === "INR" ? "₹" : "$"}{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Summary Bento */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950 p-8 rounded-[40px] border border-zinc-800 shadow-2xl text-white flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    
                    {/* Shooting Stars */}
                    {[
                        { top: "10%", left: "10%", delay: 0, duration: 2.5 },
                        { top: "30%", left: "40%", delay: 1, duration: 3 },
                        { top: "60%", left: "20%", delay: 2, duration: 2.8 },
                        { top: "80%", left: "60%", delay: 1.5, duration: 3.2 }
                    ].map((star, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: "-100%", y: "-100%", opacity: 0 }}
                            animate={{ 
                                x: ["0%", "200%"], 
                                y: ["0%", "150%"],
                                opacity: [0, 0.6, 0] 
                            }}
                            transition={{ 
                                duration: star.duration, 
                                repeat: Infinity, 
                                ease: "linear", 
                                delay: star.delay,
                                repeatDelay: Math.random() * 3 + 1
                            }}
                            style={{ top: star.top, left: star.left }}
                            className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[25deg] pointer-events-none blur-[0.5px]"
                        />
                    ))}

                    <div className="absolute -right-10 -bottom-10 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000 bg-indigo-500 w-64 h-64 rounded-full" />
                    
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-[11px] font-bold capitalize tracking-[0.2em] text-zinc-500 italic">Settlement Statement</h3>
                        <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                            <Receipt size={18} className="text-indigo-400" />
                        </div>
                    </div>
                    
                    <div className="space-y-5 relative z-10 flex-1">
                        <div className="flex justify-between text-zinc-400 text-[12px] font-semibold italic">
                            <span>Subtotal Manifest</span>
                            <span className="text-zinc-100 font-mono tracking-tight">{currency === "INR" ? "₹" : "$"}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 text-[12px] font-semibold italic">
                            <span>Service Fee</span>
                            <span className="text-zinc-100 font-mono tracking-tight">{currency === "INR" ? "₹" : "$"}{order.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400 text-[12px] font-semibold italic">
                            <span>Applicable Taxes</span>
                            <span className="text-zinc-100 font-mono tracking-tight">{currency === "INR" ? "₹" : "$"}{order.taxRun.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-8 mt-auto border-t border-zinc-800/50">
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                        <p className="text-[10px] font-bold capitalize tracking-widest text-indigo-400 italic">Total Payable</p>
                                    </div>
                                    <p className="text-3xl font-bold tracking-tighter font-mono flex items-center gap-1">
                                        <span className="text-sm font-medium opacity-60 mt-1">{currency === "INR" ? "₹" : "$"}</span>
                                        {order.total.toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                    <CheckCircle size={22} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Customer Bento */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm group/bento">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm border border-emerald-100/50">
                        <User size={18} />
                    </div>
                    <h3 className="text-[11px] font-semibold capitalize tracking-wide text-zinc-400 italic mb-1.5">Customer Profile</h3>
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none truncate">{order.customer?.firstName} {order.customer?.lastName}</h4>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 group-hover/bento:text-emerald-500 transition-colors">
                                <Mail size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-semibold text-zinc-400 italic leading-none mb-1">Terminal Address</span>
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate tracking-tight">{order.customer?.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-400 group-hover/bento:text-indigo-500 transition-colors">
                                <Phone size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-semibold text-zinc-400 italic leading-none mb-1">Voice Communication</span>
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 tracking-tight">{order.customer?.phone || 'Unregistered'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Shipping Info Bento */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm group/bento">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100/50">
                        <Truck size={18} />
                    </div>
                    <h3 className="text-[11px] font-semibold capitalize tracking-wide text-zinc-400 italic mb-1.5">Logistics Context</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{order.carrier || 'Internal Fleet'}</p>
                            <p className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide mt-1 italic">Assigned Operator</p>
                        </div>
                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                            <Clock size={12} className="text-zinc-400" />
                            <span className="text-[10px] font-bold capitalize text-zinc-500 italic">Awaiting Terminal Dispatch</span>
                        </div>
                    </div>
                </div>

                {/* 6. Address Bento */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group/bento">
                    <div className="absolute -right-6 -bottom-6 text-zinc-50 dark:text-zinc-800/10 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                        <MapPin size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 mb-6 shadow-sm border border-amber-100/50">
                            <MapPin size={18} />
                        </div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">Destination Axis</h3>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                                {parsedAddress.firstName || order.customer?.firstName} {parsedAddress.lastName || order.customer?.lastName}
                            </p>
                            <div className="space-y-1 pt-1.5">
                                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed tracking-tight group-hover/bento:text-zinc-900 dark:group-hover:text-white transition-colors">
                                    {parsedAddress.address || 'Manifest details missing'}
                                </p>
                                {parsedAddress.apartment && (
                                    <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                                        {parsedAddress.apartment}
                                    </p>
                                )}
                                {parsedAddress.landmark && (
                                    <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-xl inline-block mt-1">
                                        Near: {parsedAddress.landmark}
                                    </p>
                                )}
                                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <p className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                                        {displayPincode}
                                    </p>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                        {parsedAddress.city || 'Terminal City'}{parsedAddress.state ? `, ${parsedAddress.state}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Journey Bento */}
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 p-10 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white shadow-sm border border-zinc-100 dark:border-zinc-700"
                            >
                                <History size={22} />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight leading-none text-zinc-900 dark:text-white">Order Journey</h3>
                                <p className="text-[10px] font-semibold capitalize tracking-wide text-zinc-400 mt-1.5 italic">Real-time status tracking pipeline</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative pb-4">
                        <div className="absolute top-8 left-10 right-10 h-1.5 bg-zinc-50 dark:bg-zinc-800 hidden md:block rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ 
                                    width: order.status === 'DELIVERED' ? "100%" : 
                                           order.status === 'SHIPPED' ? "75%" : 
                                           order.status === 'PAID' ? "50%" : "25%" 
                                }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                            {[
                                { title: "Placed", icon: ShoppingBag, date: order.createdAt, done: true },
                                { title: "Confirmed", icon: CreditCard, date: null, done: order.payments[0]?.status === 'COMPLETED' || order.status !== 'PENDING' },
                                { title: "Processing", icon: Package, date: null, done: ['SHIPPED', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(order.status) },
                                { title: "In Transit", icon: Truck, date: null, done: ['DELIVERED', 'OUT_FOR_DELIVERY'].includes(order.status) },
                                { title: "Delivered", icon: CheckCircle, date: null, done: order.status === 'DELIVERED' }
                            ].map((step, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="flex md:flex-col items-center md:text-center gap-5 group"
                                >
                                    <div className={`relative w-16 h-16 rounded-[24px] border-4 border-white dark:border-zinc-900 flex items-center justify-center transition-all duration-500 ${
                                        step.done 
                                            ? 'bg-indigo-600 shadow-xl shadow-indigo-500/30 text-white scale-110' 
                                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300'
                                    }`}>
                                        <step.icon size={24} className={step.done ? "animate-pulse" : ""} />
                                        {step.done && (
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center"
                                            >
                                                <CheckCircle size={10} className="text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className={`text-[11px] font-black uppercase tracking-widest transition-colors ${step.done ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 opacity-60'}`}>{step.title}</h4>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                            {step.date ? new Date(step.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Waiting'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
