"use client"

import { ReactNode, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname as usePN, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut,
    Tag, FolderOpen, Sun, Moon, ChevronLeft, Menu, BarChart2, ExternalLink, Image as ImageIcon, Search, Zap, ShieldAlert, Layout, Globe, Star, CreditCard, ChevronDown, Ticket, Mail, PenTool
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardStoreProvider, useDashboardStore } from "@/components/DashboardStoreProvider"
import { Notifications } from "@/components/dashboard/Notifications"

const navGroups = [
    {
        label: "Dashboard & Reports",
        key: "dashboardAndReports",
        icon: LayoutDashboard,
        items: [
            { label: "Overview", key: "overview", href: "/dashboard", icon: LayoutDashboard },
            { label: "Analytics", key: "analytics", href: "/dashboard/analytics", icon: BarChart2 },
        ]
    },
    {
        label: "Shop Management",
        key: "shopManagement",
        icon: Package,
        items: [
            { label: "Products", key: "products", href: "/dashboard/products", icon: Package },
            { label: "Categories", key: "categories", href: "/dashboard/categories", icon: FolderOpen },
            { label: "Orders", key: "orders", href: "/dashboard/orders", icon: ShoppingCart },
            { label: "Customers", key: "customers", href: "/dashboard/customers", icon: Users },
        ]
    },
    {
        label: "Marketing & Growth",
        key: "marketingAndGrowth",
        icon: Ticket,
        items: [
            { label: "Coupons", key: "coupons", href: "/dashboard/coupons", icon: Ticket },
            { label: "Newsletter", key: "newsletter", href: "/dashboard/newsletter", icon: Mail },
        ]
    },
    {
        label: "SEO & Content",
        key: "seoAndContent",
        icon: PenTool,
        items: [
            { label: "Blogs/Articles", key: "blogs", href: "/dashboard/blogs", icon: PenTool },
            { label: "Menu Manager", key: "menuManager", href: "/dashboard/menu", icon: Layout },
            { label: "Media Library", key: "mediaLibrary", href: "/dashboard/media", icon: ImageIcon },
            { label: "Reviews", key: "reviews", href: "/dashboard/reviews", icon: Star },
            { label: "SEO Manager", key: "seoManager", href: "/dashboard/seo", icon: Search },
            { label: "Custom Pages", key: "customPages", href: "/dashboard/pages", icon: Layout },
        ]
    },
    {
        label: "Finance & Plan",
        key: "financeAndPlan",
        icon: CreditCard,
        items: [
            { label: "Payments", key: "payments", href: "/dashboard/payment", icon: CreditCard },
            { label: "My Plan", key: "myPlan", href: "/dashboard/plans", icon: Zap },
        ]
    }
]

const bottomNavItems = [
    { label: "Store Settings", key: "storeSettings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
<Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-semibold tracking-wide animate-pulse">Initializing Dashboard...</div>}>
            <DashboardStoreProvider dashboardType="1">
                <DashboardContent>{children}</DashboardContent>
            </DashboardStoreProvider>
        </Suspense>
    )
}

