"use client"

import { useState, useEffect } from "react"
import { 
    Plus, Search, Ticket, Calendar, TrendingUp, Users, 
    MoreVertical, Edit2, Trash2, Loader2, X, Check, Copy,
    Percent, IndianRupee, Clock, AlertCircle
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion, AnimatePresence } from "framer-motion"

interface Coupon {
    id: string
    code: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
    usageLimit: number | null
    usageCount: number
    minOrderValue: number | null
    expiresAt: string | null
    isActive: boolean
}

export default function CouponsPage() {
    const { currency, t } = useDashboardStore()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        usageLimit: "",
        minOrderValue: "",
        expiresAt: ""
    })

    const currencySymbol = currency === "MYR" ? "RM" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"

    const fetchCoupons = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/coupons?ownerId=${ownerId}` : "/api/dashboard/coupons"
            const res = await fetch(url)
            const data = await res.json()
            setCoupons(data)
        } catch (error) {
            console.error("Failed to fetch coupons:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/coupons?ownerId=${ownerId}` : "/api/dashboard/coupons"
            
            const method = editingCoupon ? "PUT" : "POST"
            const body = editingCoupon ? { id: editingCoupon.id, ...form } : form

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                fetchCoupons()
                setShowModal(false)
                setEditingCoupon(null)
                setForm({
                    code: "",
                    discountType: "PERCENTAGE",
                    discountValue: "",
                    usageLimit: "",
                    minOrderValue: "",
                    expiresAt: ""
                })
            }
        } catch (error) {
            console.error("Save failed:", error)
        } finally {
            setSaving(false)
        }
    }

    const toggleStatus = async (coupon: Coupon) => {
        try {
            const res = await fetch("/api/dashboard/coupons", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive })
            })
            if (res.ok) fetchCoupons()
        } catch (error) {
            console.error("Toggle failed:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirmDelete'))) return
        try {
            const res = await fetch("/api/dashboard/coupons", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) fetchCoupons()
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const filtered = coupons.filter(c => 
        c.code.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        active: coupons.filter(c => c.isActive).length,
        totalUsage: coupons.reduce((acc, curr) => acc + curr.usageCount, 0),
        expired: coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize italic">{t('couponsTitle')}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{t('couponsSummary')}</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[14px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                >
                    <Plus size={18} /> {t('addCoupon')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: t('active'), value: stats.active, icon: Ticket, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: t('totalUsage'), value: stats.totalUsage, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { label: t('expired') || "Expired", value: stats.expired, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-black dark:text-white italic">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Table Content */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder={t('searchCoupons')} 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-24 text-center">
                            <Loader2 className="animate-spin mx-auto text-zinc-400 mb-4" size={32} />
                            <p className="text-zinc-500">{t('initializing')}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center">
                            <Ticket className="w-16 h-16 text-zinc-100 dark:text-zinc-800 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t('noMatches')}</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">{t('noDataAvailable')}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="text-[11px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-5">{t('couponCode') || "Code"}</th>
                                    <th className="px-8 py-5">{t('discount') || "Discount"}</th>
                                    <th className="px-8 py-5">{t('usageLimit') || "Usage"}</th>
                                    <th className="px-8 py-5">{t('status')}</th>
                                    <th className="px-8 py-5">{t('expiryDate') || "Expiry"}</th>
                                    <th className="px-8 py-5 text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map((coupon) => (
                                    <tr key={coupon.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-black uppercase tracking-widest text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
                                                    {coupon.code}
                                                </div>
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code)
                                                }} className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-indigo-500 transition-all">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-black dark:text-white text-sm italic">
                                                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% Off` : `${currencySymbol}${coupon.discountValue} Off`}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                                                    Min: {currencySymbol}{coupon.minOrderValue || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-black dark:text-white text-sm">{coupon.usageCount}</span>
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                                                    Limit: {coupon.usageLimit || '∞'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => toggleStatus(coupon)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    coupon.isActive 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                }`}
                                            >
                                                {coupon.isActive ? t('active') : t('hidden')}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setEditingCoupon(coupon)
                                                        setForm({
                                                            code: coupon.code,
                                                            discountType: coupon.discountType,
                                                            discountValue: coupon.discountValue.toString(),
                                                            usageLimit: coupon.usageLimit?.toString() || "",
                                                            minOrderValue: coupon.minOrderValue?.toString() || "",
                                                            expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : ""
                                                        })
                                                        setShowModal(true)
                                                    }}
                                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-500 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-2 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Coupon Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
                                <div>
                                    <h3 className="text-xl font-bold text-black dark:text-white uppercase italic tracking-tight">{editingCoupon ? t('edit') : t('addNew')}</h3>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('couponDetails')}</p>
                                </div>
                                <button onClick={() => { setShowModal(false); setEditingCoupon(null); }} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('couponCode')}</label>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                                                const random = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
                                                const prefixes = ['SAVE', 'OFF', 'GET', 'DEAL', 'QUIC']
                                                const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
                                                setForm({ ...form, code: `${prefix}${random}` })
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                                        >
                                            <TrendingUp size={12} /> Auto-Generate
                                        </button>
                                    </div>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold tracking-tight text-indigo-600 uppercase focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                        placeholder="e.g. WELCOME10"
                                        value={form.code}
                                        onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('discountType')}</label>
                                    <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                        <button 
                                            type="button"
                                            onClick={() => setForm({...form, discountType: 'PERCENTAGE'})}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${form.discountType === 'PERCENTAGE' ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-700/50"}`}
                                        >
                                            <Percent size={14} /> Percentage
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setForm({...form, discountType: 'FIXED'})}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${form.discountType === 'FIXED' ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-700/50"}`}
                                        >
                                            <IndianRupee size={14} /> Fixed Price
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('discountValue')}</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                        placeholder="10"
                                        value={form.discountValue}
                                        onChange={e => setForm({...form, discountValue: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('usageLimit')}</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                        placeholder="No limit"
                                        value={form.usageLimit}
                                        onChange={e => setForm({...form, usageLimit: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('minPurchase')}</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                        placeholder="0.00"
                                        value={form.minOrderValue}
                                        onChange={e => setForm({...form, minOrderValue: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('expiryDate')}</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                        value={form.expiresAt}
                                        onChange={e => setForm({...form, expiresAt: e.target.value})}
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {saving ? t('savingChanges') : editingCoupon ? t('saveChanges') : t('addCoupon')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
