export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { BarChart3, TrendingUp, ShoppingBag, Globe, ArrowUpRight, DollarSign, Users, CheckCircle2 } from "lucide-react"

export default async function AdminAnalyticsPage() {
    const [totalStores, totalUsers, totalRevenue, totalProducts] = await Promise.all([
        prisma.store.count(),
        prisma.user.count(),
        prisma.payment.aggregate({ _sum: { amount: true } }),
        prisma.product.count(),
    ])

    const recentStores = await prisma.store.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { subscription: { include: { plan: true } } }
    })

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Platform Analytics</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Real-time performance metrics and growth indicators.</p>
                </div>
                <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-[32px] border border-indigo-500/20 shadow-lg shadow-indigo-500/10 transition-all hover:scale-110">
                    <BarChart3 className="w-8 h-8" />
                </div>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Gross Revenue", value: `₹${totalRevenue._sum.amount?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "emerald", trend: "+12.4%" },
                    { label: "Active Stores", value: totalStores, icon: Globe, color: "purple", trend: "+3.2%" },
                    { label: "Total Users", value: totalUsers, icon: Users, color: "blue", trend: "+8.1%" },
                    { label: "Total Products", value: totalProducts, icon: ShoppingBag, color: "orange", trend: "+15.0%" },
                ].map((kpi, i) => (
                    <div key={i} className="p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[32px] hover:border-indigo-500/30 transition-all flex flex-col justify-between group shadow-sm hover:shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-3 rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest italic animate-pulse">
                                <TrendingUp className="w-3 h-3" />
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1 italic">{kpi.label}</p>
                            <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Store Growth */}
                <div className="lg:col-span-2 p-10 bg-white dark:bg-zinc-900/50 rounded-[48px] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight italic text-zinc-900 dark:text-white leading-none">Marketplace Growth</h3>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Latest businesses to join the platform</p>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 dark:border-indigo-400/20 px-6 py-2.5 rounded-full hover:bg-indigo-600/10 dark:hover:bg-indigo-400/10 transition-colors">Full Report</button>
                    </div>

                    <div className="space-y-4">
                        {recentStores.map(store => (
                            <div key={store.id} className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-900 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform">
                                        {store.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none">{store.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1.5 italic transition-colors group-hover:text-zinc-400">{store.subscription?.plan?.name || "Free Plan"} MEMBER</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-black text-zinc-900 dark:text-white italic leading-none">{new Date(store.createdAt).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Acquisition</div>
                                    </div>
                                    <ArrowUpRight className="w-6 h-6 text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Health */}
                <div className="p-10 bg-zinc-950 dark:bg-zinc-950 rounded-[48px] border border-zinc-900 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-28 h-28 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative mb-8">
                        <div className="w-20 h-20 rounded-full border-4 border-emerald-500 animate-pulse flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full translate-y-4"></div>
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3 italic">System Healthy</h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed px-6">All storefronts and admin panels are operating within optimal parameters.</p>
                    <div className="mt-10 flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                            <div key={i} className="w-1.5 h-8 bg-emerald-500/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 80}ms` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

