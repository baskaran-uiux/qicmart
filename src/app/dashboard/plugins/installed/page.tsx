"use client"

import { useState, useEffect } from "react"
import { Search, Zap, Layout, Star, Globe, MessageSquare, BarChart3, Settings, Power, Trash2, ExternalLink, X, Loader2, Check, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Plugin {
    id: string
    name: string
    description: string
    category: string
    icon: any
    color: string
    bg: string
    fields: { name: string; label: string; type: string; placeholder: string; key: string }[]
}

const plugins: Plugin[] = [
    {
        id: "google-analytics",
        name: "Google Analytics",
        description: "Track your store traffic and user behavior with Google Analytics 4.",
        category: "Analytics",
        icon: Globe,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        fields: [
            { name: "googleAnalyticsId", label: "Measurement ID", type: "text", placeholder: "G-XXXXXXXXXX", key: "googleAnalyticsId" }
        ]
    },
    {
        id: "whatsapp-chat",
        name: "WhatsApp Chat Bubble",
        description: "Add a floating WhatsApp button to your store for direct customer support.",
        category: "Marketing",
        icon: MessageSquare,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        fields: [
            { name: "whatsappNumber", label: "WhatsApp Number", type: "text", placeholder: "91XXXXXXXXXX", key: "whatsappNumber" },
            { name: "whatsappMessage", label: "Welcome Message", type: "text", placeholder: "Hello! How can we help you?", key: "whatsappMessage" }
        ]
    },
    {
        id: "facebook-pixel",
        name: "Facebook Pixel",
        description: "Optimize your Facebook ads and track conversions on your storefront.",
        category: "Analytics",
        icon: BarChart3,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        fields: [
            { name: "facebookPixelId", label: "Pixel ID", type: "text", placeholder: "1234567890", key: "facebookPixelId" }
        ]
    },
    {
        id: "seo-optimizer",
        name: "All-in-one SEO",
        description: "Enhance your store's search engine visibility and dynamic meta tags.",
        category: "Marketing",
        icon: Search,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        fields: [
            { name: "seoTitle", label: "SEO Title Template", type: "text", placeholder: "{product_name} - {store_name}", key: "seoTitle" },
            { name: "seoDescription", label: "SEO Meta Description", type: "text", placeholder: "Buy the best products at {store_name}", key: "seoDescription" }
        ]
    },
    {
        id: "google-reviews",
        name: "Customer Reviews",
        description: "Display hand-picked customer testimonials and reviews on your storefront.",
        category: "Trust",
        icon: Star,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        fields: [] // Will use custom list manager instead
    }
]

import { useSearchParams } from "next/navigation"

export default function InstalledPluginsPage() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"
    
    const [search, setSearch] = useState("")
    const [configPlugin, setConfigPlugin] = useState<Plugin | null>(null)
    const [settings, setSettings] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [ownerId, dashboardType])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const url = new URL("/api/dashboard/settings", window.location.origin)
            if (ownerId) url.searchParams.set("ownerId", ownerId)
            url.searchParams.set("dashboardType", dashboardType)
            
            const res = await fetch(url.toString())
            const data = await res.json()
            if (data.hasStore) {
                setSettings(data)
            }
        } catch (e) {
            console.error("Failed to fetch settings", e)
        }
        setLoading(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const url = new URL("/api/dashboard/settings", window.location.origin)
            if (ownerId) url.searchParams.set("ownerId", ownerId)
            url.searchParams.set("dashboardType", dashboardType)

            const res = await fetch(url.toString(), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })
            if (res.ok) {
                setSuccess(true)
                await fetchSettings()
                setTimeout(() => {
                    setSuccess(false)
                    setConfigPlugin(null)
                }, 1500)
            } else {
                const data = await res.json()
                setError(data.error || "Failed to save settings")
            }
        } catch (e) {
            setError("An error occurred while saving")
            console.error("Failed to save settings", e)
        }
        setSaving(false)
    }

    const togglePlugin = async (pluginId: string, currentStatus: boolean, key: string) => {
        const newSettings = { ...settings, [key]: !currentStatus }
        setSettings(newSettings)
        try {
            const url = new URL("/api/dashboard/settings", window.location.origin)
            if (ownerId) url.searchParams.set("ownerId", ownerId)
            url.searchParams.set("dashboardType", dashboardType)

            const res = await fetch(url.toString(), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings)
            })
            if (!res.ok) {
                // Revert local state if API fails
                setSettings(settings)
                alert("Failed to update plugin status")
            } else {
                await fetchSettings()
            }
        } catch (e) {
            setSettings(settings)
            console.error("Failed to toggle plugin", e)
        }
    }

    const getStatusKey = (pluginId: string) => {
        switch (pluginId) {
            case "whatsapp-chat": return "isWhatsappEnabled"
            case "google-analytics": return "isGoogleAnalyticsEnabled"
            case "facebook-pixel": return "isFacebookPixelEnabled"
            case "seo-optimizer": return "isSeoEnabled"
            case "google-reviews": return "isGoogleReviewsEnabled"
            default: return ""
        }
    }

    const handleDelete = async (plugin: Plugin) => {
        if (!confirm(`Are you sure you want to delete ${plugin.name}? All its configuration data will be permanently erased.`)) return
        
        const statusKey = getStatusKey(plugin.id)
        
        // Instead of deleting keys (which makes them undefined and ignored by the server),
        // we set them to explicit empty/false values to clear them in the database.
        const newSettings = { ...settings }
        if (statusKey) newSettings[statusKey] = false
        plugin.fields.forEach(f => {
            newSettings[f.key] = ""
        })

        try {
            const url = new URL("/api/dashboard/settings", window.location.origin)
            if (ownerId) url.searchParams.set("ownerId", ownerId)
            url.searchParams.set("dashboardType", dashboardType)

            const res = await fetch(url.toString(), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings)
            })
            if (res.ok) {
                setSettings(newSettings)
                await fetchSettings()
            } else {
                alert("Failed to delete plugin data")
            }
        } catch (e) {
            console.error("Failed to delete plugin", e)
            alert("An error occurred while deleting")
        }
    }

    const filtered = plugins.filter(p => {
        const statusKey = getStatusKey(p.id)
        // Only show plugins that are either enabled or have some configuration data
        const isInstalled = settings[statusKey] === true || p.fields.some(f => settings[f.key] && settings[f.key].length > 0)
        
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             p.category.toLowerCase().includes(search.toLowerCase())
        
        return isInstalled && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Installed Plugins</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[12px] sm:text-[14px] font-medium tracking-normal">Configure and manage your store's functional extensions.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search plugins..." 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white transition-all shadow-sm"
                />
            </div>

            {/* Plugin Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(plugin => {
                    const statusKey = getStatusKey(plugin.id)
                    const isActive = settings[statusKey] || false
                    return (
                        <div key={plugin.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-2xl ${plugin.bg} ${plugin.color} shadow-sm`}>
                                        <plugin.icon size={24} />
                                    </div>
                                    <button 
                                        onClick={() => togglePlugin(plugin.id, isActive, statusKey)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold capitalize tracking-tight transition-all border ${isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"}`}
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-white">{plugin.name}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{plugin.description}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between gap-3">
                                <button 
                                    onClick={() => {
                                        if (plugin.id === "google-reviews") {
                                            const params = new URLSearchParams(window.location.search)
                                            window.location.href = `/dashboard/plugins/reviews${params.toString() ? '?' + params.toString() : ''}`
                                        } else {
                                            setConfigPlugin(plugin)
                                        }
                                    }}
                                    className="flex-1 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-[11px] font-bold border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                >
                                    <Settings size={14} />
                                    Manage
                                </button>
                                <button 
                                    onClick={() => handleDelete(plugin)}
                                    className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {configPlugin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfigPlugin(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full ${configPlugin.id === 'google-reviews' ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden relative shadow-2xl`}
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${configPlugin.bg} ${configPlugin.color}`}>
                                            <configPlugin.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{configPlugin.name}</h3>
                                            <p className="text-xs text-zinc-500 font-medium">Configure plugin settings</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setConfigPlugin(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                        <X size={20} className="text-zinc-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-5">
                                    {configPlugin.fields.map(field => {
                                        const isPhone = field.key === "whatsappNumber";
                                        return (
                                            <div key={field.name} className="space-y-2">
                                                <label className="text-[11px] font-bold capitalize tracking-tight text-zinc-400">{field.label}</label>
                                                <div className="relative">
                                                    {isPhone && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">+91</span>}
                                                    <input 
                                                        type={field.type}
                                                        placeholder={isPhone ? "9876543210" : field.placeholder}
                                                        value={isPhone ? (settings[field.key]?.replace(/^\+?91/, '') || "") : (settings[field.key] || "")}
                                                        onChange={e => {
                                                            let val = e.target.value;
                                                            if (isPhone) {
                                                                val = "91" + val.replace(/\D/g, '').slice(0, 10);
                                                            }
                                                            setSettings({ ...settings, [field.key]: val });
                                                        }}
                                                        className={`w-full ${isPhone ? "pl-14" : "px-5"} py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white transition-all`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="pt-4 flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setConfigPlugin(null)}
                                            className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-semibold text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={saving}
                                            className="flex-[2] py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : success ? <Check size={18} /> : "Save settings"}
                                            {success ? "Saved!" : ""}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="py-24 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No plugins match your search</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Try searching with a different keyword or category name.</p>
                </div>
            )}

            {/* Developer Support */}
            <div className="p-8 bg-gradient-to-tr from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-white rounded-[40px] text-white dark:text-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-bold tracking-tight">Need a custom plugin?</h3>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium max-w-sm">Our team can help you build bespoke integrations for your specific business requirements.</p>
                </div>
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    Contact Developer Support
                    <ExternalLink size={16} />
                </button>
            </div>
        </div>
    )
}
