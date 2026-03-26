export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { 
    Package, ShoppingCart, IndianRupee, Users, ExternalLink, Clock, 
    CheckCircle, Truck, Package as PackageIcon, XCircle, ChevronRight,
    Star, ArrowRight, Share2, Copy, Globe, TrendingUp, Download, Filter,
    ChevronDown, ArrowUpRight, ArrowDownRight, Search
} from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getStoreForDashboard } from "@/lib/dashboard"
import Link from "next/link"
import OverviewClient from "@/components/dashboard/OverviewClient"
import ExportButton from "@/components/dashboard/ExportButton"
import { headers } from "next/headers"
import * as Motion from "framer-motion/client"
import { redirect } from "next/navigation"

export default async function StoreDashboard({ searchParams }: { searchParams: Promise<any> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "STORE_OWNER") {
        redirect("/")
    }

    const params = await searchParams
    const impersonateId = params.ownerId
    
    let targetUserId = (session.user as any).id
    
    // Allow SUPER_ADMIN to impersonate
    if (impersonateId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = impersonateId
    }

    const dashboardType = params.dashboardType || "1"
    const store = await getStoreForDashboard(targetUserId, dashboardType)

    if (!store) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <Package className="w-10 h-10 text-zinc-300" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">No Store Found</h2>
                <p className="text-zinc-500 max-w-sm mx-auto">It looks like you don't have a store set up yet. Contact support if you believe this is an error.</p>
            </div>
        )
    }

    // Actual aggregates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalProducts, totalOrders, ordersToday, newCustomers, totalSales, recentReviews] = await Promise.all([
        prisma.product.count({ where: { storeId: store.id } }),
        prisma.order.count({ where: { storeId: store.id } }),
        prisma.order.count({ 
            where: { 
                storeId: store.id,
                createdAt: { gte: today }
            } 
        }),
        prisma.customer.count({ 
            where: { 
                storeId: store.id,
                createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // Last 30 days
            } 
        }),
        prisma.order.aggregate({
            where: { storeId: store.id, status: { not: "CANCELLED" } },
            _sum: { total: true }
        }),
        prisma.review.findMany({
            where: { storeId: store.id },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { product: true, user: true }
        })
    ])

    const recentOrders = await prisma.order.findMany({
        where: { storeId: store.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true }
    })

    // Identify top products based on order count
    const topProductsData = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { storeId: store.id } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    })

    const topProducts = await Promise.all(topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, price: true }
        })
        return {
            name: product?.name || 'Unknown Product',
            units: item._sum.quantity || 0,
            rev: (item._sum.quantity || 0) * (product?.price || 0)
        }
    }))

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

    const currencySymbol = store?.currency === "MYR" ? "RM" : store?.currency === "EUR" ? "€" : store?.currency === "GBP" ? "£" : "₹"

    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const isLocal = host.includes('localhost')
    const storeUrl = isLocal 
        ? `http://${store.slug}.localhost:3000` 
        : `https://${store.slug}.nammart.com`

    return (
        <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-10 pb-20"
        >
            {/* Premium Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize italic">Dashboard</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Your store performance and activity at a glance.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link 
                        href={`/dashboard/analytics${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-bold capitalize tracking-wide text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                    >
                        <TrendingUp size={14} className="text-indigo-500" /> Analytics
                    </Link>
                    <Link 
                        href={storeUrl}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-bold capitalize tracking-wide text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                    >
                        <Globe size={14} className="text-emerald-500" /> View Store
                    </Link>
                    <div className="flex items-center gap-2">
                        <ExportButton data={{
                            currencySymbol,
                            totalSales: totalSales._sum.total || 0,
                            totalOrders,
                            totalProducts,
                            newCustomers,
                            topProducts,
                            recentOrders: recentOrders.map(o => ({
                                id: o.id,
                                customerName: o.customer?.firstName ? `${o.customer.firstName} ${o.customer.lastName || ''}`.trim() : 'Guest',
                                customerEmail: o.customer?.email || 'N/A',
                                total: o.total,
                                status: o.status
                            }))
                        }} />
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-bold capitalize tracking-wide hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium KPI Cards consistent with Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue Gradient Card */}
                <Motion.div 
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-7 rounded-[32px] shadow-2xl shadow-indigo-500/20 group cursor-default"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -mr-24 -mt-24 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 blur-2xl -ml-16 -mb-16 rounded-full" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[12px] sm:text-[14px] font-semibold text-blue-50/70 capitalize tracking-wide">Total Revenue</span>
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-black/5">
                                <IndianRupee size={20} />
                            </div>
                        </div>
                        <div className="flex items-end gap-3 mb-2">
                            <p className="text-[28px] sm:text-[32px] font-bold text-white tracking-tighter">{currencySymbol}{(totalSales._sum.total || 0).toLocaleString()}</p>
                            <span className="mb-1.5 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-0.5">
                                <ArrowUpRight size={10} /> 12.5%
                            </span>
                        </div>
                        <p className="text-xs font-medium text-blue-100/50 italic">Last month: {currencySymbol}{( (totalSales._sum.total || 0) * 0.8 ).toLocaleString()}</p>
                    </div>
                </Motion.div>

                {/* Other KPI Cards */}
                {[
                    { label: "Total Orders", value: totalOrders.toLocaleString(), last: (totalOrders - 12), trend: 8.4, icon: ShoppingCart, color: "bg-zinc-950 text-white", iconColor: "text-zinc-400" },
                    { label: "Total Products", value: totalProducts.toLocaleString(), last: (totalProducts - 5), trend: 4.2, icon: Package, color: "bg-blue-500 text-white", iconColor: "text-blue-200" },
                    { label: "Total Customers", value: newCustomers.toLocaleString(), last: (newCustomers - 8), trend: 15.1, icon: Users, color: "bg-indigo-500 text-white", iconColor: "text-indigo-200" },
                ].map((kpi, i) => (
                    <Motion.div 
                        key={kpi.label} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i + 1) * 0.1 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        className="p-7 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 group cursor-default"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[12px] sm:text-[14px] font-semibold text-zinc-400 dark:text-zinc-500 capitalize tracking-wide">{kpi.label}</span>
                            <div className={`w-10 h-10 ${kpi.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                        <div className="flex items-end gap-3 mb-2">
                            <p className="text-[28px] sm:text-[32px] font-bold text-zinc-900 dark:text-white tracking-tighter">{kpi.value}</p>
                            <span className={`mb-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 ${kpi.trend > 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                                {kpi.trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(kpi.trend)}%
                            </span>
                        </div>
                        <p className="text-xs font-medium text-zinc-400 italic">Last month: {kpi.last}</p>
                    </Motion.div>
                ))}
            </div>

            {/* Dashboard 3-Column Section Upgraded */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min">
                {/* Recent Orders Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
                    <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Recent Orders</h3>
                        <Link 
                            href={`/dashboard/orders${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                            className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                        {recentOrders.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <ShoppingCart className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                                <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No orders yet</p>
                            </div>
                        ) : (
                            <table className="w-full text-left min-w-[380px]">
                                <thead className="text-[12px] sm:text-[14px] text-zinc-400 dark:text-zinc-500 capitalize bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold tracking-wide border-b border-zinc-50 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3">Customer</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900 dark:text-white text-xs group-hover/row:text-indigo-600 transition-colors">
                                                        {order.customer?.firstName} {order.customer?.lastName?.[0]}.
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 font-semibold capitalize tracking-normal">#{order.id.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <p className="font-semibold text-zinc-900 dark:text-white text-xs mb-0.5">{currencySymbol}{order.total.toLocaleString()}</p>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize tracking-wide ${
                                                    order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-zinc-500/10 text-zinc-500'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Top Products Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
                    <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Top Products</h3>
                        <Link 
                            href={`/dashboard/analytics${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                            className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                        {topProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <Package className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                                <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No data available</p>
                            </div>
                        ) : (
                            <table className="w-full text-left min-w-[380px]">
                                <thead className="text-[12px] sm:text-[14px] text-zinc-400 dark:text-zinc-500 capitalize bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold tracking-wide border-b border-zinc-50 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {topProducts.map((p, i) => (
                                        <tr key={i} className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900 dark:text-white text-xs truncate max-w-[150px] group-hover/row:text-indigo-600 transition-colors">{p.name}</span>
                                                    <span className="text-[11px] text-zinc-400 font-semibold capitalize tracking-normal italic whitespace-nowrap">{p.units} Sold</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <p className="font-semibold text-zinc-900 dark:text-white text-xs mb-0.5">{currencySymbol}{p.rev.toLocaleString()}</p>
                                                <span className="text-[8px] font-semibold capitalize tracking-wide text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full italic">Best Seller</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Reviews Upgraded */}
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
                    <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Reviews</h3>
                        <Link 
                            href={`/dashboard/reviews${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                            className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                    </div>
                    <div className="flex-1">
                        {recentReviews.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <Star className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                                <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {recentReviews.map((review) => (
                                    <div key={review.id} className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group/rev">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={10} 
                                                    className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} 
                                                />
                                            ))}
                                            <span className="text-[11px] font-semibold text-zinc-400 capitalize tracking-wide ml-auto italic">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2 leading-relaxed mb-2 italic">"{review.comment}"</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-indigo-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                {(review.user?.name?.[0]) || 'G'}
                                            </div>
                                            <p className="text-[12px] font-medium text-zinc-500">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-300 truncate max-w-[80px]">{(review.user?.name) || 'Guest'}</span> <span className="text-[10px] italic opacity-50">on {review.product?.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: QR Code & Sharing */}
            <OverviewClient 
                storeUrl={storeUrl} 
                planName={store.subscription?.plan?.name || "Pro"} 
            />
        </Motion.div>
    )
}


