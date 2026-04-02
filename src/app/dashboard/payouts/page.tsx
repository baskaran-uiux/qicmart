"use client"

import { useState, useEffect } from "react"
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, Clock, 
    CheckCircle, History, Landmark, CreditCard, 
    Plus, Loader2, AlertCircle, Building2
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { KpiCardSkeleton, TableSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface Order {
    id: string
    total: number
    status: string
    createdAt: string
    payments: Array<{
        status: string
        amount: number
    }>
}

export default function PayoutsPage() {
    const { currency, t } = useDashboardStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)

    const fetchPayoutData = async () => {
        try {
            const res = await fetch("/api/dashboard/orders")
            const data = await res.json()
            setOrders(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayoutData()
    }, [])

    const completedOrders = orders.filter(o => o.status === "DELIVERED")
    const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0)
    const pendingRevenue = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").reduce((acc, o) => acc + o.total, 0)

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">
                        {t("payouts") || "Payouts"}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Manage your earnings, bank details and withdrawal requests</p>
                </div>
                <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    {t("requestWithdrawal") || "Request Withdrawal"}
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <>
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-zinc-900 text-white p-8 rounded-[32px] shadow-xl shadow-zinc-900/10 space-y-4 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                            <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Available for Payout</p>
                                <h2 className="text-3xl font-black tracking-tight">{currency}{totalRevenue.toFixed(2)}</h2>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pending Clearance</p>
                                <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{currency}{pendingRevenue.toFixed(2)}</h2>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit">
                                <ArrowUpRight size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Withdrawn</p>
                                <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{currency}0.00</h2>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Linked Bank</p>
                                <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-2">NOT CONNECTED</h2>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Transaction History & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <History size={16} />
                                Payout History
                            </h3>
                        </div>
                        <div className="p-12 text-center space-y-4">
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                        <History size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No payout records found</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-emerald-600 p-8 rounded-[32px] text-white space-y-4 shadow-xl shadow-emerald-600/20">
                        <CheckCircle size={32} className="opacity-50" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Direct Bank Payouts</h3>
                        <p className="text-sm opacity-80 leading-relaxed font-medium">Automatic payouts are processed every Wednesday for stores with a balance above {currency}500.</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Payment Settings</h3>
                        <div className="space-y-4">
                            <button className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <Landmark size={18} className="text-zinc-400" />
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Bank Transfer</span>
                                </div>
                                <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </button>
                            <button className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-zinc-400" />
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">UPI ID Setup</span>
                                </div>
                                <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase tracking-tight">Withdraw Funds</h3>
                            <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <Plus size={24} className="rotate-45 text-zinc-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl flex items-start gap-4">
                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-500 leading-relaxed">
                                    You haven't linked a bank account yet. Please complete your bank details and KYC to request a withdrawal.
                                </p>
                            </div>
                            <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                Complete KYC Setup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
