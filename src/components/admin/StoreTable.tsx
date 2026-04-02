"use client"

import { useState } from "react"
import { ShieldAlert, ShieldCheck, Mail, Phone, ExternalLink, Globe, LayoutDashboard, Zap, Crown, Trash2 } from "lucide-react"

export function StoreTable({ initialStores }: { initialStores: any[] }) {
    const [stores, setStores] = useState(initialStores)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const deleteStore = async (storeId: string) => {
        if (!confirm("Are you sure you want to delete this store? This action is permanent and will delete all store data.")) return
        
        setLoadingId(`${storeId}-delete`)
        try {
            const res = await fetch(`/api/admin/store/update?id=${storeId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setStores(stores.filter(s => s.id !== storeId))
            } else {
                const data = await res.json()
                alert(data.error || "Failed to delete store")
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred while deleting the store")
        }
        setLoadingId(null)
    }

    const updateStore = async (storeId: string, updates: any) => {
        setLoadingId(`${storeId}-${Object.keys(updates)[0]}`)
        try {
            const res = await fetch("/api/admin/store/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId, ...updates })
            })

            if (res.ok) {
                setStores(stores.map(s => {
                    if (s.id === storeId) {
                        const updated = { ...s, ...updates }
                        
                        // Deep merge subscription updates
                        if (updates.planName || updates.billingCycle || updates.expiryDate) {
                            updated.subscription = { ...updated.subscription }
                            if (updates.planName) updated.subscription.plan = { ...updated.subscription.plan, name: updates.planName }
                            if (updates.billingCycle) updated.subscription.billingCycle = updates.billingCycle
                            if (updates.expiryDate) updated.subscription.currentPeriodEnd = updates.expiryDate
                        }
                        return updated
                    }
                    return s
                }))
            }
        } catch (err) {
            console.error(err)
        }
        setLoadingId(null)
    }

    const getDaysRemaining = (expiryDate: string | null) => {
        if (!expiryDate) return null
        const diffTime = new Date(expiryDate).getTime() - new Date().getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl font-sans">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-950/20">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Platform Governance</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">Global access and subscription lifecycle management</p>
                </div>
                <div className="flex items-center gap-6 px-5 py-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Storefront Active
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Admin Panel Active
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full text-sm text-left min-w-[1100px]">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800/50">
                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 capitalize tracking-wide">Store Details</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 capitalize tracking-wide">Plan Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 capitalize tracking-wide">Access Permissions</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 capitalize tracking-wide text-center">Expiry & Management</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 capitalize tracking-wide text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {stores.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium italic">
                                    No active stores managed by platform governance.
                                </td>
                            </tr>
                        ) : (
                            stores.map((store) => {
                                const subscription = store.subscription || {}
                                const currentPlan = subscription.plan?.name || "Standard"
                                const currentCycle = subscription.billingCycle || "MONTHLY"
                                const expiryDate = subscription.currentPeriodEnd
                                const daysLeft = getDaysRemaining(expiryDate)

                                return (
                                    <tr key={store.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all group">
                                        {/* Store Info */}
                                        <td className="px-6 py-6 border-r border-zinc-50/50 dark:border-zinc-800/30">
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform">
                                                     {store.logo ? (
                                                        <img src={store.logo} alt={store.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-zinc-100 dark:border-zinc-800" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                                            {store.name[0]}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm ${store.isStorefrontDisabled && store.isAdminPanelDisabled ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                                                        {store.name}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-2 mt-0.5 max-w-[180px] truncate">
                                                        {store.owner.name} • {store.owner.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Plan Status */}
                                        <td className="px-6 py-6 border-r border-zinc-50/50 dark:border-zinc-800/30">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm flex items-center gap-1.5 capitalize ${currentPlan === 'Pro' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                                                        {currentPlan === 'Pro' ? <Crown size={10} /> : <Zap size={10} />}
                                                        {currentPlan}
                                                    </div>
                                                    <div className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700/50 capitalize shadow-inner">
                                                        {currentCycle.toLowerCase()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <select 
                                                        value={currentPlan}
                                                        onChange={(e) => updateStore(store.id, { planName: e.target.value })}
                                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 outline-none shadow-sm focus:ring-1 ring-indigo-500/20 w-28"
                                                    >
                                                        <option value="Standard">Standard Pack</option>
                                                        <option value="Pro">Pro Pack (Dev)</option>
                                                    </select>
                                                    <select 
                                                        value={currentCycle}
                                                        onChange={(e) => updateStore(store.id, { billingCycle: e.target.value })}
                                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 outline-none shadow-sm focus:ring-1 ring-indigo-500/20 w-24"
                                                    >
                                                        <option value="MONTHLY">Monthly</option>
                                                        <option value="YEARLY">Yearly</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Access Control */}
                                        <td className="px-6 py-6 border-r border-zinc-50/50 dark:border-zinc-800/30">
                                            <div className="flex flex-col gap-3 min-w-[140px]">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[11px] font-semibold text-zinc-500">Storefront</span>
                                                    <button 
                                                        onClick={() => updateStore(store.id, { isStorefrontDisabled: !store.isStorefrontDisabled })}
                                                        className={`w-10 h-5 rounded-full p-0.5 transition-all flex items-center shadow-inner ${store.isStorefrontDisabled ? 'bg-zinc-200 dark:bg-zinc-800 justify-start' : 'bg-emerald-500 justify-end'}`}
                                                    >
                                                        <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[11px] font-semibold text-zinc-500">Admin Area</span>
                                                    <button 
                                                        onClick={() => updateStore(store.id, { isAdminPanelDisabled: !store.isAdminPanelDisabled })}
                                                        className={`w-10 h-5 rounded-full p-0.5 transition-all flex items-center shadow-inner ${store.isAdminPanelDisabled ? 'bg-zinc-200 dark:bg-zinc-800 justify-start' : 'bg-amber-500 justify-end'}`}
                                                    >
                                                        <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Expiry & Extensions */}
                                        <td className="px-6 py-6 text-center bg-zinc-50/20 dark:bg-zinc-950/10 border-r border-zinc-50/50 dark:border-zinc-800/30">
                                            <div className="flex flex-col items-center gap-3">
                                                {daysLeft !== null ? (
                                                   <div className="flex flex-col items-center">
                                                     <div className={`text-3xl font-bold tracking-tight ${daysLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                                         {daysLeft} <span className="text-[11px] font-medium text-zinc-400 align-baseline ml-0.5">{currentCycle === 'MONTHLY' ? 'Days Remaining' : 'Days Left'}</span>
                                                     </div>
                                                     <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 px-2 py-0.5 bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                         Expiry: {new Date(expiryDate!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                     </div>
                                                   </div>
                                                ) : (
                                                    <span className="text-zinc-400 italic text-[11px] font-medium">Inactive Period</span>
                                                )}

                                                <div className="flex flex-col gap-1.5">
                                                     <div className="flex items-center gap-1.5">
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() - 30)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-bold text-xs"
                                                            title="Subtract 30 Days"
                                                        >-</button>
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() + 30)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                                                        >
                                                            30 Days
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() + 30)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-bold text-xs"
                                                            title="Add 30 Days"
                                                        >+</button>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() - 365)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-bold text-xs"
                                                            title="Subtract 1 Year"
                                                        >-</button>
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() + 365)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex-1"
                                                        >
                                                            1 Year
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const newDate = new Date(expiryDate || Date.now())
                                                                newDate.setDate(newDate.getDate() + 365)
                                                                updateStore(store.id, { expiryDate: newDate.toISOString() })
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-bold text-xs"
                                                            title="Add 1 Year"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => confirm("Reset Password Link will be sent to owner") && alert("Sent!")}
                                                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                                                    title="Password Reset"
                                                >
                                                    <Mail size={14} />
                                                </button>

                                                 <a 
                                                    href={`/s/${store.slug}`} 
                                                    target="_blank"
                                                    className="p-2 text-zinc-400 hover:text-indigo-600 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                                    title="View Store"
                                                >
                                                    <Globe size={14} />
                                                </a>

                                                 <button 
                                                    onClick={() => deleteStore(store.id)}
                                                    className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-600/10 transition-all"
                                                    title="Delete Store"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