function DashboardContent({ children }: { children: ReactNode }) {
    const pathname = usePN()
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")?.trim()
    const { data: session } = useSession()
    const store = useDashboardStore()
    const { logo, name, subscription, slug, t } = store
    const [dark, setDark] = useState(true)
    const [isAuto, setIsAuto] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])
    const [hostname, setHostname] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHostname(window.location.host)
        }
    }, [])

    const isLocal = hostname.includes('localhost')
    const storeUrl = isLocal 
        ? `http://${slug}.localhost:3000` 
        : `/s/${slug}`
 

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours()
            const isNight = hour < 6 || hour >= 18
            const saved = localStorage.getItem("dashboard-dark")
            
            if (saved !== null) {
                setDark(saved === "true")
                setIsAuto(false)
            } else {
                setDark(isNight)
                setIsAuto(true)
            }
        }

        updateTheme()
        
        const interval = setInterval(() => {
            if (localStorage.getItem("dashboard-dark") === null) {
                const hour = new Date().getHours()
                const isNight = hour < 6 || hour >= 18
                setDark(isNight)
            }
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    const toggleDark = () => {
        const next = !dark
        setDark(next)
        setIsAuto(false)
        localStorage.setItem("dashboard-dark", String(next))
    }

    const resetToAuto = () => {
        localStorage.removeItem("dashboard-dark")
        const hour = new Date().getHours()
        setDark(hour < 6 || hour >= 18)
        setIsAuto(true)
    }

    const isActive = (href: string) => {
        // Exact match for dashboard root, but allow for trailing slash
        if (href === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/dashboard/"
        }
        return pathname.startsWith(href)
    }

    const getTargetHref = (href: string) => {
        if (!ownerId) return href
        const connector = href.includes("?") ? "&" : "?"
        return `${href}${connector}ownerId=${ownerId}`
    }

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev =>
            prev.includes(key) ? [] : [key]
        )
    }

    // Auto-expand groups on mount if they contain active item OR when searching
    useEffect(() => {
        const groupsToExpand: string[] = []
        navGroups.forEach(group => {
            const hasActiveItem = group.items.some(item => isActive(item.href))
            const hasMatch = searchTerm && (
                t(group.key as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.items.some(item => t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
            )
            if (hasActiveItem || hasMatch) {
                groupsToExpand.push(group.key)
            }
        })
        if (searchTerm) {
            setExpandedGroups(prev => Array.from(new Set([...prev, ...groupsToExpand])))
        } else if (groupsToExpand.length > 0) {
            // Respect accordion: only one expanded
            setExpandedGroups([groupsToExpand[0]])
        } else {
            setExpandedGroups([]) // Default all closed if no active item
        }
    }, [pathname, searchTerm])

    const bg = dark ? "bg-zinc-950" : "bg-white"
    const sidebar = dark ? "bg-zinc-950/80 backdrop-blur-3xl border-white/5 shadow-2xl" : "bg-white/95 backdrop-blur-3xl border-zinc-200 shadow-2xl"
    const text = dark ? "text-white" : "text-zinc-900"
    const subtext = dark ? "text-zinc-500" : "text-zinc-500"
    const navHover = dark ? "hover:bg-white/5 hover:text-white" : "hover:bg-zinc-100/50 hover:text-black"
    const activeClass = dark ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)] border border-indigo-500/20" : "bg-indigo-100/80 text-indigo-700 border border-indigo-200 shadow-sm"
    const inactiveClass = dark ? `${subtext} ${navHover} border border-transparent` : `${subtext} ${navHover} border border-transparent`
    const headerBg = dark ? "bg-zinc-950/60 border-white/5" : "bg-white/60 border-zinc-200"

    const getFontFamily = (font: string) => {
        switch (font) {
            case "Poppins": return "var(--font-poppins)";
            case "Outfit": return "var(--font-outfit)";
            case "Montserrat": return "var(--font-montserrat)";
            default: return "var(--font-inter)";
        }
    }

    return (
        <div className={`flex h-screen ${bg} ${text} overflow-hidden ${dark ? "dark" : ""}`}>
            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity border-none"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: sidebarOpen ? 240 : 64 }}
                className={`
                    fixed inset-y-0 left-0 z-50 lg:static lg:z-20
                    ${mobileMenuOpen ? "translate-x-0 w-[240px]" : "-translate-x-full lg:translate-x-0"}
                    flex-shrink-0 ${sidebar} border-r flex flex-col transition-transform duration-300 ease-in-out
                `}
            >
                {/* Logo */}
                <div className={`h-16 flex items-center ${sidebarOpen ? "px-5 justify-between" : "justify-center"} border-b ${dark ? "border-zinc-800" : "border-slate-200"}`}>
                    {sidebarOpen && (
                        <div className="flex items-center gap-4 pr-2 min-w-0">
                            <div className="flex-1 min-w-0 flex items-center">
                                {logo ? (
                                    <img src={logo} alt={name} className="h-8 w-auto max-w-[130px] object-contain" />
                                ) : (
                                    <span className="text-base font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent truncate flex-1 block text-nowrap">
                                        {name}
                                    </span>
                                )}
                            </div>
                            <Link 
                                href={storeUrl} 
                                target="_blank"
                                className={`shrink-0 p-2 rounded-xl border transition-all shadow-sm ${dark ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30" : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30"}`}
                                title="View Store"
                            >
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-zinc-800" : "hover:bg-slate-100"} transition-colors shrink-0`}>
                        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                {/* Sidebar Search */}
                {sidebarOpen && (
                    <div className="px-4 py-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder={t("quickSearch")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2 text-[12px] rounded-xl border transition-all outline-none ${dark
                                    ? "bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5"
                                    : "bg-zinc-50 border-zinc-200 text-black focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5"
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
                    {navGroups.map((group) => {
                        const filteredItems = group.items.filter(item =>
                            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.key && t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        
                        const groupLabel = t(group.key as any);
                        const isExpanded = expandedGroups.includes(group.key);
                        const hasMatchingItems = filteredItems.length > 0;
                        const isGroupActive = group.items.some(item => isActive(item.href));

                        if (searchTerm && !hasMatchingItems && !groupLabel.toLowerCase().includes(searchTerm.toLowerCase())) return null;

                        return (
                            <div key={group.key} className="space-y-1">
                                {sidebarOpen ? (
                                    <>
                                        <button
                                            onClick={() => toggleGroup(group.key)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-[12px] font-bold tracking-wider ${isGroupActive ? "text-indigo-500" : "text-zinc-500 hover:text-zinc-400"} ${dark ? "hover:bg-white/5" : "hover:bg-zinc-100/50"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <group.icon size={16} className={isGroupActive ? "text-indigo-500" : "text-zinc-400"} />
                                                <span>{groupLabel}</span>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown size={14} />
                                            </motion.div>
                                        </button>
                                        
                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-0.5 ml-4 border-l border-zinc-800/50 pl-2"
                                                >
                                                    {filteredItems.map(({ label, key, href, icon: Icon, external }: any) => {
                                                        const targetHref = getTargetHref(href)
                                                        const displayLabel = key ? t(key as any) : label;
                                                        return (
                                                            <motion.div
                                                                key={href}
                                                                whileHover={{ x: 4 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <Link
                                                                    href={targetHref}
                                                                    target={external ? "_blank" : undefined}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className={`flex items-center px-3 py-2 rounded-xl transition-all text-[13px] font-medium gap-3 ${isActive(href) ? activeClass : inactiveClass}`}
                                                                >
                                                                    <Icon className="w-4 h-4 shrink-0" />
                                                                    <span>{displayLabel}</span>
                                                                </Link>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`p-2 rounded-xl ${isGroupActive ? "text-indigo-500 bg-indigo-500/10" : "text-zinc-500"}`} title={groupLabel}>
                                            <group.icon size={20} />
                                        </div>
                                        {group.items.map(item => {
                                            if (searchTerm && !item.label.toLowerCase().includes(searchTerm.toLowerCase()) && !t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase())) return null;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={getTargetHref(item.href)}
                                                    className={`p-2 rounded-lg transition-all ${isActive(item.href) ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-500 hover:text-white"}`}
                                                    title={t(item.key as any)}
                                                >
                                                    <item.icon size={16} />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {navGroups.every(group => {
                        const groupLabel = t(group.key as any);
                        const hasMatchingItems = group.items.some(item =>
                            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.key && t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        return searchTerm && !hasMatchingItems && !groupLabel.toLowerCase().includes(searchTerm.toLowerCase());
                    }) && searchTerm && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-[10px] font-semibold text-zinc-500 italic">{t("noMatches")}</p>
                        </div>
                    )}
                </nav>

                {/* Bottom Items */}
                <div className={`pb-3 px-2 border-t ${dark ? "border-zinc-800" : "border-slate-200"} pt-3 space-y-0.5`}>
                    {bottomNavItems.map(({ label, key, href, icon: Icon, external }: any) => {
                        const targetHref = getTargetHref(href)
                        const displayLabel = key ? t(key as any) : label;
                        return (
                            <Link
                                key={label}
                                href={targetHref}
                                target={external ? "_blank" : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center ${sidebarOpen ? "px-3" : "justify-center px-2"} py-2.5 rounded-xl transition-all text-[14px] font-medium gap-3 ${isActive(href) ? activeClass : inactiveClass}`}
                                title={!sidebarOpen ? displayLabel : undefined}
                            >
                                <Icon size={18} className="shrink-0" />
                                {sidebarOpen && <span>{displayLabel}</span>}
                            </Link>
                        )
                    })}

                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className={`w-full flex items-center ${sidebarOpen ? "px-3" : "justify-center px-2"} py-2.5 rounded-xl transition-all text-[14px] font-medium gap-3 text-red-400 hover:bg-red-500/10`}
                        title={!sidebarOpen ? t("logout") : undefined}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {sidebarOpen && <span>{t("logout")}</span>}
                    </button>
                </div>
            </motion.aside>

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className={`h-16 flex items-center justify-between px-4 sm:px-6 ${headerBg} backdrop-blur-sm border-b gap-4 sticky top-0 z-30`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className={`lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 ${dark ? "bg-zinc-900" : "bg-white"}`}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-[16px] font-semibold tracking-tight capitalize italic sm:not-italic sm:normal-case">
                            {(() => {
                                const allItems = navGroups.flatMap(g => g.items);
                                const activeItem = allItems.find(n => isActive(n.href)) || bottomNavItems.find(n => isActive(n.href));
                                return activeItem?.key ? t(activeItem.key as any) : activeItem?.label || t("dashboard");
                            })()}
                        </h1>
                        {/* DEBUG DATA */}
                        <div className="hidden" id="debug-data" data-slug={slug} data-name={name} data-user-id={(session?.user as any)?.id} data-store-exists={!!slug}></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-nowrap rounded-full text-[12px] font-semibold ${subscription?.plan === 'Pro' ? dark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700' : dark ? 'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400' : 'bg-zinc-100 border border-zinc-200 text-zinc-600'}`}>
                            {subscription?.plan || "Normal"} Plan
                        </span>
                        <Notifications ownerId={ownerId} />
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={toggleDark}
                                className={`p-2 rounded-xl relative ${dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"} transition-all`}
                                title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {dark ? <Sun size={16} /> : <Moon size={16} />}
                                {isAuto && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                )}
                            </button>
                            {!isAuto && (
                                <button
                                    onClick={resetToAuto}
                                    className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all ${dark ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-indigo-400" : "bg-white border-zinc-200 text-zinc-400 hover:text-indigo-500"}`}
                                    title="Reset to Automatic Theme"
                                >
                                    Auto
                                </button>
                            )}
                        </div>
                        <Link
                            href={getTargetHref("/dashboard/profile")}
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white shadow hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                        >
                            {store.userImage ? (
                                <img src={store.userImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                session?.user?.name?.[0] || session?.user?.email?.[0] || "O"
                            )}
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <div className={`flex-1 overflow-auto p-6 ${dark ? "" : ""}`} data-dark={dark}>
                    {store.isAdminPanelDisabled ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20 shadow-xl shadow-rose-500/10 ring-4 ring-rose-500/5">
                                <ShieldAlert size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-3">Admin Access Suspended</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
                                Your access to the store dashboard has been restricted by the platform administration. Please contact support to resolve this issue.
                            </p>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-xs capitalize shadow-2xl active:scale-95 transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </div>
    )
}
