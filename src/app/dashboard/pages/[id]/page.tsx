"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    Save, X, ChevronLeft, Globe, Eye, Layout, Type, 
    Search, Sparkles, Loader2, Trash2, ArrowRight, Check, RefreshCw
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

export default function EditCustomPage() {
    const router = useRouter()
    const params = useParams() as { id: string }
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        isPublished: true,
        template: "default",
        seoTitle: "",
        seoDescription: ""
    })
    const [initialForm, setInitialForm] = useState<any>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSaved, setLastSaved] = useState<string | null>(null)

    useEffect(() => {
        fetchPage()
    }, [params.id])

    const fetchPage = async () => {
        try {
            const res = await fetch(`/api/dashboard/pages/${params.id}`)
            const data = await res.json()
            setForm(data)
            setInitialForm(data)
            setIsDirty(false)
        } catch (error) {
            console.error("Failed to fetch page:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAutoSave = async () => {
        if (!form.title.trim()) return
        if (JSON.stringify(form) === JSON.stringify(initialForm)) return

        setSaving(true)
        try {
            const res = await fetch(`/api/dashboard/pages/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                setInitialForm({ ...form })
                setIsDirty(false)
                setLastSaved(new Date().toLocaleTimeString())
            }
        } catch (error) {
            console.error("Auto-save failed:", error)
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (!initialForm) return
        
        const hasChanged = JSON.stringify(form) !== JSON.stringify(initialForm)
        setIsDirty(hasChanged)

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleAutoSave()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [form, initialForm])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        await handleAutoSave()
    }

    const handleDelete = async () => {
        if (!confirm("Delete this masterpiece? This cannot be undone.")) return
        try {
            const res = await fetch(`/api/dashboard/pages/${params.id}`, { method: "DELETE" })
            if (res.ok) {
                router.push(ownerId ? `/dashboard/pages?ownerId=${ownerId}` : "/dashboard/pages")
            }
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 pt-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Link 
                        href={ownerId ? `/dashboard/pages?ownerId=${ownerId}` : "/dashboard/pages"}
                        className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-90"
                    >
                        <ChevronLeft size={18} />
                    </Link>
                    <div className="min-w-0">
                        <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-black dark:text-white capitalize truncate">{form.title || "Untitled Page"}</h2>
                        <p className="text-[12px] font-medium text-zinc-500 tracking-normal">Edit Custom Page Content</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        {saving ? (
                            <div className="flex items-center gap-2 text-indigo-500">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saving...</span>
                            </div>
                        ) : lastSaved ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Check size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saved {lastSaved}</span>
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-2 text-amber-500">
                                <RefreshCw size={12} className="animate-spin-slow" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Unsaved</span>
                            </div>
                        ) : null}
                    </div>
                    <button 
                        onClick={handleDelete}
                        className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                        title="Delete Page"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button 
                        onClick={() => handleSubmit()}
                        disabled={saving}
                        className="px-8 py-3 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-[10px] capitalize tracking-wide shadow-xl shadow-indigo-500/10 hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : isDirty ? <RefreshCw size={16} className="animate-spin-slow" /> : <Check size={16} />}
                        {saving ? "Saving..." : isDirty ? "Sync Now" : "Published"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Section card title="Page Content" icon={Type}>
                        <div className="space-y-6">
                            <InputField 
                                label="Page Title" 
                                placeholder="e.g. Our Story" 
                                value={form.title} 
                                onChange={(val: string) => setForm({ ...form, title: val })} 
                            />
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL Slug</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">/page/</div>
                                    <input 
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        className="w-full pl-16 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Content (HTML Supported)</label>
                                <textarea 
                                    rows={15}
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl text-sm font-medium font-mono focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </Section>

                    <Section card title="SEO Settings" icon={Search}>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField 
                                label="SEO Title" 
                                placeholder="Custom SEO Title" 
                                value={form.seoTitle || ""} 
                                onChange={(val: string) => setForm({ ...form, seoTitle: val })} 
                            />
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">SEO Description</label>
                                <textarea 
                                    rows={3}
                                    value={form.seoDescription || ""}
                                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                                    className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Meta description for search engines..."
                                />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-8">
                    <Section card title="Publishing" icon={Globe}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black">Public Status</p>
                                    <p className="text-[10px] font-bold text-zinc-500">Visible on storefront</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={form.isPublished}
                                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                    />
                                    <div className="w-12 h-6 bg-zinc-200 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">Template Style</label>
                                <select 
                                    value={form.template}
                                    onChange={(e) => setForm({ ...form, template: e.target.value })}
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="default">Premium Default</option>
                                    <option value="centered">Centered Content</option>
                                    <option value="narrow">Narrow Reader</option>
                                    <option value="landing">Landing Page</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    <Section card title="Aesthetics" icon={Sparkles}>
                        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white space-y-4 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                           <div className="relative z-10">
                                <h4 className="font-black text-lg leading-tight mb-2 text-nowrap select-none">Design Your Identity</h4>
                                <p className="text-xs font-bold text-white/80 leading-relaxed select-none">Every page is an opportunity to tell your customers who you are. Make it bold.</p>
                           </div>
                           <Sparkles className="absolute -right-4 top-0 opacity-20 group-hover:scale-150 transition-transform" size={100} />
                        </div>
                    </Section>
                    
                    <Section card title="Action" icon={ArrowRight}>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Links & Sharing</p>
                            <Link 
                                href="#" 
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-between text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all group"
                            >
                                Copy Live URL
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    )
}

function Section({ children, title, icon: Icon, card }: any) {
    return (
        <div className={`space-y-6 ${card ? "p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] shadow-sm" : ""}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">{title}</h3>
            </div>
            {children}
        </div>
    )
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                placeholder={placeholder}
            />
        </div>
    )
}
