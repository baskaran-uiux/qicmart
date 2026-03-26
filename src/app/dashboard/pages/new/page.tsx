"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    Save, X, ChevronLeft, Globe, Eye, Layout, Type, 
    Search, Sparkles, Loader2, CheckCircle2, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

export default function NewCustomPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const type = searchParams.get("type")
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        isPublished: true,
        template: "default",
        seoTitle: "",
        seoDescription: ""
    })

    useEffect(() => {
        if (type) {
            const templates: any = {
                contact: { title: "Contact Us", slug: "contact", content: "<h1>Contact Us</h1><p>Get in touch with us...</p>" },
                privacy: { title: "Privacy Policy", slug: "privacy", content: "<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>" },
                terms: { title: "Terms of Service", slug: "terms", content: "<h1>Terms of Service</h1><p>By using our store, you agree to...</p>" },
                faq: { title: "FAQ", slug: "faq", content: "<h1>Frequently Asked Questions</h1><p>Find answers to common questions...</p>" },
                refund: { title: "Return & Refund Policy", slug: "refund", content: "<h1>Returns & Refunds</h1><p>Our policy lasts 30 days...</p>" }
            }
            if (templates[type]) {
                setForm(prev => ({ ...prev, ...templates[type] }))
            }
        }
    }, [type])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = ownerId ? `/api/dashboard/pages?ownerId=${ownerId}` : "/api/dashboard/pages"
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            if (res.ok) {
                router.push(ownerId ? `/dashboard/pages?ownerId=${ownerId}` : "/dashboard/pages")
            } else {
                const error = await res.text()
                alert(error || "Failed to create page")
            }
        } catch (error) {
            console.error("Failed to save:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-zinc-200 dark:border-zinc-800 sticky top-4 z-40 shadow-2xl">
                <div className="flex items-center gap-4">
                    <Link 
                        href={ownerId ? `/dashboard/pages?ownerId=${ownerId}` : "/dashboard/pages"}
                        className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tight">Create Masterpiece</h1>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Custom Page</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.back()}
                        className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-all"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Publish Now
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
                                onChange={(val: string) => setForm({ ...form, title: val, slug: val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") })} 
                            />
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL Slug</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs italic">/page/</div>
                                    <input 
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        className="w-full pl-16 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="our-story"
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
                                    placeholder="Write your page content here..."
                                />
                            </div>
                        </div>
                    </Section>

                    <Section card title="SEO Settings" icon={Search}>
                        <div className="grid grid-cols-1 gap-6">
                            <InputField 
                                label="SEO Title" 
                                placeholder="Custom SEO Title" 
                                value={form.seoTitle} 
                                onChange={(val: string) => setForm({ ...form, seoTitle: val })} 
                            />
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1">SEO Description</label>
                                <textarea 
                                    rows={3}
                                    value={form.seoDescription}
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
                                    <p className="text-sm font-black italic">Public Status</p>
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
                                <h4 className="font-black italic text-lg leading-tight mb-2 text-nowrap select-none">Design Your Identity</h4>
                                <p className="text-xs font-bold text-white/80 leading-relaxed select-none">Every page is an opportunity to tell your customers who you are. Make it bold.</p>
                           </div>
                           <Sparkles className="absolute -right-4 top-0 opacity-20 group-hover:scale-150 transition-transform" size={100} />
                        </div>
                    </Section>
                    
                    <Section card title="Live Preview" icon={Eye}>
                         <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 rounded-3xl border-4 border-zinc-200 dark:border-zinc-800 overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-white/50 dark:bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <p className="text-xs font-black uppercase tracking-tighter italic">Preview will be available after saving</p>
                            </div>
                            <div className="p-4 space-y-3 opacity-40 blur-[1px]">
                                <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full w-2/3 animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full animate-pulse"></div>
                                    <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full w-5/6 animate-pulse"></div>
                                    <div className="h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full w-4/6 animate-pulse"></div>
                                </div>
                            </div>
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
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 italic">{title}</h3>
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
