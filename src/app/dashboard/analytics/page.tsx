"use client"

import { useEffect, useState } from "react"
import { 
    BarChart2, TrendingUp, ShoppingCart, IndianRupee, Package, Users, 
    Download, Filter, ChevronDown, Search, ArrowUpRight, ArrowDownRight,
    Star, RefreshCw, Box, ExternalLink, Calendar, MoreHorizontal, MapPin
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion"
import { KpiCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

export default function AnalyticsPage() {
    const { currency, t } = useDashboardStore()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("date")
    const [timeRange, setTimeRange] = useState("This Month")
    const [performanceYear, setPerformanceYear] = useState("This Year")
    const [showTimeRange, setShowTimeRange] = useState(false)
    const [showYearFilter, setShowYearFilter] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [showSort, setShowSort] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/analytics?ownerId=${ownerId}` : "/api/dashboard/analytics"

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                return res.json()
            })
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error fetching analytics:", err)
                setLoading(false)
            })
    }, [])

    // Removed early return for loading to show header + skeletons

    const analytics = data?.analytics || []
    const metrics = data?.metrics || { current: { revenue: 0, orders: 0, customers: 0 }, last: { revenue: 0, orders: 0, customers: 0 }, returnProducts: 0 }
    const initialOrders = data?.recentOrders || []

    // Filtered and Sorted Orders
    const filteredOrders = initialOrders.filter((order: any) => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.firstItem?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a: any, b: any) => {
        if (sortBy === "total") return b.total - a.total
        if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy === "status") return a.status.localeCompare(b.status)
        return 0
    })

    const handleExport = () => {
        const headers = ["Order ID", "Date", "Customer", "Product", "Status", "Items", "Total"]
        const rows = filteredOrders.map((o: any) => [
            o.id,
            new Date(o.createdAt).toLocaleDateString(),
            o.customerName,
            o.firstItem?.name || "N/A",
            o.status,
            o.itemsCount,
            o.total
        ])
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const monthlySales = new Array(12).fill(0)
    const monthlyOrders = new Array(12).fill(0)

    analytics.forEach((item: any) => {
        const date = new Date(item.date)
        const month = date.getMonth()
        monthlySales[month] += item.revenue
        monthlyOrders[month] += item.orders
    })

    const formatCurrency = (val: number) => {
        const symbol = currency === "INR" ? "₹" : currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "USD" ? "$" : "₹"
        return `${symbol}${val.toLocaleString()}`
    }

    const calculateTrend = (current: number, last: number) => {
        if (last === 0) return current > 0 ? 100 : 0
        return ((current - last) / last) * 100
    }

    const salesTrend = calculateTrend(metrics.current.orders, metrics.last.orders)
    const revenueTrend = calculateTrend(metrics.current.revenue, metrics.last.revenue)
    const customerTrend = calculateTrend(metrics.current.customers, metrics.last.customers)

    const currentMonthIndex = new Date().getMonth()
    const chartData = MONTHS.map((name, i) => ({
        name,
        sales: monthlySales[i],
        orders: monthlyOrders[i],
        fill: i === currentMonthIndex ? "#4f46e5" : "#f1f5f9"
    }))

    const growthPercent = Math.min(Math.max(revenueTrend, 0), 100)
    const gaugeData = [
        { name: 'Growth', value: growthPercent, fill: '#3b82f6' },
        { name: 'Remaining', value: 100 - growthPercent, fill: '#f1f5f9' }
    ]

    const salesByRegion = data?.salesByRegion || []

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Sales Overview Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="t-h2 text-zinc-950 dark:text-white">{t("salesOverview")}</h2>
                    <p className="t-body-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("salesSummary")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => setShowTimeRange(!showTimeRange)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full text-[13px] font-bold text-zinc-600 dark:text-zinc-300 transition-all active:scale-95"
                        >
                            {t(timeRange.toLowerCase().replace(" ", "") as any)} <ChevronDown size={14} className={`transition-transform duration-300 ${showTimeRange ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showTimeRange && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-none z-50 p-2"
                                >
                                    {["Today", "This Week", "This Month", "This Year"].map((range) => (
                                        <button 
                                            key={range}
                                            onClick={() => { setTimeRange(range); setShowTimeRange(false) }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${timeRange === range ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                        >
                                            {t(range.toLowerCase().replace(" ", "") as any)}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button 
                        onClick={handleExport}
                        title={t("export")}
                        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full transition-all active:scale-95"
                    >
                        <Download size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)
                ) : (
                    <>
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[32px] border-2 border-blue-400/40 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="t-label text-blue-50/70">{t("totalSales")}</span>
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600">
                                        <ShoppingCart size={20} />
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 mb-2">
                                    <p className="t-h1 text-white">{metrics.current.orders.toLocaleString()}</p>
                                    <span className="mb-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-0.5">
                                        {salesTrend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(salesTrend).toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-[13px] font-bold text-blue-100/50 opacity-80">{t("lastMonth")}: {metrics.last.orders}</p>
                            </div>
                        </div>

                        {[
                            { label: "newCustomer", value: metrics.current.customers.toLocaleString(), last: metrics.last.customers, trend: customerTrend, icon: Users, color: "bg-zinc-950 text-white", iconColor: "text-zinc-400" },
                            { label: "returnProducts", value: metrics.returnProducts.toLocaleString(), last: 0, trend: 0, icon: Box, color: "bg-blue-500 text-white", iconColor: "text-blue-200" },
                            { label: "totalRevenue", value: formatCurrency(metrics.current.revenue), last: formatCurrency(metrics.last.revenue), trend: revenueTrend, icon: IndianRupee, color: "bg-indigo-500 text-white", iconColor: "text-indigo-200" },
                        ].map((kpi) => (
                            <div key={kpi.label} className="p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="t-label pl-1">{t(kpi.label as any)}</span>
                                    <div className={`w-10 h-10 ${kpi.color} rounded-2xl flex items-center justify-center`}>
                                        <kpi.icon size={20} />
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 mb-2">
                                    <p className="t-h1 text-zinc-900 dark:text-white">{kpi.value} </p>
                                    {kpi.label !== "returnProducts" && (
                                        <span className={`mb-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 ${kpi.trend >= 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                            {kpi.trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(kpi.trend).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] font-bold text-zinc-400 opacity-80 pl-1">{t("lastMonth")}: {kpi.last}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {loading ? (
                    <>
                        <div className="lg:col-span-2">
                            <ChartSkeleton />
                        </div>
                        <div className="h-full">
                            <ChartSkeleton />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{t("performanceOverview")}</h3>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowYearFilter(!showYearFilter)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
                                    >
                                        {t(performanceYear.toLowerCase().replace(" ", "") as any)} <ChevronDown size={14} className={`transition-transform duration-300 ${showYearFilter ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showYearFilter && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2"
                                            >
                                                {["This Year", "Last Year"].map((year) => (
                                                    <button 
                                                        key={year}
                                                        onClick={() => { setPerformanceYear(year); setShowYearFilter(false) }}
                                                        className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                    >
                                                        {t(year.toLowerCase().replace(" ", "") as any)}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: 12 }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95">
                                                            <p className="text-[10px] font-bold text-zinc-400 capitalize tracking-wide mb-3">{payload[0].payload.name} {new Date().getFullYear()}</p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between gap-8">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-zinc-200" />
                                                                        <span className="text-[11px] font-bold text-zinc-500">{t("orders")}</span>
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white">{payload[0].payload.orders}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-8">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                                                        <span className="text-[11px] font-bold text-zinc-500">{t("revenue")}</span>
                                                                    </div>
                                                                    <span className="text-[11px] font-black text-indigo-600">{formatCurrency(payload[0].payload.sales)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar 
                                            dataKey="sales" 
                                            radius={[12, 12, 12, 12]} 
                                            barSize={40}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 flex flex-col items-center justify-center relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full p-8 border-b-2 border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                                <h3 className="font-bold text-zinc-900 dark:text-white tracking-tight">{t("salesOverview")}</h3>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowOptions(!showOptions)}
                                        className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                        <MoreHorizontal size={16} className="text-zinc-400" />
                                    </button>
                                    <AnimatePresence>
                                        {showOptions && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                                            >
                                                <button 
                                                    onClick={() => window.location.reload()}
                                                    className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-2"
                                                >
                                                    <RefreshCw size={14} /> {t("refreshData")}
                                                </button>
                                                <button 
                                                    onClick={() => setShowOptions(false)}
                                                    className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-2"
                                                >
                                                    <ExternalLink size={14} /> {t("viewDetailedReport")}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            <div className="mt-16 w-full h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gaugeData}
                                            cx="50%"
                                            cy="70%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            startAngle={180}
                                            endAngle={0}
                                            paddingAngle={8}
                                            dataKey="value"
                                            cornerRadius={12}
                                        >
                                            {gaugeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
                                    <p className="text-[32px] font-bold text-zinc-900 dark:text-white tracking-tighter">{revenueTrend.toFixed(1)}%</p>
                                    <p className="text-[12px] font-semibold text-zinc-400 capitalize tracking-wide mt-1">{t("revenueGrowth")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                <div className="p-5 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl">
                                    <p className="text-[12px] font-bold text-zinc-400 capitalize tracking-wide mb-2">{t("totalSales")}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{metrics.current.orders}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${salesTrend >= 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'}`}>{salesTrend.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl">
                                    <p className="text-[12px] font-bold text-zinc-400 capitalize tracking-wide mb-2">{t("totalRevenue")}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{formatCurrency(metrics.current.revenue)}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize ${revenueTrend >= 0 ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'}`}>{revenueTrend.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Regions Chart */}
                        <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 flex flex-col group overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Sales by Region</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold tracking-wide uppercase mt-1">Geographic Performance</p>
                                </div>
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <MapPin size={20} />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4">
                                {salesByRegion.length > 0 ? (
                                    <>
                                        <div className="h-56 w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={salesByRegion}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={85}
                                                        paddingAngle={6}
                                                        dataKey="value"
                                                        cornerRadius={12}
                                                        animationBegin={200}
                                                        animationDuration={1500}
                                                    >
                                                        {salesByRegion.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 backdrop-blur-md bg-opacity-80">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                                                                            <p className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{payload[0].name}</p>
                                                                        </div>
                                                                        <p className="text-[14px] font-black text-indigo-600">{formatCurrency(payload[0].value as number)}</p>
                                                                        <p className="text-[9px] font-bold text-zinc-400 mt-1">TOTAL REVENUE</p>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{t("top" as any) || "TOP SET"}</p>
                                                    <p className="text-[16px] font-black text-zinc-900 dark:text-white leading-none mt-1">{salesByRegion[0]?.name.split(' ')[0]}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-3 mt-8">
                                            {salesByRegion.map((region: any, i: number) => (
                                                <div key={region.name} className="group/item">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                            <span className="text-[12px] font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-[120px]">{region.name}</span>
                                                        </div>
                                                        <span className="text-[12px] font-black text-zinc-900 dark:text-white">{formatCurrency(region.value)}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(region.value / salesByRegion[0].value) * 100}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                            className="h-full rounded-full" 
                                                            style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-zinc-800">
                                            <BarChart2 size={24} className="text-zinc-300" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{t("noDataAvailable") || "No Regional Data"}</p>
                                        <p className="text-[11px] text-zinc-500 mt-1 max-w-[180px] mx-auto font-medium">Receive orders with state info to see regional performance.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Top Customers Insight */}
            <div className="bg-indigo-600 rounded-[32px] p-8 border-2 border-indigo-400/40 relative overflow-hidden group mb-4">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest">
                            <Star size={12} fill="currentColor" />
                            Premium Insight
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Your Most Valuable Customers</h3>
                        <p className="text-indigo-100 text-sm font-medium opacity-80">Identify your frequent shoppers and build loyalty with targeted offers.</p>
                    </div>
                    <div className="flex -space-x-4">
                        {[
                            { name: 'SR', color: 'bg-white text-indigo-600' },
                            { name: 'AK', color: 'bg-indigo-400 text-white' },
                            { name: 'JD', color: 'bg-indigo-800 text-white' },
                            { name: 'MK', color: 'bg-indigo-200 text-indigo-900' },
                        ].map((user, i) => (
                            <div key={i} className={`w-14 h-14 ${user.color} rounded-full border-4 border-indigo-600 flex items-center justify-center font-bold text-sm shadow-xl transition-transform hover:-translate-y-2 cursor-pointer`}>
                                {user.name}
                            </div>
                        ))}
                        <div className="w-14 h-14 bg-indigo-500/30 backdrop-blur-md border-4 border-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            +12
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden">
                {loading ? (
                    <div className="p-8">
                        <TableSkeleton />
                    </div>
                ) : (
                    <>
                        <div className="p-8 border-b-2 border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{t("recentOrdersTitle")}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t("searchAnalytics")}
                                        className="pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full md:w-64 transition-all font-bold"
                                    />
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowSort(!showSort)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-bold text-zinc-500 transition-all active:scale-95"
                                    >
                                        <BarChart2 size={16} className="rotate-90" /> {t("sortBy")} <ChevronDown size={14} className={`transition-transform duration-300 ${showSort ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showSort && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2"
                                            >
                                                {[
                                                    { id: "date", label: "date" },
                                                    { id: "total", label: "total" },
                                                    { id: "status", label: "status" }
                                                ].map((option) => (
                                                    <button 
                                                        key={option.id}
                                                        onClick={() => { setSortBy(option.id); setShowSort(false) }}
                                                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === option.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                                                    >
                                                        {t(option.label as any)}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 dark:text-zinc-500 text-[12px] font-semibold capitalize tracking-wide border-b border-zinc-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-8 py-5 text-center"><input type="checkbox" className="rounded border-zinc-300" /></th>
                                        <th className="px-6 py-5">{t("productInfo")}</th>
                                        <th className="px-6 py-5">{t("orderId")}</th>
                                        <th className="px-6 py-5">{t("date")}</th>
                                        <th className="px-6 py-5">{t("customer")}</th>
                                        <th className="px-6 py-5">{t("category")}</th>
                                        <th className="px-6 py-5">{t("status")}</th>
                                        <th className="px-6 py-5">{t("qty")}</th>
                                        <th className="px-6 py-5 text-right">{t("total")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                            <td className="px-8 py-6 text-center"><input type="checkbox" className="rounded border-zinc-300" /></td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                                        <Package className="text-zinc-400" size={18} />
                                                    </div>
                                                    <span className="font-bold text-zinc-900 dark:text-white text-sm truncate max-w-[150px]">{order.firstItem?.name || t("multipleItems")}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-zinc-500 text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-6 text-xs text-zinc-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-6 font-bold text-zinc-900 dark:text-white text-sm whitespace-nowrap">{order.customerName}</td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 capitalize tracking-normal">{order.firstItem?.category || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold capitalize tracking-wide ${
                                                    order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-zinc-500/10 text-zinc-500'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 font-semibold text-black dark:text-white text-sm">{order.itemsCount}</td>
                                            <td className="px-6 py-6 text-right font-bold text-black dark:text-white text-base">{formatCurrency(order.total)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={9} className="px-8 py-20 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-4 border-2 border-zinc-100 dark:border-zinc-800/50">
                                                        <Package size={24} className="text-zinc-200 dark:text-zinc-700" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{t("noOrdersMatching")}</p>
                                                    <p className="text-xs text-zinc-400 mt-2 font-medium">Try adjusting your filters or search query.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
