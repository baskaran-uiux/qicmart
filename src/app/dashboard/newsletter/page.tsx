"use client"

import { useState, useEffect } from "react"
import { 
    Search, Mail, Calendar, Download, Trash2, 
    Loader2, Users, ArrowUpRight, TrendingUp,
    ExternalLink, MailOpen, UserCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Subscriber {
    id: string
    email: string
    createdAt: string
}

export default function NewsletterPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [exporting, setExporting] = useState(false)

    const fetchSubscribers = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/newsletter?ownerId=${ownerId}` : "/api/dashboard/newsletter"
            const res = await fetch(url)
            const data = await res.json()
            setSubscribers(data)
        } catch (error) {
            console.error("Failed to fetch subscribers:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubscribers()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this subscriber?")) return
        try {
            const res = await fetch("/api/dashboard/newsletter", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) fetchSubscribers()
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const exportToCSV = () => {
        setExporting(true)
        try {
            const headers = ["Email", "Joined Date"]
            const rows = subscribers.map(s => [s.email, new Date(s.createdAt).toLocaleDateString()])
            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement("a")
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } finally {
            setExporting(false)
        }
    }

    const filtered = subscribers.filter(s => 
        s.email.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: subscribers.length,
        newThisMonth: subscribers.filter(s => {
            const date = new Date(s.createdAt)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }).length
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize italic">Newsletter Subscribers</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Manage your email audience and grow your brand.</p>
                </div>
                <button 
                    onClick={exportToCSV}
                    disabled={subscribers.length === 0 || exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl text-[14px] font-bold hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                    <Download size={18} /> {exporting ? "Exporting..." : "Export to CSV"}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: "Total Subscribers", value: stats.total, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10", suffix: "active leads" },
                    { label: "New This Month", value: stats.newThisMonth, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "growth" },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                                <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-black dark:text-white italic">{stat.value}</p>
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">{stat.suffix}</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity translate-x-1/4 -translate-y-1/4">
                            <stat.icon size={120} />
                        </div>
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
                            placeholder="Search by email..." 
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
                            <p className="text-zinc-500 font-medium">Loading subscribers...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail size={32} className="text-zinc-300" />
                            </div>
                            <h3 className="text-xl font-bold text-black dark:text-white mb-2">No subscribers yet</h3>
                            <p className="text-zinc-500 text-sm max-w-xs mx-auto">Emails will appear here once customers sign up on your storefront.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="text-[11px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-10 py-5">Email Address</th>
                                    <th className="px-10 py-5">Subscription Date</th>
                                    <th className="px-10 py-5">Source</th>
                                    <th className="px-10 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-bold text-xs">
                                                    {sub.email.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-black dark:text-white text-sm tracking-tight">{sub.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                                                <Calendar size={14} className="opacity-50" />
                                                <span>{new Date(sub.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                Storefront Footer
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button 
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-2 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Hint */}
            <div className="p-8 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-[32px] border border-indigo-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <MailOpen size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Campaign Ready</h4>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Export your subscribers to tools like Mailchimp or Brevo to start sending emails.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
                    Connect Marketing Tools <ExternalLink size={14} />
                </button>
            </div>
        </div>
    )
}
