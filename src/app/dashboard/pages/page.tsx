"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Plus, Search, Edit3, Trash2, Eye, FileText, ChevronRight, 
    MoreHorizontal, Check, Clock, Globe, BarChart2, Loader2, ArrowRight,
    AlertCircle, Sparkles, ShieldAlert, HelpCircle
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface CustomPage {
    id: string
    title: string
    slug: string
    content: string
    isPublished: boolean
    views: number
    template: string
    updatedAt: string
}

export default function CustomPagesPage() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const { slug: storeSlug, t } = useDashboardStore()
    const [pages, setPages] = useState<CustomPage[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPages()
    }, [ownerId])

    const fetchPages = async () => {
        try {
            const url = ownerId ? `/api/dashboard/pages?ownerId=${ownerId}` : "/api/dashboard/pages"
            const res = await fetch(url)
            const data = await res.json()
            if (Array.isArray(data)) setPages(data)
        } catch (error) {
            console.error("Failed to fetch pages:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page?")) return
        
        try {
            const res = await fetch(`/api/dashboard/pages/${id}`, { method: "DELETE" })
            if (res.ok) {
                setPages(pages.filter(p => p.id !== id))
            } else {
                alert("Failed to delete page. Please try again.")
            }
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const filteredPages = pages.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: pages.length,
        published: pages.filter(p => p.isPublished).length,
        drafts: pages.filter(p => !p.isPublished).length,
        views: pages.reduce((acc, p) => acc + p.views, 0)
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        )
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize truncate">Custom Pages</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Design and publish static content for your premium storefront.</p>
                </div>
                <PremiumButton 
                    href={ownerId ? `/dashboard/pages/new?ownerId=${ownerId}` : "/dashboard/pages/new"}
                    icon={Plus}
                >
                    Create New Page
                </PremiumButton>
            </div>

            {/* Quick Templates Section */}
            <div className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Plus size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Quick Templates</h3>
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Jumpstart your store content</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { title: "Contact Us", type: "contact", icon: Globe },
                            { title: "Privacy Policy", type: "privacy", icon: ShieldAlert },
                            { title: "Terms of Service", type: "terms", icon: FileText },
                            { title: "FAQ", type: "faq", icon: HelpCircle },
                            { title: "Return Policy", type: "refund", icon: ArrowRight }
                        ].map((item: any) => (
                            <Link
                                key={item.type}
                                href={ownerId ? `/dashboard/pages/new?ownerId=${ownerId}&type=${item.type}` : `/dashboard/pages/new?type=${item.type}`}
                                className="group p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent hover:border-indigo-500/50 rounded-3xl transition-all flex flex-col items-center text-center gap-4 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                                    <item.icon size={24} />
                                </div>
                                <span className="text-[12px] font-black tracking-tight leading-tight">{item.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Pages" value={stats.total} subtext="Across your store" icon={FileText} color="indigo" />
                <StatCard label="Live Pages" value={stats.published} subtext="Active & Public" icon={Globe} color="emerald" />
                <StatCard label="Drafts" value={stats.drafts} subtext="Working mode" icon={Clock} color="amber" />
                <StatCard label="Engagement" value={stats.views} subtext="Total Views" icon={Eye} color="purple" />
            </div>

            {/* Search & List */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <h3 className="text-2xl font-black tracking-tighter">Manage Content</h3>
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Search your custom pages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[20px] text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredPages.length > 0 ? (
                            filteredPages.map((page, idx) => (
                                <motion.div 
                                    key={page.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                                            <FileText size={32} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black text-black dark:text-white tracking-tight">{page.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${page.isPublished ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"}`}>
                                                    {page.isPublished ? "Live" : "Draft"}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-zinc-400">
                                                <span className="bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-indigo-500">/{page.slug}</span>
                                                <span className="flex items-center gap-1.5"><Eye size={14} /> {page.views} views</span>
                                                <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(page.updatedAt).toLocaleDateString()}</span>
                                                <span className="capitalize px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">Theme: {page.template}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 relative z-10 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                                        <Link 
                                            href={`/s/${storeSlug}/page/${page.slug}`}
                                            target="_blank"
                                            className="flex-1 lg:flex-none p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                        >
                                            <Eye size={18} />
                                            <span>Preview</span>
                                        </Link>
                                        <Link 
                                            href={ownerId ? `/dashboard/pages/${page.id}?ownerId=${ownerId}` : `/dashboard/pages/${page.id}`}
                                            className="flex-1 lg:flex-none p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                        >
                                            <Edit3 size={18} />
                                            <span>Edit</span>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(page.id)}
                                            className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="absolute right-[-10%] bottom-[-20%] opacity-5 group-hover:opacity-10 scale-150 transition-opacity">
                                        <FileText size={200} />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-24 text-center bg-white dark:bg-zinc-900 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[60px]"
                                >
                                    <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-[40px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                                        <FileText size={48} className="text-zinc-300" />
                                    </div>
                                    <h4 className="text-3xl font-black text-black dark:text-white tracking-tight">Your Canvas is Empty</h4>
                                    <p className="text-zinc-500 font-bold mt-3 max-w-sm mx-auto uppercase text-xs tracking-widest">Start building your brand story with custom pages</p>
                                    <PremiumButton 
                                        href={ownerId ? `/dashboard/pages/new?ownerId=${ownerId}` : "/dashboard/pages/new"}
                                        icon={Plus}
                                        className="mt-10"
                                    >
                                        Make Magic
                                    </PremiumButton>
                                </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, subtext, icon: Icon, color }: any) {
    const colors: any = {
        indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    }

    return (
        <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                    <h3 className="text-4xl font-black tracking-tighter text-black dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    <p className="text-[11px] font-bold text-zinc-500">{subtext}</p>
                </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-20 transition-opacity bg-current ${colors[color].split(' ')[0]}`}></div>
        </div>
    )
}

