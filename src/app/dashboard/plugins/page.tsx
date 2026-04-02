"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Zap, Layout, ArrowRight, Star, ShieldCheck, Globe, ShoppingBag, MessageSquare, Truck, BarChart3, Settings, Loader2 } from "lucide-react"
import PremiumButton from "@/components/dashboard/PremiumButton"

const categories = ["All", "Storefront", "Marketing", "Shipping", "Analytics", "Trust"]

const plugins = [
    {
        id: "whatsapp-chat",
        name: "WhatsApp Chat Bubble",
        description: "Add a floating WhatsApp button to your store for direct customer support.",
        fullDescription: "WhatsApp Chat Bubble allows your customers to contact you directly via WhatsApp from your storefront. It helps in building trust and provides instant support to your customers.",
        features: [
            "Easy one-click setup",
            "Customizable welcome message",
            "Responsive floating bubble",
            "Works on all devices"
        ],
        guide: "1. Enter your WhatsApp number with country code.\n2. Set a custom welcome message for your customers.\n3. Click 'Install' to enable the bubble on your store.",
        faq: [
            { q: "Is it free?", a: "Yes, this plugin is completely free to use." },
            { q: "Can I use multiple numbers?", a: "Currently, only one number is supported per store." }
        ],
        author: "Qicmart Official",
        category: "Marketing",
        icon: MessageSquare,
        rating: 4.8,
        installs: "2.4k",
        price: "Free",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        statusKey: "isWhatsappEnabled"
    },
    {
        id: "google-analytics",
        name: "Google Analytics",
        description: "Track your store traffic and user behavior with Google Analytics 4.",
        fullDescription: "Google Analytics 4 (GA4) provides deep insights into your store traffic, conversion rates, and customer demographics. Essential for data-driven decisions.",
        features: [
            "Real-time traffic tracking",
            "Conversion event monitoring",
            "Customer journey analysis",
            "Simplified measurement ID setup"
        ],
        guide: "1. Create a GA4 property in your Google Analytics dashboard.\n2. Copy the 'Measurement ID' (G-XXXXXXXXXX).\n3. Paste the ID here and install.",
        faq: [
            { q: "Where do I find my ID?", a: "Go to Admin > Data Streams > Web Stream in your GA4 property." },
            { q: "Does it track sales?", a: "Yes, it tracks standard e-commerce events automatically." }
        ],
        author: "Google",
        category: "Analytics",
        icon: Globe,
        rating: 4.9,
        installs: "5.2k",
        price: "Free",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        statusKey: "isGoogleAnalyticsEnabled"
    },
    {
        id: "facebook-pixel",
        name: "Facebook Pixel",
        description: "Optimize your Facebook ads and track conversions on your storefront.",
        fullDescription: "Facebook Pixel (Meta Pixel) helps you measure the effectiveness of your advertising by understanding the actions people take on your website.",
        features: [
            "Retargeting audience building",
            "Ad conversion optimization",
            "Event tracking (ViewContent, AddToCart, Purchase)",
            "Detailed campaign reporting"
        ],
        guide: "1. Create a Pixel in Meta Events Manager.\n2. Copy your Pixel ID (15-16 digit number).\n3. Enter the ID here and click install.",
        faq: [
            { q: "Can I use multiple Pixels?", a: "This integration supports one primary Pixel ID." },
            { q: "Does it support CAPI?", a: "This is a browser-based pixel integration." }
        ],
        author: "Meta",
        category: "Analytics",
        icon: BarChart3,
        rating: 4.7,
        installs: "3.1k",
        price: "Free",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        statusKey: "isFacebookPixelEnabled"
    },
    {
        id: "seo-optimizer",
        name: "All-in-one SEO",
        description: "Enhance your store's search engine visibility and dynamic meta tags.",
        fullDescription: "Auto-generate search-engine friendly titles and descriptions for your products. Boost your ranking on Google and Bing without manual effort.",
        features: [
            "Dynamic meta title templates",
            "Automatic meta description generation",
            "Social media OG tag optimization",
            "Lightweight and fast"
        ],
        guide: "1. Define your title template (e.g., {product_name} - {store_name}).\n2. Set a default meta description.\n3. Enable and let the plugin handle the rest.",
        faq: [
            { q: "Will this slow down my store?", a: "No, it's server-side rendered and extremely fast." },
            { q: "Can I override specific products?", a: "Currently, it follows the global template for all products." }
        ],
        author: "Qicmart Official",
        category: "Marketing",
        icon: Search,
        rating: 4.9,
        installs: "1.2k",
        price: "Free",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        statusKey: "isSeoEnabled"
    },
    {
        id: "google-reviews",
        name: "Google Reviews",
        description: "Display your business reviews directly on your store home page.",
        fullDescription: "Build social proof by showcasing your latest Google reviews. Customers are 70% more likely to buy when they see positive reviews.",
        features: [
            "Authentic Google review sync",
            "Beautiful star rating display",
            "Trust building layout",
            "Easy Place ID integration"
        ],
        guide: "1. Find your Google Place ID using the Google Maps Platform tool.\n2. Enter the ID in the settings.\n3. Your reviews will automatically appear on the storefront.",
        faq: [
            { q: "Can I filter bad reviews?", a: "It displays reviews as provided by the Google API." },
            { q: "How many reviews are shown?", a: "The latest 5 reviews are displayed by default." }
        ],
        author: "Google",
        category: "Trust",
        icon: Star,
        rating: 4.8,
        installs: "800",
        price: "Free",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        statusKey: "isGoogleReviewsEnabled"
    }
]

