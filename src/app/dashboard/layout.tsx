"use client"

import { ReactNode, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname as usePN, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut,
    Tag, FolderOpen, Sun, Moon, ChevronLeft, Menu, BarChart2, ExternalLink, Image as ImageIcon, Search, Zap, ShieldAlert, Layout, Globe, Star, CreditCard, ChevronDown, Ticket, Mail, PenTool, Truck, Palette, RotateCcw, MapPin, Puzzle, Blocks, ShoppingBag
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardStoreProvider, useDashboardStore } from "@/components/DashboardStoreProvider"
import { Notifications } from "@/components/dashboard/Notifications"
import PremiumButton from "@/components/dashboard/PremiumButton"
import DigitalLoader from "@/components/ui/DigitalLoader"
import AIGrowthGuru from "@/components/dashboard/AIGrowthGuru"
import { SessionManager } from "@/components/auth/SessionManager"

const navGroups = [
    {
        label: "Dashboard",
        key: "dashboard",
        icon: LayoutDashboard,
        href: "/dashboard"
    },
    {
        label: "Orders",
        key: "orders",
        icon: ShoppingCart,
        items: [
            { label: "All Orders", key: "allOrders", href: "/dashboard/orders", icon: ShoppingCart },
            { label: "Returns/Refunds", key: "returnsRefunds", href: "/dashboard/orders/returns", icon: RotateCcw },
        ]
    },
    {
        label: "Products",
        key: "products",
        icon: Package,
        items: [
            { label: "All Products", key: "allProducts", href: "/dashboard/products", icon: Package },
            { label: "Categories", key: "categories", href: "/dashboard/categories", icon: FolderOpen },
            { label: "Media Library", key: "mediaLibrary", href: "/dashboard/media", icon: ImageIcon },
        ]
    },
    {
        label: "Analytics",
        key: "analytics",
        icon: BarChart2,
        href: "/dashboard/analytics"
    },
    {
        label: "Store Design",
        key: "storeDesign",
        icon: Palette,
        items: [
            { label: "Themes & Layout", key: "themes", href: "/dashboard/themes", icon: Palette },
            { label: "Hero Banners", key: "heroBanners", href: "/dashboard/appearance/hero", icon: ImageIcon },
            { label: "Menu Manager", key: "menuManager", href: "/dashboard/menu", icon: Layout },
            { label: "Custom Pages", key: "customPages", href: "/dashboard/pages", icon: Layout },
            { label: "SEO Manager", key: "seoManager", href: "/dashboard/seo", icon: Globe },
        ]
    },
    {
        label: "Audience",
        key: "audience",
        icon: Users,
        items: [
            { label: "Customers", key: "customers", href: "/dashboard/customers", icon: Users },
            { label: "Newsletter", key: "newsletter", href: "/dashboard/newsletter", icon: Mail },
            { label: "Reviews", key: "reviews", href: "/dashboard/reviews", icon: Star },
        ]
    },
    {
        label: "Payouts",
        key: "payouts",
        icon: CreditCard,
        items: [
            { label: "Payments", key: "payments", href: "/dashboard/payment", icon: CreditCard },
            { label: "My Plan", key: "myPlan", href: "/dashboard/plans", icon: Zap },
        ]
    },
    {
        label: "Plugins",
        key: "plugins",
        icon: Blocks,
        items: [
            { label: "App Store", key: "allPlugins", href: "/dashboard/plugins", icon: ShoppingBag },
            { label: "Installed", key: "installed", href: "/dashboard/plugins/installed", icon: Package },
        ]
    },
    {
        label: "Settings",
        key: "settings",
        icon: Settings,
        href: "/dashboard/settings"
    }
]


