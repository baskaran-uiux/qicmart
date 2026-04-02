"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Users, Search, User, Mail, Phone, ShoppingCart, 
    TrendingUp, Calendar, ChevronRight, Loader2,
    Filter, ArrowUpRight, DollarSign, Activity,
    MoreHorizontal, ExternalLink, MailPlus, Grid, List
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import AddCustomerModal from "@/components/dashboard/AddCustomerModal"
import { KpiCardSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface Customer {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    orderCount: number
    totalSpend: number
    aov: number
    lastActive: string | null
    status: string
    createdAt: string
}

export default function CustomersPage() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const { slug: storeSlug, t } = useDashboardStore()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [view, setView] = useState<"grid" | "list">("grid")
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchCustomers()
    }, [ownerId])

    const fetchCustomers = async () => {
        try {
            const url = ownerId ? `/api/dashboard/customers?ownerId=${ownerId}` : "/api/dashboard/customers"
            const res = await fetch(url)
            const data = await res.json()
            if (Array.isArray(data)) setCustomers(data)
        } catch (error) {
            console.error("Failed to fetch customers:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = 
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone && c.phone.includes(searchTerm))
        
        const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase()
        
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === "Active").length,
        new: customers.filter(c => c.status === "New").length,
        totalRevenue: customers.reduce((acc, c) => acc + c.totalSpend, 0)
    }

    const handleExport = () => {
        if (filteredCustomers.length === 0) return
        
        let csvContent = "data:text/csv;charset=utf-8,"
        csvContent += "First Name,Last Name,Email,Phone,Orders,Total Spend,Status,Joined\n"
        
        filteredCustomers.forEach(c => {
            csvContent += `"${c.firstName}","${c.lastName}","${c.email}","${c.phone || ''}",${c.orderCount},${c.totalSpend},"${c.status}","${new Date(c.createdAt).toLocaleDateString()}"\n`
        })
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Removed early return for loading to show header + skeletons

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-black dark:text-white capitalize">
                        Customers
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
                        Manage your relationship with {stats.total} shoppers and track their value.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 shadow-sm">
                        <button 
                            onClick={() => setView("grid")} 
                            className={`p-2.5 rounded-xl transition-all ${view === "grid" ? "bg-indigo-600 dark:bg-zinc-800 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-400 hover:text-indigo-600"}`}
                            title="Grid View"
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setView("list")} 
                            className={`p-2.5 rounded-xl transition-all ${view === "list" ? "bg-indigo-600 dark:bg-zinc-800 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-400 hover:text-indigo-600"}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="p-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all group shadow-sm"
                        title="Add Customer"
                    >
                        <MailPlus className="group-hover:scale-110 transition-transform" size={20} strokeWidth={2.5} />
                    </button>
                    <PremiumButton 
                        onClick={handleExport}
                        icon={Users}
                    >
                        Export
                    </PremiumButton>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard 
                            label="Total Shoppers" 
                            value={stats.total} 
                            subtext="Growth +12% this month" 
                            icon={Users} 
                            color="indigo" 
                        />
                        <StatCard 
                            label="Active Members" 
                            value={stats.active} 
                            subtext="Regular purchasers" 
                            icon={Activity} 
                            color="emerald" 
                        />
                        <StatCard 
                            label="New Leads" 
                            value={stats.new} 
                            subtext="First-time buyers" 
                            icon={TrendingUp} 
                            color="amber" 
                        />
                        <StatCard 
                            label="LTV (Total)" 
                            value={stats.totalRevenue.toLocaleString(undefined, { style: 'currency', currency: 'INR' })} 
                            subtext="Estimated lifetime value" 
                            icon={DollarSign} 
                            color="purple" 
                        />
                    </>
                )}
            </div>

            <AddCustomerModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onSuccess={() => fetchCustomers()} 
                ownerId={ownerId} 
            />

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="relative w-full lg:w-[400px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-indigo-600/30 rounded-2xl text-sm font-bold outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {["All", "Active", "Inactive", "New"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status.toLowerCase())}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                statusFilter === status.toLowerCase()
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2 hidden lg:block" />
                    <button className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-xl hover:bg-zinc-100 transition-all">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Customers List */}
            <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {loading ? (
                    <div className="col-span-full">
                        <TableSkeleton />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer, idx) => (
                                view === "grid" ? (
                                    <CustomerCard 
                                        key={customer.id} 
                                        customer={customer} 
                                        index={idx}
                                        ownerId={ownerId}
                                    />
                                ) : (
                                    <CustomerListItem 
                                        key={customer.id} 
                                        customer={customer} 
                                        index={idx}
                                        ownerId={ownerId}
                                    />
                                )
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white dark:bg-zinc-900 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[60px]">
                                <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[40px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <Users size={48} className="text-zinc-300" />
                                </div>
                                <h4 className="text-3xl font-bold text-black dark:text-white tracking-tight">No Customers Found</h4>
                                <p className="text-zinc-500 font-semibold mt-3 max-w-sm mx-auto text-xs leading-relaxed">
                                    We couldn't find any customers matching your current filters or search query.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, subtext, icon: Icon, color }: any) {
    const colors: any = {
        indigo: "text-indigo-600 bg-indigo-600/10 border-indigo-600/20 shadow-indigo-600/10",
        emerald: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20 shadow-emerald-600/10",
        amber: "text-amber-600 bg-amber-600/10 border-amber-600/20 shadow-amber-600/10",
        purple: "text-purple-600 bg-purple-600/10 border-purple-600/20 shadow-purple-600/10"
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
        >
            <div className="relative z-10 flex flex-col gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${colors[color]} group-hover:scale-110 transition-transform shadow-lg shadow-current/10`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
                    <h3 className="text-3xl font-bold tracking-tighter text-black dark:text-white">
                        {value}
                    </h3>
                    <p className="text-[11px] font-semibold text-zinc-500">{subtext}</p>
                </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-current ${colors[color].split(' ')[0]}`}></div>
        </motion.div>
    )
}

function CustomerCard({ customer, index, ownerId }: { customer: Customer, index: number, ownerId: string | null }) {
    const statusColors: any = {
        Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        Inactive: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        New: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    }

    return (
        <Link 
            href={`/dashboard/customers/${customer.id}${ownerId ? `?ownerId=${ownerId}` : ""}`}
            className="block"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all h-full"
            >
                <div className="flex flex-col gap-6">
                    {/* Profile Section */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-indigo-600 to-indigo-800 p-0.5 shadow-xl shadow-indigo-600/20">
                                <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[22px] flex items-center justify-center text-indigo-600">
                                    <User size={28} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-black dark:text-white tracking-tight truncate max-w-[150px]">
                                    {customer.firstName} {customer.lastName}
                                </h4>
                                <div className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${statusColors[customer.status] || "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                                    {customer.status}
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all shadow-sm">
                            <ChevronRight size={20} strokeWidth={3} />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                            <div className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 transition-colors">
                                <Mail size={14} />
                            </div>
                            <span className="text-xs font-semibold truncate tracking-tight">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                            <div className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                <Phone size={14} />
                            </div>
                            <span className="text-xs font-semibold truncate tracking-tight">{customer.phone || "No phone added"}</span>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-transparent group-hover:border-indigo-600/10 transition-all">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Orders</p>
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={14} className="text-indigo-600" />
                                <span className="text-lg font-bold text-black dark:text-white tracking-tighter">{customer.orderCount}</span>
                            </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Spend</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-500">₹</span>
                                <span className="text-lg font-bold text-black dark:text-white tracking-tighter">
                                    {customer.totalSpend.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footnote */}
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 tracking-wide pt-2">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                        <MoreHorizontal size={14} />
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function CustomerListItem({ customer, index, ownerId }: { customer: Customer, index: number, ownerId: string | null }) {
    const statusColors: any = {
        Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        Inactive: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        New: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
    }

    return (
        <Link 
            href={`/dashboard/customers/${customer.id}${ownerId ? `?ownerId=${ownerId}` : ""}`}
            className="block"
        >
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 shrink-0 border border-zinc-100 dark:border-zinc-700">
                        <User size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h4 className="font-bold text-zinc-900 dark:text-white truncate">
                                {customer.firstName} {customer.lastName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wide border ${statusColors[customer.status] || "bg-zinc-100 text-zinc-500"}`}>
                                {customer.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5 min-w-0">
                                <Mail size={12} /> <span className="truncate">{customer.email}</span>
                            </span>
                            {customer.phone && (
                                <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                                    <Phone size={12} /> {customer.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 px-4 md:px-0 w-full md:w-auto overflow-x-auto no-scrollbar py-2 md:py-0 border-t md:border-t-0 border-zinc-50 dark:border-zinc-800">
                    <div className="flex flex-col items-center gap-1 min-w-[70px]">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Orders</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{customer.orderCount}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[90px]">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Total Spend</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">₹{customer.totalSpend.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Joined</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}</p>
                    </div>
                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-indigo-600 transition-colors shrink-0" strokeWidth={3} />
                </div>
            </motion.div>
        </Link>
    )
}