import { motion, AnimatePresence } from "framer-motion"

export default function PluginsPage() {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const dashboardType = searchParams.get("dashboardType") || "1"

    const [activeCategory, setActiveCategory] = useState("All")
    const [search, setSearch] = useState("")
    const [settings, setSettings] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [selectedPlugin, setSelectedPlugin] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("description")

    useEffect(() => {
        fetchSettings()
    }, [ownerId, dashboardType])

    const fetchSettings = async () => {
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
            console.error(e)
        }
        setLoading(false)
    }

    const handleInstall = async (plugin: any) => {
        if (!plugin.statusKey) return
        
        const newSettings = { ...settings, [plugin.statusKey]: true }
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
            
            if (res.ok) {
                await fetchSettings()
            } else {
                setSettings(settings)
                alert("Failed to install plugin")
            }
        } catch (e) {
            setSettings(settings)
            console.error(e)
            alert("An error occurred")
        }
    }

    const filteredPlugins = plugins.filter(p => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Plugin Marketplace</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[12px] sm:text-[14px] font-medium tracking-normal max-w-lg">Supercharge your digital storefront with powerful extensions and integrations.</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for plugins..." 
                        className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar lg:pb-0">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plugins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredPlugins.map((plugin) => {
                    const statusKey = plugin.statusKey
                    const idKey = plugin.id.replace(/-/g, '') + 'Id'
                    const isInstalled = statusKey ? (settings[statusKey] === true || (settings[idKey] && settings[idKey].length > 0)) : false
                    
                    return (
                        <div 
                            key={plugin.id} 
                            onClick={() => {setSelectedPlugin(plugin); setActiveTab("description")}}
                            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full active:scale-[0.98] cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-4 rounded-3xl ${plugin.bg} ${plugin.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                    <plugin.icon size={32} />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[10px] font-bold text-zinc-500">
                                    <Star size={12} fill="currentColor" className="text-amber-400" />
                                    {plugin.rating}
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{plugin.name}</h4>
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                                    {plugin.description}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-0.5 capitalize tracking-tight">Installs</span>
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{plugin.installs}+</span>
                                </div>
                                <div className="flex gap-2">
                                    {isInstalled ? (
                                        <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-semibold tracking-tight flex items-center gap-2">
                                            <Check size={14} />
                                            Installed
                                        </div>
                                    ) : (
                                        <PremiumButton 
                                            onClick={(e) => { e?.stopPropagation(); handleInstall(plugin) }}
                                            className="px-5 py-2.5"
                                            icon={ArrowRight}
                                            iconClassName="group-hover:translate-x-1 transition-transform"
                                        >
                                            Install now
                                        </PremiumButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Plugin Detail Modal */}
            <AnimatePresence>
                {selectedPlugin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPlugin(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] w-full max-w-4xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]"
                        >
                            {/* Sidebar */}
                            <div className="w-full md:w-[320px] bg-zinc-50 dark:bg-zinc-950 p-8 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className={`p-6 rounded-[32px] ${selectedPlugin.bg} ${selectedPlugin.color} shadow-xl mb-6`}>
                                    <selectedPlugin.icon size={64} />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{selectedPlugin.name}</h3>
                                <div className="text-xs font-bold text-zinc-400 mb-8 tracking-wider uppercase">By {selectedPlugin.author}</div>
                                
                                <div className="w-full space-y-4 mb-8">
                                    <div className="flex justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-xs font-bold text-zinc-400">Rating</span>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                            <Star size={12} fill="currentColor" className="text-amber-400" />
                                            {selectedPlugin.rating}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-xs font-bold text-zinc-400">Installs</span>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{selectedPlugin.installs}+</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-xs font-bold text-zinc-400">Price</span>
                                        <span className="text-xs font-bold text-emerald-500">{selectedPlugin.price}</span>
                                    </div>
                                </div>

                                {settings[selectedPlugin.statusKey] ? (
                                    <div className="w-full py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2">
                                        <Check size={18} />
                                        Already Installed
                                    </div>
                                ) : (
                                    <PremiumButton 
                                        onClick={() => handleInstall(selectedPlugin)}
                                        className="w-full py-4 text-sm"
                                        icon={Zap}
                                    >
                                        Install Plugin
                                    </PremiumButton>
                                )}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900">
                                <div className="flex items-center justify-between p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex gap-8">
                                        {["description", "guide", "faq"].map(tab => (
                                            <button 
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`text-xs font-bold uppercase tracking-widest pb-2 transition-all relative ${activeTab === tab ? "text-indigo-600" : "text-zinc-400 hover:text-zinc-600"}`}
                                            >
                                                {tab}
                                                {activeTab === tab && (
                                                    <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setSelectedPlugin(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all">
                                        <X size={24} className="text-zinc-400" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {activeTab === "description" && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                key="desc"
                                                className="space-y-8"
                                            >
                                                <div className="space-y-4">
                                                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Overview</h4>
                                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedPlugin.fullDescription}</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Key Features</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {selectedPlugin.features.map((f: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                                                <div className="mt-1 p-0.5 bg-emerald-500 rounded-full text-white">
                                                                    <Check size={10} />
                                                                </div>
                                                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{f}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === "guide" && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                key="guide"
                                                className="space-y-6"
                                            >
                                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Installation Guide</h4>
                                                <div className="space-y-6">
                                                    {selectedPlugin.guide.split('\n').map((step: string, i: number) => (
                                                        <div key={i} className="flex gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</div>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 pt-1.5 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === "faq" && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                key="faq"
                                                className="space-y-6"
                                            >
                                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Questions & Answers</h4>
                                                <div className="space-y-4">
                                                    {selectedPlugin.faq.map((item: any, i: number) => (
                                                        <div key={i} className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[28px] border border-zinc-100 dark:border-zinc-800 space-y-3">
                                                            <div className="text-sm font-bold text-zinc-900 dark:text-white">{item.q}</div>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{item.a}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {filteredPlugins.length === 0 && (
                <div className="py-32 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-300">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No plugins found</h3>
                    <button 
                        onClick={() => {setActiveCategory("All"); setSearch("")}}
                        className="mt-6 text-indigo-600 font-bold text-sm"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    )
}

function X({ size, className }: any) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    )
}

function Check({ size, className }: any) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
