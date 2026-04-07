"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
    Layout, Check, Zap, Loader2, Palette, ShieldCheck, ShoppingBag, ArrowRight
} from "lucide-react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import PremiumButton from "@/components/dashboard/PremiumButton"

interface StoreSettings {
    storeTheme: string
}

export default function ThemesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
            <ThemesContent />
        </Suspense>
    )
}

function ThemesContent() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const { t } = useDashboardStore()
    
    const [settings, setSettings] = useState<StoreSettings>({ storeTheme: "modern" })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeModal, setActiveModal] = useState<any>(null)

    useEffect(() => {
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
        fetch(url)
            .then(r => r.json())
            .then(data => {
                setSettings({ storeTheme: data.storeTheme || "modern" })
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [ownerId])

    const handleApplyTheme = async (themeId: string, populateData: boolean = false) => {
        setSaving(true)
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
        
        try {
            // 1. Update Theme Setting
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeTheme: themeId }),
            })
            
            if (!res.ok) throw new Error("Failed to update theme")

            // 2. Optional: Populate Demo Data
            if (populateData) {
                const popRes = await fetch("/api/dashboard/themes/populate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        themeId, 
                        ownerId,
                        category: themeId === 'nextgen' ? 'dress' : themeId === 'sports' ? 'sports' : 'general'
                    }),
                })
                if (!popRes.ok) toast.error("Theme applied, but demo data failed")
                else toast.success("Theme applied & demo data added!")
            } else {
                toast.success("Theme updated successfully")
            }

            setSettings({ storeTheme: themeId })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e) {
            toast.error("Network error or update failed")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t("loadingSettings")}</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1">
                    <h2 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {t("themes")}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-normal">Choose a premium layout and aesthetic for your digital storefront.</p>
                </div>
                {saved && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <ShieldCheck size={14} />
                        All changes saved
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 max-w-4xl">
                {[
                    { id: 'modern', name: 'Modern Flat', desc: 'Minimalist clean aesthetic with spacious layouts.', color: 'bg-zinc-100 text-zinc-900', icon: Layout, category: 'general' },
                    { id: 'nextgen', name: 'Dress Shop Theme', desc: 'Premium fashion layout with elegant accents.', color: 'bg-indigo-500 text-white', icon: ShoppingBag, category: 'dress' },
                ].map((theme) => (
                    <button 
                        key={theme.id} 
                        onClick={() => setActiveModal(theme)} 
                        disabled={saving}
                        className={`group relative flex flex-col p-8 rounded-[40px] border-2 text-left transition-all duration-500 ${settings.storeTheme === theme.id ? "border-indigo-600 bg-white dark:bg-zinc-900 shadow-2xl shadow-indigo-500/10 scale-[1.02]" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-200 hover:bg-white/80 dark:hover:bg-zinc-900/60"}`}
                    >
                        <div className={`w-14 h-14 ${theme.color} rounded-[20px] mb-6 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                            <theme.icon size={28} />
                        </div>
                        
                        <div className="space-y-2 mb-8">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{theme.name}</h3>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">{theme.desc}</p>
                        </div>
                        
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800/50">
                            {settings.storeTheme === theme.id ? (
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" />
                                    Active Now
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Apply Theme</span>
                            )}
                            
                            {settings.storeTheme === theme.id && (
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {settings.storeTheme === theme.id && (
                            <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full tracking-widest shadow-xl border-4 border-white dark:border-zinc-950">
                                Current
                            </div>
                        )}
                    </button>
                ))}
            </div>

                {/* Activation & Demo Data Modal */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800 p-8 sm:p-12 w-full max-w-xl relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                            
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Apply {activeModal.name}?</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                                        You're about to switch to the <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeModal.name}</span>. 
                                        Would you like to instantly populate your store with high-quality demo products and categories?
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button 
                                        onClick={() => {
                                            handleApplyTheme(activeModal.id, true)
                                            setActiveModal(null)
                                        }}
                                        disabled={saving}
                                        className="w-full group relative flex items-center justify-between p-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] text-left transition-all overflow-hidden"
                                    >
                                        <div className="relative z-10 space-y-1">
                                            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Highly Recommended</p>
                                            <p className="font-bold text-lg">Apply Theme + Populate Demo Data</p>
                                        </div>
                                        <Zap className="relative z-10 w-8 h-8 opacity-50 group-hover:scale-110 transition-transform" fill="currentColor" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                                    </button>

                                    <button 
                                        onClick={() => {
                                            handleApplyTheme(activeModal.id, false)
                                            setActiveModal(null)
                                        }}
                                        disabled={saving}
                                        className="w-full flex items-center justify-between p-6 border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-[24px] text-left transition-all"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Basic Change</p>
                                            <p className="font-bold text-lg">Apply Theme Only</p>
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-zinc-300" />
                                    </button>
                                </div>

                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center font-medium">
                                    Note: Populate data will add new collections and premium products with professional imagery. 
                                    This will not delete your existing items.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-indigo-600 rounded-[48px] p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                            <Zap size={14} className="fill-white" />
                            Premium Customization
                        </div>
                        <h3 className="text-3xl font-bold text-white max-w-md leading-tight">Want a fully custom unique layout for your brand?</h3>
                        <p className="text-indigo-100 text-sm font-medium opacity-80 max-w-sm">Contact our design experts to build a bespoke storefront experience tailored to your specific needs.</p>
                    </div>
                    <PremiumButton className="bg-white text-indigo-600 hover:bg-zinc-50 border-none shadow-2xl py-6 px-10">
                        Request Custom Theme
                    </PremiumButton>
                </div>
            </div>
        </div>
    )
}