export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<DigitalLoader />}>
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
    const { logo, name, subscription, slug, fontFamily, t, language } = store
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
        const path = href.split('?')[0]
        if (path === "/dashboard") {
            return pathname === "/dashboard" || pathname === "/dashboard/"
        }

        const isExact = pathname === path || pathname === path + "/"
        if (isExact) return true

        const isSubPath = pathname.startsWith(path + "/")
        if (!isSubPath) return false

        // Best match strategy: only mark as active if there isn't a more specific match in the navGroups
        const hasBetterMatch = navGroups.some(g => {
            if (g.href && g.href !== path && pathname.startsWith(g.href.split('?')[0])) return true
            return g.items?.some(i => i.href !== path && pathname.startsWith(i.href.split('?')[0]))
        })

        return !hasBetterMatch
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
            const hasActiveItem = group.href ? isActive(group.href) : (group.items?.some(item => isActive(item.href)) || false)
            const hasMatch = searchTerm && (
                t(group.key as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (group.items?.some(item => t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase())) || false)
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

    let bg = dark ? "bg-zinc-950" : "bg-white"
    let sidebar = dark ? "bg-zinc-950/80 backdrop-blur-3xl border-white/5 shadow-2xl" : "bg-white/95 backdrop-blur-3xl border-zinc-200 shadow-2xl"
    let text = dark ? "text-white" : "text-zinc-900"
    let subtext = "text-zinc-500"
    let navHover = dark ? "hover:bg-white/5 hover:text-white" : "hover:bg-zinc-100/50 hover:text-black"
    let activeClass = dark ? "bg-white/10 text-white border border-white/20" : "bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium"
    let inactiveClass = `${subtext} ${navHover} border border-transparent`
    let headerBg = dark ? "bg-zinc-950/60 border-white/5" : "bg-white/60 border-zinc-200"

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
                style={{ fontFamily: getFontFamily(fontFamily) }}
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
                                className={`shrink-0 p-2 rounded-xl border transition-all shadow-sm ${dark ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-white/30" : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-black hover:border-zinc-300"}`}
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder={t("quickSearch")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2 text-[12px] rounded-xl border transition-all outline-none ${dark
                                    ? "bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-white/30 focus:ring-4 focus:ring-white/5"
                                    : "bg-zinc-50 border-zinc-200 text-black focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5"
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
                    {navGroups.map((group) => {
                        const filteredItems = (group.items || []).filter(item =>
                            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.key && t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
                        )

                        const groupLabel = t(group.key as any);
                        const isExpanded = expandedGroups.includes(group.key);
                        const isGroupActive = group.href ? isActive(group.href) : group.items?.some(item => isActive(item.href));

                        if (searchTerm && !groupLabel.toLowerCase().includes(searchTerm.toLowerCase()) && !group.items?.some(item => t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()))) return null;

                        return (
                            <div key={group.key} className="space-y-1">
                                {sidebarOpen ? (
                                    group.href ? (
                                        <Link
                                            href={getTargetHref(group.href)}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-[14px] font-medium ${isActive(group.href) ? activeClass : inactiveClass}`}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <group.icon size={16} className={isActive(group.href) ? dark ? "text-white" : "text-zinc-900" : "text-zinc-500"} />
                                            </motion.div>
                                            <span>{groupLabel}</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => toggleGroup(group.key)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-[14px] font-medium ${isGroupActive ? dark ? "text-white" : "text-zinc-900" : "text-zinc-500 hover:text-zinc-400"} ${dark ? "hover:bg-white/5" : "hover:bg-zinc-100/50"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <group.icon size={16} className={isGroupActive ? dark ? "text-white" : "text-zinc-900" : "text-zinc-400"} />
                                                    </motion.div>
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
                                                        className="overflow-hidden space-y-0.5 ml-3 border-l border-zinc-800/50 pl-3"
                                                    >
                                                        {group.items?.map(({ label, key, href, icon: Icon, external }: any) => {
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
                                                                        className={`flex items-center ml-4 px-3 py-2 rounded-xl transition-all text-[13px] font-medium ${isActive(href) ? activeClass : inactiveClass}`}
                                                                    >
                                                                        <span>{displayLabel}</span>
                                                                    </Link>
                                                                </motion.div>
                                                            )
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        {group.href ? (
                                            <Link
                                                href={getTargetHref(group.href)}
                                                className={`p-2 rounded-xl transition-all ${isActive(group.href) ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                                                title={groupLabel}
                                            >
                                                <group.icon size={20} />
                                            </Link>
                                        ) : (
                                            <div className="flex items-center justify-center p-2 rounded-xl">
                                                <button
                                                    onClick={() => toggleGroup(group.key)}
                                                    className={`p-1.5 rounded-lg transition-all ${isGroupActive ? activeClass : inactiveClass}`}
                                                    title={groupLabel}
                                                >
                                                    <group.icon size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {navGroups.every(group => {
                        const groupLabel = t(group.key as any);
                        const hasMatchingItems = group.href ? groupLabel.toLowerCase().includes(searchTerm.toLowerCase()) : group.items?.some(item =>
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

                {/* Sidebar Footer / Upgrade Card */}
                <div className={`mt-auto ${sidebarOpen ? "px-4 py-6" : "px-2 pb-6"} border-t ${dark ? "border-white/5" : "border-zinc-200"}`}>
                    {sidebarOpen ? (
                        <>
                            <div className={`p-4 rounded-xl ${dark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200 shadow-sm"} relative overflow-hidden group`}>
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all duration-500" />

                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                            <Zap size={14} fill="currentColor" />
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">{subscription?.plan || "Free"} Plan</span>
                                    </div>

                                    <p className={`text-[10px] leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-500"} font-medium`}>
                                        Manage your store and grow your business. Pro features coming soon!
                                    </p>

                                    <PremiumButton
                                        href={getTargetHref("/dashboard/plans")}
                                        className="w-full"
                                        size="sm"
                                        icon={Zap}
                                    >
                                        Pro Coming Soon
                                    </PremiumButton>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={getTargetHref("/dashboard/plans")}
                                className={`p-2 rounded-xl transition-all ${dark ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" : "bg-purple-50 text-purple-600 hover:bg-purple-100"}`}
                                title="Upgrade Plan"
                            >
                                <Zap size={18} fill="currentColor" />
                            </Link>
                        </div>
                    )}
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
                        <h1 className="text-[16px] font-semibold tracking-tight italic sm:not-italic sm:normal-case">
                            {(() => {
                                const allItems = navGroups.flatMap(g => g.items || (g.href ? [g] : []))
                                const activeItem = allItems.find(n => n && isActive(n.href))
                                return activeItem?.key ? t(activeItem.key as any) : activeItem?.label || t("dashboard")
                            })()}
                        </h1>
                        {/* DEBUG DATA */}
                        <div className="hidden" id="debug-data" data-slug={slug} data-name={name} data-user-id={(session?.user as any)?.id} data-store-exists={!!slug}></div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className={`hidden md:inline-flex px-2.5 py-1 text-nowrap rounded-full text-[11px] font-semibold ${dark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-200 text-purple-700'}`}>
                            Standard Plan
                        </span>
                        {store.aiCredits !== undefined && (
                            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold border shadow-sm ${dark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                <Zap size={12} fill="currentColor" className="animate-pulse" />
                                <span className="hidden lg:inline">{store.aiCredits} AI Credits</span>
                                <span className="lg:hidden">{store.aiCredits}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Notifications ownerId={ownerId} />
                            <button
                                onClick={toggleDark}
                                className={`p-1.5 rounded-lg relative ${dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"} transition-all`}
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
                                    className={`px-2 py-1 text-[10px] font-medium rounded-lg border tracking-wide transition-all ${dark ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-indigo-400" : "bg-white border-zinc-200 text-zinc-400 hover:text-indigo-500"}`}
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
                {store.id && !pathname?.includes('/dashboard/products/') && <AIGrowthGuru storeId={store.id} />}
                <SessionManager />
            </main>
        </div>
    )
}
