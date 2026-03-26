import { prisma } from "@/lib/prisma"
import { CreditCard, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react"

export default async function AdminSubscriptionsPage() {
    const subscriptions = await prisma.subscription.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            store: true,
            plan: true
        }
    })

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'ACTIVE').length,
        trial: subscriptions.filter(s => s.status === 'TRIALING').length,
        canceled: subscriptions.filter(s => s.status === 'CANCELED' || s.status === 'EXPIRED').length,
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Subscriptions</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Monitor platform revenue and plan distribution.</p>
                </div>
                <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <CreditCard className="w-8 h-8" />
                </div>
            </div>

            {/* Subscription Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total", value: stats.total, color: "zinc" },
                    { label: "Active", value: stats.active, color: "emerald" },
                    { label: "Trialing", value: stats.trial, color: "blue" },
                    { label: "Canceled", value: stats.canceled, color: "rose" },
                ].map((stat, i) => (
                    <div key={i} className={`p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-${stat.color}-500 shadow-sm`}>
                        <p className={`text-xs font-black text-${stat.color}-600 dark:text-${stat.color}-500 uppercase tracking-widest mb-1 italic`}>{stat.label}</p>
                        <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Store / Owner</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Plan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Billing</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Expiry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 border border-zinc-200 dark:border-white/5 shadow-sm">
                                                {sub.store.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors uppercase tracking-tight">{sub.store.name}</div>
                                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">{sub.store.slug}.nammart.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{sub.plan.name}</span>
                                            <span className="text-xs text-zinc-500 font-bold italic">
                                                ₹{sub.billingCycle === 'YEARLY' ? sub.plan.priceYearly : sub.plan.priceMonthly}/mo
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {sub.status === 'ACTIVE' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                                             sub.status === 'TRIALING' ? <Clock className="w-4 h-4 text-blue-500" /> :
                                             <XCircle className="w-4 h-4 text-rose-500" />}
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                sub.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-500' :
                                                sub.status === 'TRIALING' ? 'text-blue-600 dark:text-blue-500' :
                                                'text-rose-600 dark:text-rose-500'
                                            }`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">{sub.billingCycle}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-xs font-black text-zinc-500 italic">
                                            {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
