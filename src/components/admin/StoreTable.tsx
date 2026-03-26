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
                        // Special case: if plan changed, we might need a full refresh or mock it
                        if (updates.planName) {
                            updated.subscription = updated.subscription || {}
                            updated.subscription.plan = { name: updates.planName }
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

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-black dark:text-white">Platform Governance</h3>
                <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-zinc-400">
                    <span className="flex items-center gap-1"><Globe size={12} className="text-indigo-500"/> Storefront</span>
                    <span className="flex items-center gap-1"><LayoutDashboard size={12} className="text-amber-500"/> Admin Panel</span>
                </div>
            </div>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full text-sm text-left min-w-[1000px]">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 uppercase font-black text-[10px] tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Store & Owner</th>
                            <th className="px-6 py-4">Subscription Plan</th>
                            <th className="px-6 py-4 text-center">Storefront Control</th>
                            <th className="px-6 py-4 text-center">Admin Panel Control</th>
                            <th className="px-6 py-4 text-right">Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {stores.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                    No stores found
                                </td>
                            </tr>
                        ) : (
                            stores.map((store) => {
                                const currentPlan = store.subscription?.plan?.name || "Normal"
                                return (
                                    <tr key={store.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                     {store.logo ? (
                                                        <img src={store.logo} alt={store.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-black border border-zinc-200 dark:border-zinc-700">
                                                            {store.name[0]}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${store.isStorefrontDisabled ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                </div>
                                                <div>
                                                    <div className="font-black text-black dark:text-white flex items-center gap-2">
                                                        {store.name}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight flex items-center gap-2 mt-0.5">
                                                        {store.owner.name} • {store.owner.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${currentPlan === 'Pro' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>
                                                    {currentPlan === 'Pro' ? <Crown size={10} /> : <Zap size={10} />}
                                                    {currentPlan} Plan
                                                </div>
                                                <select 
                                                    value={currentPlan}
                                                    onChange={(e) => updateStore(store.id, { planName: e.target.value })}
                                                    className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[10px] font-bold outline-none ring-0 w-32"
                                                >
                                                    <option value="Normal">Normal Plan</option>
                                                    <option value="Pro">Pro Plan</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => updateStore(store.id, { isStorefrontDisabled: !store.isStorefrontDisabled })}
                                                disabled={loadingId === `${store.id}-isStorefrontDisabled`}
                                                className={`mx-auto w-24 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all ${store.isStorefrontDisabled ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}
                                            >
                                                {store.isStorefrontDisabled ? 'Deactive' : 'Active'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => updateStore(store.id, { isAdminPanelDisabled: !store.isAdminPanelDisabled })}
                                                disabled={loadingId === `${store.id}-isAdminPanelDisabled`}
                                                className={`mx-auto w-24 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all ${store.isAdminPanelDisabled ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}
                                            >
                                                {store.isAdminPanelDisabled ? 'Deactive' : 'Active'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {/* Legacy toggle if needed, or just link to settings */}
                                            <button 
                                                onClick={() => confirm("Reset Password Link will be sent to owner") && alert("Sent!")}
                                                className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all"
                                                title="Reset User"
                                            >
                                                <Mail size={14} />
                                            </button>

                                             <a 
                                                href={`/s/${store.slug}`} 
                                                target="_blank"
                                                className="inline-flex p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all"
                                                title="View Store"
                                            >
                                                <Globe size={14} />
                                            </a>

                                            <a 
                                                href={`/dashboard?ownerId=${store.ownerId}`} 
                                                className="inline-flex p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
                                                title="View Dashboard"
                                            >
                                                <LayoutDashboard size={14} />
                                            </a>

                                            <button 
                                                onClick={() => deleteStore(store.id)}
                                                disabled={loadingId === `${store.id}-delete`}
                                                className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all disabled:opacity-50"
                                                title="Delete Store"
                                            >
                                                <Trash2 size={14} />
                                            </button>
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
