"use client"

import { useState, useEffect, use } from "react"
import { 
    ChevronLeft, 
    User, 
    Mail, 
    ShoppingCart, 
    Package, 
    Heart, 
    Eye, 
    Clock, 
    CreditCard,
    Loader2
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface TimelineItem {
    id: string
    type: string
    description: string
    metadata: any
    createdAt: string
    category: "activity" | "order"
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const { id } = use(params)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{
        customer: any
        timeline: TimelineItem[]
    } | null>(null)

    useEffect(() => {
        if (!id) return
        const url = ownerId ? `/api/dashboard/customers/${id}/timeline?ownerId=${ownerId}` : `/api/dashboard/customers/${id}/timeline`
        fetch(url)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false))
    }, [id, ownerId])

    const getIcon = (type: string) => {
        switch (type) {
            case "VIEW_PRODUCT": return <Eye className="w-3 h-3 text-emerald-500" />
            case "ADD_TO_CART": return <ShoppingCart className="w-3 h-3 text-sky-500" />
            case "ADD_WISHLIST": return <Heart className="w-3 h-3 text-rose-500" />
            case "PLACE_ORDER": return <Package className="w-3 h-3 text-indigo-500" />
            default: return <Clock className="w-3 h-3 text-zinc-400" />
        }
    }

    const getLabel = (type: string) => {
        return type.toLowerCase().replace(/_/g, " ")
    }

    const getLabelColor = (type: string) => {
        switch (type) {
            case "VIEW_PRODUCT": return "bg-emerald-500"
            case "ADD_TO_CART": return "bg-sky-500"
            case "ADD_WISHLIST": return "bg-emerald-400"
            case "PLACE_ORDER": return "bg-emerald-400"
            default: return "bg-zinc-400"
        }
    }

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
    )

    if (!data) return <div>Customer not found</div>

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header / Breadcrumbs */}
            <div>
                <h1 className="text-2xl font-bold bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-4">Customer Timeline</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
                    <Link href={`/dashboard${ownerId ? `?ownerId=${ownerId}` : ""}`} className="hover:underline">Home</Link>
                    <span>/</span>
                    <Link href={`/dashboard/customers${ownerId ? `?ownerId=${ownerId}` : ""}`} className="hover:underline">Customer</Link>
                    <span>/</span>
                    <span className="text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase">{data.customer.firstName}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Customer Name", value: `${data.customer.firstName} ${data.customer.lastName}`, icon: <User className="text-white" size={20} />, iconBg: "bg-[#10B981]" },
                    { label: "Customer Email", value: data.customer.email, icon: <Mail className="text-sky-500" size={20} />, iconBg: "bg-[#F0F9FF]" },
                    { label: "Total Spend", value: (data.customer.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: <CreditCard className="text-[#F97316]" size={20} />, iconBg: "bg-[#FFF7ED]" },
                    { label: "Total Orders", value: data.customer.totalOrders, icon: <ShoppingCart className="text-indigo-500" size={20} />, iconBg: "bg-[#F5F3FF]" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-dotted border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-lg font-black text-zinc-900 dark:text-white truncate max-w-[200px]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative pt-10 pb-20">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                <div className="space-y-12">
                    {data.timeline.length === 0 ? (
                        <div className="text-center py-20 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No activity found</div>
                    ) : (
                        data.timeline.map((item, i) => (
                            <div key={item.id} className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Content Card */}
                                <div className="flex-1">
                                    <div className={`bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xl shadow-zinc-500/5 relative group hover:scale-[1.02] transition-transform ${i % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
                                        <div className="flex flex-col gap-4">
                                            <div className={`self-start px-3 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-2 ${getLabelColor(item.type)}`}>
                                                {getLabel(item.type)}
                                                {getIcon(item.type)}
                                            </div>

                                            {item.type === "PLACE_ORDER" ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                                                        <span>Order Id:- {item.metadata.orderId.slice(-14)}</span>
                                                        <span>Order Date:- {new Date(item.metadata.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Product:-</span>
                                                            <span className="px-3 py-1 bg-sky-500 text-white rounded text-[10px] font-bold truncate">
                                                                {item.description}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex justify-between">
                                                            <span>Order Price:- {(item.metadata.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                            <span className="text-zinc-400 text-[10px]">Payment Type:- cod</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Product:-</span>
                                                        <span className={`px-3 py-1 ${item.type === 'VIEW_PRODUCT' ? 'bg-sky-500' : item.type === 'ADD_TO_CART' ? 'bg-rose-500' : 'bg-emerald-500'} text-white rounded text-[10px] font-bold truncate`}>
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                    {item.metadata?.variant && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Variant:-</span>
                                                            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-sm text-[9px] font-black">{item.metadata.variant}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="text-[9px] text-zinc-400 font-bold uppercase border-t border-zinc-50 dark:border-zinc-900 pt-3">
                                                {new Date(item.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </div>
                                        </div>

                                        {/* Connector Dot */}
                                        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-full z-10 hidden md:block ${i % 2 === 0 ? '-right-[44px]' : '-left-[44px]'}`} />
                                    </div>
                                </div>
                                
                                {/* Spacer for other side */}
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
