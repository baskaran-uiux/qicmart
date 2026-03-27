"use client"

import { ReactNode, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname as usePN, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut,
    Tag, FolderOpen, Sun, Moon, ChevronLeft, Menu, BarChart2, ExternalLink, Image as ImageIcon, Search, Zap, ShieldAlert, Layout, Globe, Star, CreditCard, ChevronDown, Ticket, Mail, PenTool,
    Home, ClipboardList, Truck, LayoutGrid, BarChart3, Wallet, Percent, Palette, Gem, Minus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardStoreProvider, useDashboardStore } from "@/components/DashboardStoreProvider"
import { Notifications } from "@/components/dashboard/Notifications"

const navItems = [
    { label: "Dashboard", key: "dashboard", href: "/dashboard", icon: Home },
    { 
        label: "Orders", 
        key: "orders", 
        href: "/dashboard/orders", 
        icon: ClipboardList,
        subItems: [
            { label: "All orders", key: "allOrders", href: "/dashboard/orders" },
            { label: "Abandoned", key: "abandoned", href: "/dashboard/orders/abandoned" },
        ]
    },
    { label: "Delivery", key: "delivery", href: "/dashboard/delivery", icon: Truck },
    { label: "Products", key: "products", href: "/dashboard/products", icon: LayoutGrid },
    { label: "Analytics", key: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Payouts", key: "payouts", href: "/dashboard/payment", icon: Wallet },
    { label: "Discounts", key: "discounts", href: "/dashboard/coupons", icon: Percent },
    { label: "Audience", key: "audience", href: "/dashboard/customers", icon: Users },
    { label: "Appearance", key: "appearance", href: "/dashboard/appearance", icon: Palette },
    { label: "Plugins", key: "plugins", href: "/dashboard/plans", icon: Zap },
    { label: "Settings", key: "settings", href: "/dashboard/settings", icon: Settings },
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
    const [expandedItems, setExpandedItems] = useState<string[]>(["orders"])
 

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

    const toggleItem = (key: string) => {
        setExpandedItems(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    // Auto-expand groups on mount if they contain active item OR when searching
    useEffect(() => {
        const itemsToExpand: string[] = []
        navItems.forEach(item => {
            const hasActiveSub = item.subItems?.some(s => isActive(s.href))
            const hasMatch = searchTerm && (
                t(item.key as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.subItems?.some(s => t(s.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
            )
            if (hasActiveSub || hasMatch) {
                itemsToExpand.push(item.key)
            }
        })
        setExpandedItems(prev => Array.from(new Set([...prev, ...itemsToExpand])))
    }, [pathname, searchTerm])

    const bg = dark ? "bg-zinc-950" : "bg-white"
    const sidebar = dark ? "bg-zinc-950/80 backdrop-blur-3xl border-white/5 shadow-2xl" : "bg-white/95 backdrop-blur-3xl border-zinc-200 shadow-2xl"
    const text = dark ? "text-white" : "text-zinc-900"
    const subtext = dark ? "text-zinc-500" : "text-zinc-500"
    const navHover = dark ? "hover:bg-white/5 hover:text-white" : "hover:bg-zinc-100/50 hover:text-black"
    const headerBg = dark ? "bg-zinc-950/60 border-white/5" : "bg-white/60 border-zinc-200"

    function UpgradeCard({ dark, sidebarOpen }: { dark: boolean, sidebarOpen: boolean }) {
        if (!sidebarOpen) return (
            <div className="flex justify-center py-4">
                <div className={`p-2 rounded-xl ${dark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                    <Gem size={20} />
                </div>
            </div>
        )
        return (
            <div className={`mx-2 mt-4 p-4 rounded-2xl border ${dark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"} relative overflow-hidden group`}>
                <div className="relative z-10 flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${dark ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50 text-emerald-600"} shadow-sm transition-transform group-hover:scale-110 duration-500`}>
                        <Gem size={18} />
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold">Upgrade plan</h4>
                        <p className="text-[11px] text-zinc-500 font-medium">Get extra benefits</p>
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12">
                    <Gem size={80} />
                </div>
            </div>
        )
    }

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
                        <div className="flex items-center gap-2 overflow-hidden">
                            {logo ? (
                                <img src={logo} alt={name} className="h-8 w-auto object-contain" />
                            ) : (
                                <span className="text-base font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent truncate">
                                    {name}
                                </span>
                            )}
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
                    {navItems.map((item) => {
                        const hasSubItems = !!item.subItems
                        const filteredSubs = item.subItems?.filter(s =>
                            s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.key && t(s.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        
                        const label = t(item.key as any);
                        const isExpanded = expandedItems.includes(item.key);
                        const isMainActive = isActive(item.href);
                        const hasActiveSub = item.subItems?.some(s => isActive(s.href));

                        if (searchTerm && !label.toLowerCase().includes(searchTerm.toLowerCase()) && (!filteredSubs || filteredSubs.length === 0)) return null;

                        return (
                            <div key={item.key} className="space-y-1">
                                {sidebarOpen ? (
                                    <>
                                        {hasSubItems ? (
                                            <button
                                                onClick={() => toggleItem(item.key)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-[14px] font-medium ${hasActiveSub ? "text-white bg-white/5" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={18} className={hasActiveSub ? "text-white" : "text-zinc-500"} />
                                                    <span className="font-bold">{label}</span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown size={14} />
                                                </motion.div>
                                            </button>
                                        ) : (
                                            <Link
                                                href={getTargetHref(item.href)}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center px-3 py-2.5 rounded-xl transition-all text-[14px] font-medium gap-3 ${isMainActive ? "text-white bg-white/5" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
                                            >
                                                <item.icon size={18} className={isMainActive ? "text-white" : "text-zinc-500"} />
                                                <span className="font-bold">{label}</span>
                                            </Link>
                                        )}
                                        
                                        <AnimatePresence initial={false}>
                                            {hasSubItems && isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-1 mt-1 ml-9"
                                                >
                                                    {(filteredSubs || item.subItems)?.map((sub: any) => {
                                                        const targetHref = getTargetHref(sub.href)
                                                        const displayLabel = sub.key ? t(sub.key as any) : sub.label;
                                                        const isSubActive = isActive(sub.href);
                                                        return (
                                                            <Link
                                                                key={sub.href}
                                                                href={targetHref}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className={`flex items-center px-3 py-1.5 rounded-lg transition-all text-[13px] font-medium ${isSubActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                                            >
                                                                <span>{displayLabel}</span>
                                                            </Link>
                                                        )
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Link
                                            href={getTargetHref(item.href)}
                                            className={`p-2 rounded-xl transition-all ${isMainActive || hasActiveSub ? "text-white bg-white/10" : "text-zinc-500 hover:text-white"}`}
                                            title={label}
                                        >
                                            <item.icon size={20} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {navItems.every(item => {
                        const label = t(item.key as any);
                        const hasMatchingSubs = item.subItems?.some(s =>
                            s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (s.key && t(s.key as any).toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        return searchTerm && !hasMatchingSubs && !label.toLowerCase().includes(searchTerm.toLowerCase());
                    }) && searchTerm && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-[10px] font-semibold text-zinc-500 italic">{t("noMatches")}</p>
                        </div>
                    )}
                </nav>

                {/* Bottom Items */}
                <div className={`pb-3 border-t ${dark ? "border-zinc-800" : "border-slate-200"} pt-1`}>
                    <UpgradeCard dark={dark} sidebarOpen={sidebarOpen} />
                    <div className="px-2 mt-2 space-y-0.5">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={`w-full flex items-center ${sidebarOpen ? "px-3" : "justify-center px-2"} py-2.5 rounded-xl transition-all text-[14px] font-medium gap-3 text-red-400 hover:bg-red-500/10`}
                            title={!sidebarOpen ? t("logout") : undefined}
                        >
                            <LogOut size={18} className="shrink-0" />
                            {sidebarOpen && <span>{t("logout")}</span>}
                        </button>
                    </div>
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
                                const allItems = navItems.flatMap(item => item.subItems ? [item, ...item.subItems] : [item]);
                                const activeItem = allItems.find(n => isActive(n.href));
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
