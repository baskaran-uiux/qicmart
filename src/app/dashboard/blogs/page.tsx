"use client"

import { useState, useEffect } from "react"
import { 
    Plus, Search, PenTool, Calendar, User, Eye, 
    MoreVertical, Edit2, Trash2, Loader2, X, Check,
    Image as ImageIcon, Globe, Clock, Layout, ChevronRight,
    MessageCircle, Share2, BookOpen, CheckCircle2, FileText, ExternalLink, XCircle, Edit,
    Store
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion, AnimatePresence } from "framer-motion"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import { KpiCardSkeleton, GridSkeleton } from "@/components/dashboard/DashboardSkeletons"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface Blog {
    id: string
    title: string
    slug: string
    content: string
    image: string | null
    author: string | null
    published: boolean
    createdAt: string
}

export default function BlogsPage() {
    const { t } = useDashboardStore()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [showMediaModal, setShowMediaModal] = useState(false)
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        title: "",
        content: "",
        author: "",
        image: "",
        published: false
    })

    const fetchBlogs = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/blogs?ownerId=${ownerId}` : "/api/dashboard/blogs"
            const res = await fetch(url)
            const data = await res.json()
            setBlogs(data)
        } catch (error) {
            console.error("Failed to fetch blogs:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/blogs?ownerId=${ownerId}` : "/api/dashboard/blogs"
            
            const method = editingBlog ? "PUT" : "POST"
            const body = editingBlog ? { id: editingBlog.id, ...form } : form

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                fetchBlogs()
                setShowModal(false)
                setEditingBlog(null)
                setForm({
                    title: "",
                    content: "",
                    author: "",
                    image: "",
                    published: false
                })
            }
        } catch (error) {
            console.error("Save failed:", error)
        } finally {
            setSaving(false)
        }
    }

    const toggleStatus = async (blog: Blog) => {
        try {
            const res = await fetch("/api/dashboard/blogs", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: blog.id, published: !blog.published })
            })
            if (res.ok) fetchBlogs()
        } catch (error) {
            console.error("Toggle failed:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirmDeleteArticle'))) return
        try {
            const res = await fetch("/api/dashboard/blogs", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) fetchBlogs()
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const filtered = blogs.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">{t('blogEngineTitle')}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{t('blogEngineDesc')}</p>
                </div>
                <PremiumButton 
                    onClick={() => setShowModal(true)}
                    icon={Plus}
                >
                    {t('newArticle')}
                </PremiumButton>
            </div>

            {/* Quick Actions / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                        <KpiCardSkeleton />
                    </>
                ) : (
                    [
                        { label: t('totalArticles'), value: blogs.length, icon: Layout, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                        { label: t('published'), value: blogs.filter(b => b.published).length, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: t('drafts'), value: blogs.filter(b => !b.published).length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
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
                            <p className="text-3xl font-bold text-black dark:text-white">{stat.value}</p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Articles List */}
            <div className="space-y-6">
                <div className="relative group w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('searchArticles')} 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full">
                            <GridSkeleton />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-zinc-900 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
                            <PenTool className="w-16 h-16 text-zinc-100 dark:text-zinc-800 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t('noArticlesTitle')}</h3>
                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">{t('noArticlesDesc')}</p>
                        </div>
                    ) : (
                        filtered.map((blog, i) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                                    {blog.image ? (
                                        <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={blog.title} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
                                            blog.published 
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/20'
                                        }`}>
                                            {blog.published ? t('live') : t('draft')}
                                        </span>
                                    </div>
                                    {/* Action Overlays */}
                                    <div className="absolute top-4 right-4 flex gap-2 translate-y-[-20%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button 
                                            onClick={() => {
                                                setEditingBlog(blog)
                                                setForm({
                                                    title: blog.title,
                                                    content: blog.content,
                                                    author: blog.author || "",
                                                    image: blog.image || "",
                                                    published: blog.published
                                                })
                                                setShowModal(true)
                                            }}
                                            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white hover:text-black transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(blog.id)}
                                            className="p-3 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <User size={14} className="text-zinc-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{blog.author || t('qicmartStore')}</span>
                                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-black dark:text-white leading-tight mb-4 group-hover:text-indigo-600 transition-colors uppercase italic">{blog.title}</h3>
                                    <p className="text-zinc-500 text-sm line-clamp-2 mb-8 font-medium italic">{blog.content.substring(0, 100)}...</p>
                                    
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800">
                                        <div className="flex items-center gap-4 text-zinc-400">
                                            <div className="flex items-center gap-1">
                                                <Eye size={14} /> <span className="text-[10px] font-bold">1.2K</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle size={14} /> <span className="text-[10px] font-bold">24</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleStatus(blog)}
                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            {blog.published ? t('unpublish') : t('publishNow')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Article Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-black dark:text-white uppercase italic tracking-tighter">{editingBlog ? t('editArticle') : t('writeNewArticle')}</h3>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('seoSettings')}</p>
                                </div>
                                <button onClick={() => { setShowModal(false); setEditingBlog(null); }} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-6 lg:col-span-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('articleTitle')}</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl text-sm font-bold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                            placeholder={t('placeholderTitle')}
                                            value={form.title}
                                            onChange={e => setForm({...form, title: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('authorName')}</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl text-sm font-bold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none"
                                            placeholder="John Doe"
                                            value={form.author}
                                            onChange={e => setForm({...form, author: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('status')}</label>
                                        <div className="flex bg-zinc-50 dark:bg-zinc-800 p-2 rounded-[24px] border border-zinc-200 dark:border-zinc-700">
                                            <button 
                                                type="button"
                                                onClick={() => setForm({...form, published: false})}
                                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!form.published ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                                            >
                                                {t('draft')}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setForm({...form, published: true})}
                                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${form.published ? "bg-indigo-600 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"}`}
                                            >
                                                {t('published')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 lg:col-span-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('coverImage')}</label>
                                        <div className="relative aspect-video rounded-[32px] overflow-hidden bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center group cursor-pointer" onClick={() => setShowMediaModal(true)}>
                                            {form.image ? (
                                                <img src={form.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                        <Plus className="text-zinc-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('selectImage')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">{t('content')}</label>
                                    <textarea 
                                        required
                                        rows={8}
                                        className="w-full px-8 py-6 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[32px] text-sm font-medium text-black dark:text-white focus:ring-4 focus:ring-indigo-500/5 outline-none resize-none italic leading-relaxed"
                                        placeholder={t('placeholderContent')}
                                        value={form.content}
                                        onChange={e => setForm({...form, content: e.target.value})}
                                    />
                                </div>

                                <div className="lg:col-span-2 pt-4">
                                    <PremiumButton 
                                        onClick={() => {}} // Form submission handles it
                                        type="submit"
                                        isLoading={saving}
                                        className="w-full py-5"
                                        icon={saving ? Loader2 : editingBlog ? Edit : Globe}
                                    >
                                        {saving ? t('publishing') : editingBlog ? t('updateArticle') : t('publishNow')}
                                    </PremiumButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <MediaLibraryModal 
                isOpen={showMediaModal} 
                onClose={() => setShowMediaModal(false)} 
                onSelect={(url, item) => {
                    setForm({...form, image: url})
                    setShowMediaModal(false)
                }}
            />
        </div>
    )
}
