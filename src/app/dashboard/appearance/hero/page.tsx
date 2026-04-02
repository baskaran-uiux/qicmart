"use client"

import { useState, useEffect, useRef } from "react"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { useSearchParams } from "next/navigation"
import { 
    Plus, Image as ImageIcon, Check, Trash2, Upload, 
    Video, Play, ChevronRight, Layout, Palette, 
    AlignLeft, AlignCenter, AlignRight, Eye, EyeOff,
    Loader2, RefreshCw, AlertCircle
} from "lucide-react"
import PremiumButton from "@/components/dashboard/PremiumButton"
import { FormSkeleton } from "@/components/dashboard/DashboardSkeletons"

interface Banner {
    id: string
    type: "image" | "video"
    image: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    titleColor?: string
    subtitleColor?: string
    btnColor?: string
    btnTextColor?: string
    textAlign?: "left" | "center" | "right"
    showOverlay?: boolean
}

interface StoreSettings {
    name: string
    banners: Banner[]
    [key: string]: any
}

export default function HeroBannerPage() {
    const { t } = useDashboardStore()
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    
    const [settings, setSettings] = useState<StoreSettings | null>(null)
    const [initialSettings, setInitialSettings] = useState<StoreSettings | null>(null)
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
    const [mediaLibrary, setMediaLibrary] = useState<{ open: boolean, type: string, bannerId?: string }>({ open: false, type: "" })

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
            try {
                const res = await fetch(url)
                const data = await res.json()
                if (res.ok) {
                    setSettings(data)
                    setInitialSettings(data)
                    setBanners(data.banners || [])
                } else {
                    setError("Failed to load settings")
                }
            } catch (e) {
                setError("Network error")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [ownerId])

    // Auto-save logic
    useEffect(() => {
        if (!initialSettings || !settings) return;

        const hasChanged = JSON.stringify(banners) !== JSON.stringify(initialSettings.banners);
        
        if (hasChanged) {
            const timer = setTimeout(() => {
                handleSave(banners);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [banners, initialSettings]);

    const handleSave = async (newBanners: Banner[]) => {
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...settings, banners: newBanners }),
            })
            if (res.ok) {
                setInitialSettings(prev => prev ? { ...prev, banners: newBanners } : null)
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                setError("Failed to auto-save")
            }
        } catch (e) {
            setError("Connection lost")
        } finally {
            setSaving(false)
        }
    }

    const addBanner = () => {
        const newBanner: Banner = {
            id: Math.random().toString(36).substr(2, 9),
            type: "image",
            image: "",
            title: "New Collection",
            subtitle: "Discover our latest trends",
            buttonText: "Shop Now",
            buttonLink: "/products",
            titleColor: "#ffffff",
            subtitleColor: "#ffffff",
            btnColor: "#ffffff",
            btnTextColor: "#000000",
            textAlign: "center",
            showOverlay: true
        }
        const updated = [...banners, newBanner]
        setBanners(updated)
        setEditingBannerId(newBanner.id)
    }

    const removeBanner = (id: string) => {
        const updated = banners.filter(b => b.id !== id)
        setBanners(updated)
        if (editingBannerId === id) setEditingBannerId(null)
    }

    const updateBanner = (id: string, key: keyof Banner, value: any) => {
        const updated = banners.map(b => b.id === id ? { ...b, [key]: value } : b)
        setBanners(updated)
    }

    const openMediaLibrary = (type: string, bannerId?: string) => {
        setMediaLibrary({ open: true, type, bannerId })
    }

    const handleMediaSelect = (url: string) => {
        if (mediaLibrary.bannerId) {
            const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
            const updated = banners.map(b => 
                b.id === mediaLibrary.bannerId 
                    ? { ...b, image: url, type: (isVideo ? "video" : "image") as any } 
                    : b
            )
            setBanners(updated)
        }
        setMediaLibrary({ open: false, type: "" })
    }

    if (loading) return <FormSkeleton />

    const editingBanner = banners.find(b => b.id === editingBannerId)
    const isDirty = JSON.stringify(banners) !== JSON.stringify(initialSettings?.banners)

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1">
                    <h1 className="text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Hero Banners</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[14px] font-medium">
                        Manage your storefront's main slider with photos and videos.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                        {saving ? (
                            <div className="flex items-center gap-2 text-indigo-500 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saving</span>
                            </div>
                        ) : saved ? (
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10">
                                <Check size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/10">
                                <RefreshCw size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Unsaved Changes</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-widest">All Persistent</span>
                            </div>
                        )}
                    </div>
                    <PremiumButton onClick={addBanner} icon={Plus}>
                        Add Banner
                    </PremiumButton>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {banners.length === 0 ? (
                <div className="p-12 text-center rounded-[32px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-600 shadow-sm">
                        <ImageIcon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Banners Added</h3>
                    <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">Create your first hero banner with photos or videos to showcase your premium store collection.</p>
                    <PremiumButton onClick={addBanner} icon={Plus} size="sm">Create First Slide</PremiumButton>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {editingBannerId ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            {/* Editor Area */}
                            <div className="relative aspect-[21/9] sm:aspect-[21/7] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                {editingBanner?.image ? (
                                    editingBanner.type === 'video' ? (
                                        <video 
                                            key={editingBanner.image}
                                            src={editingBanner.image} 
                                            autoPlay 
                                            loop 
                                            muted 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <img src={editingBanner.image} className="w-full h-full object-cover" alt="Banner Preview" />
                                    )
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                                            <ImageIcon size={32} className="opacity-20" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Select an image or video</p>
                                    </div>
                                )}
                                
                                {editingBanner?.showOverlay && (
                                    <div className="absolute inset-0 bg-black/40 z-10" />
                                )}

                                <div className={`absolute inset-0 z-20 flex flex-col justify-center px-10 sm:px-20 text-white
                                    ${editingBanner?.textAlign === 'left' ? 'items-start text-left' : 
                                      editingBanner?.textAlign === 'right' ? 'items-end text-right' : 
                                      'items-center text-center'}`}>
                                    <h4 className="text-3xl sm:text-5xl font-black mb-3 drop-shadow-2xl leading-none" style={{ color: editingBanner?.titleColor }}>
                                        {editingBanner?.title || "Your Great Heading"}
                                    </h4>
                                    <p className="text-[12px] sm:text-[14px] opacity-90 drop-shadow-lg max-w-lg leading-relaxed" style={{ color: editingBanner?.subtitleColor }}>
                                        {editingBanner?.subtitle || "Write a compelling sub-heading here..."}
                                    </p>
                                    {editingBanner?.buttonText && (
                                        <button 
                                            className="mt-6 px-8 py-3 rounded-full font-bold text-[12px] uppercase tracking-widest shadow-xl pointer-events-none"
                                            style={{ backgroundColor: editingBanner?.btnColor, color: editingBanner?.btnTextColor }}
                                        >
                                            {editingBanner.buttonText}
                                        </button>
                                    )}
                                </div>

                                <div className="absolute top-8 right-8 z-30">
                                    <button 
                                        onClick={() => openMediaLibrary("banner", editingBanner?.id)}
                                        className="px-6 py-3.5 bg-white text-zinc-900 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border border-zinc-100"
                                    >
                                        <Upload size={14} className="stroke-[3]" />
                                        Replace Media
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Heading Text</label>
                                            <span className="text-[10px] text-zinc-300">Max 50 chars</span>
                                        </div>
                                        <input 
                                            value={editingBanner?.title} 
                                            onChange={e => updateBanner(editingBanner!.id, "title", e.target.value)}
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Sub-heading / Paragraph</label>
                                        <input 
                                            value={editingBanner?.subtitle} 
                                            onChange={e => updateBanner(editingBanner!.id, "subtitle", e.target.value)}
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Button Call-to-Action</label>
                                        <input 
                                            value={editingBanner?.buttonText} 
                                            onChange={e => updateBanner(editingBanner!.id, "buttonText", e.target.value)}
                                            placeholder="e.g. Shop Now"
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Button Link URL</label>
                                        <input 
                                            value={editingBanner?.buttonLink} 
                                            onChange={e => updateBanner(editingBanner!.id, "buttonLink", e.target.value)}
                                            placeholder="e.g. /products"
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Visual Customization</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                        {[
                                            { label: "Title Color", key: "titleColor", value: editingBanner?.titleColor || "#ffffff" },
                                            { label: "Para Color", key: "subtitleColor", value: editingBanner?.subtitleColor || "#ffffff" },
                                            { label: "Btn Color", key: "btnColor", value: editingBanner?.btnColor || "#ffffff" },
                                            { label: "Btn Text", key: "btnTextColor", value: editingBanner?.btnTextColor || "#000000" }
                                        ].map((c) => (
                                            <div key={c.key} className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 opacity-60">{c.label}</label>
                                                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 transition-all hover:border-indigo-500/20">
                                                    <input type="color" value={c.value} onChange={e => updateBanner(editingBanner!.id, c.key as any, e.target.value)} className="w-8 h-8 rounded-lg border-none cursor-pointer p-0 overflow-hidden" />
                                                    <input value={c.value} onChange={e => updateBanner(editingBanner!.id, c.key as any, e.target.value)} className="w-full bg-transparent text-[10px] font-mono font-black outline-none uppercase text-zinc-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex flex-wrap items-center gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Content Alignment</label>
                                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                                                {[
                                                    { key: "left", icon: AlignLeft },
                                                    { key: "center", icon: AlignCenter },
                                                    { key: "right", icon: AlignRight }
                                                ].map(a => (
                                                    <button
                                                        key={a.key}
                                                        onClick={() => updateBanner(editingBanner!.id, "textAlign", a.key)}
                                                        className={`p-3 rounded-xl transition-all ${editingBanner?.textAlign === a.key ? 'bg-white dark:bg-zinc-700 shadow-md text-indigo-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                                                    >
                                                        <a.icon size={18} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Dark Overlay</label>
                                            <button 
                                                onClick={() => updateBanner(editingBanner!.id, "showOverlay", !editingBanner?.showOverlay)}
                                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border font-bold text-xs ${editingBanner?.showOverlay ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}
                                            >
                                                {editingBanner?.showOverlay ? <Eye size={16} /> : <EyeOff size={16} />}
                                                {editingBanner?.showOverlay ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Media Mode</label>
                                            <div className={`px-5 py-3 rounded-2xl transition-all border flex items-center gap-3 font-bold text-xs ${editingBanner?.type === 'video' ? 'bg-purple-600 text-white border-purple-700 shadow-lg shadow-purple-500/20' : 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/20'}`}>
                                                {editingBanner?.type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                                                {editingBanner?.type?.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <button 
                                            onClick={() => removeBanner(editingBanner!.id)}
                                            className="px-8 py-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[22px] transition-all font-black text-[11px] uppercase tracking-widest flex-1 sm:flex-initial"
                                        >
                                            Delete Slide
                                        </button>
                                        <PremiumButton 
                                            onClick={() => setEditingBannerId(null)} 
                                            className="flex-1 sm:flex-initial px-12 py-4"
                                            size="sm"
                                            icon={Check}
                                        >
                                            Finish Layout
                                        </PremiumButton>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <Reorder.Group axis="y" values={banners} onReorder={setBanners} className="grid grid-cols-1 gap-5">
                            {banners.map((banner: Banner, index: number) => (
                                <Reorder.Item 
                                    key={banner.id} 
                                    value={banner} 
                                    className="group flex items-center gap-8 p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <div className="w-48 h-28 bg-zinc-50 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
                                        {banner.image ? (
                                            banner.type === 'video' ? (
                                                <video src={banner.image} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={banner.image} className="w-full h-full object-cover" alt="Thumb" />
                                            )
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <ImageIcon size={24} />
                                                <span className="text-[8px] font-black uppercase text-center leading-tight">No Media<br/>Selected</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.15em] bg-indigo-500/10 px-3 py-1 rounded-full">Slide {index + 1}</span>
                                            {banner.type === 'video' && <span className="text-[9px] font-black uppercase text-purple-500 tracking-[0.15em] bg-purple-500/10 px-3 py-1 rounded-full">Video</span>}
                                        </div>
                                        <h3 className="font-black truncate text-xl text-slate-800 dark:text-white">{banner.title || "Untitled Slide"}</h3>
                                        <p className="text-zinc-400 dark:text-zinc-500 text-[12px] font-medium truncate max-w-xl mt-1">{banner.subtitle || "Tell your story in this space..."}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setEditingBannerId(banner.id)}
                                            className="px-8 py-4 bg-zinc-50 dark:bg-white text-zinc-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Configure Design
                                        </button>
                                        <button 
                                            onClick={() => removeBanner(banner.id)}
                                            className="p-4 text-zinc-300 hover:text-rose-500 bg-zinc-50/50 dark:bg-zinc-800 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            )}

            {mediaLibrary.open && (
                <MediaLibraryModal 
                    isOpen={mediaLibrary.open}
                    onClose={() => setMediaLibrary({ open: false, type: "" })}
                    onSelect={handleMediaSelect}
                    title={mediaLibrary.type === 'video' ? "Choose Video Background" : "Select Banner Image"}
                />
            )}
        </div>
    )
}
