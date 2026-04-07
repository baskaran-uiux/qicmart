"use client"

import { ReactNode, useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Script from "next/script"
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown, Home, ShoppingBag, Loader2, Instagram, Facebook, Twitter, Linkedin, Youtube, Lock, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { CartProvider, useCart } from "@/context/CartContext"
import { WishlistProvider, useWishlist } from "@/context/WishlistContext"
import { Providers } from "@/components/Providers"
import { LanguageProvider, useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "./utils"
import dynamic from "next/dynamic"
import Image from "next/image"

const CouponPopup = dynamic(() => import("@/components/storefront/CouponPopup"), { ssr: false })
const AIChatbot = dynamic(() => import("@/components/storefront/AIChatbot"), { ssr: false })

interface StoreCategory {
    id: string
    name: string
    slug: string
}

interface StoreInfo {
    id: string
    name: string
    logo?: string | null
    description?: string | null
    currency: string
    themeConfig?: string | null
    planName?: string
}

interface CustomPage {
    id: string
    title: string
    slug: string
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ storeInfo, slug, categories, version, scrolled, announcementHeight = 0 }: { storeInfo: StoreInfo; slug: string; categories: StoreCategory[]; version: number; scrolled: boolean; announcementHeight?: number }) {
    const router = useRouter()
    const { t } = useLanguage()
    const { totalItems } = useCart()
    const { totalItems: wishlistCount } = useWishlist()
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [openMobileSub, setOpenMobileSub] = useState<string | null>(null)

    const themeConfig = storeInfo.themeConfig ? JSON.parse(storeInfo.themeConfig) : {}
    const storeTheme = themeConfig.storeTheme || "modern"
    const menuAlignment = themeConfig.menuAlignment || "left"
    const headerStyle = themeConfig.headerStyle || "flat"
    const layoutStyle = storeTheme === 'nextgen' ? 'nextgen' : (themeConfig.layoutStyle || "default")
    const menuType = themeConfig.menuType || "top"
    const menuItems = themeConfig.menuItems || []
    const visibleItems = menuItems.filter((i: any) => i.isVisible)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    const formatHref = (href: string) => {
        if (!href) return "#"
        if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href
        if (href.startsWith("/s/")) return href
        // If we're already on a subdomain matching the slug, we could potentially use relative paths,
        // but for robustness across localhost/s/[slug] and subdomains, we'll keep the /s/[slug] prefix
        // as the middleware is configured to handle it correctly.
        return `/s/${slug}${href.startsWith("/") ? href : `/${href}`}`
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(formatHref(`/products?q=${encodeURIComponent(searchQuery.trim())}`))
            setSearchOpen(false)
            setSearchQuery("")
        }
    }

    const DesktopMenuRecursive = ({ items }: { items: any[] }) => (
        <div className="grid grid-cols-4 gap-x-12 gap-y-10">
            {items.filter((i: any) => i.isVisible).map((item: any) => (
                <div key={item.id} className="space-y-6 text-left">
                    <Link 
                        href={formatHref(item.href)}
                        className="text-[12px] font-bold text-black hover:text-[var(--primary-color)] transition-colors block"
                    >
                        {item.label}
                    </Link>
                    {item.children && item.children.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {item.children.filter((c: any) => c.isVisible).map((child: any) => (
                                <Link 
                                    key={child.id} 
                                    href={formatHref(child.href)} 
                                    className="text-[11px] font-medium text-zinc-500 hover:text-black transition-colors"
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )



    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Animated Placeholder Logic (Flipkart-style)
    const [animatedPlaceholder, setAnimatedPlaceholder] = useState("")
    const placeholders = ["Search for shoes...", "Search for premium watches...", "Search for stylish bags...", "Search for latest shirts...", "Search for electronics..."]
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const currentWord = placeholders[placeholderIndex]
        const typingSpeed = isDeleting ? 50 : 100
        const pauseTime = isDeleting ? 50 : 2000

        const timeout = setTimeout(() => {
            if (!isDeleting && charIndex < currentWord.length) {
                setAnimatedPlaceholder(currentWord.substring(0, charIndex + 1))
                setCharIndex(prev => prev + 1)
            } else if (isDeleting && charIndex > 0) {
                setAnimatedPlaceholder(currentWord.substring(0, charIndex - 1))
                setCharIndex(prev => prev - 1)
            } else if (!isDeleting && charIndex === currentWord.length) {
                setTimeout(() => setIsDeleting(true), pauseTime)
            } else if (isDeleting && charIndex === 0) {
                setIsDeleting(false)
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
            }
        }, typingSpeed)

        return () => clearTimeout(timeout)
    }, [charIndex, isDeleting, placeholderIndex])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true)
                fetch(`/api/products?storeId=${storeInfo.id}&q=${encodeURIComponent(searchQuery.trim())}&take=6`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setSearchResults(data.data)
                        }
                    })
                    .catch(err => console.error("Search error:", err))
                    .finally(() => setIsSearching(false))
            } else {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, storeInfo.id])

    const isGlass = storeTheme === 'glass'
    const isAura = storeTheme === 'aura'
    const isSports = storeTheme === 'sports'
    const isHomePage = pathname === `/s/${slug}` || pathname === `/s/${slug}/`
    const shouldFloat = isSports

    return (
        <motion.header 
            initial={false}
            animate={{
                width: isSports ? (isMobile ? "94%" : "88%") : "100%",
                y: announcementHeight + (isSports ? (isMobile ? 12 : 20) : 0),
                borderRadius: isSports ? (isMobile ? 24 : 40) : (scrolled ? 0 : 0),
                backgroundColor: isAura 
                    ? (scrolled ? "rgba(9,9,11,0.95)" : "transparent") 
                    : (scrolled ? "rgba(255,255,255,1)" : "rgba(255,255,255,1)"),
                backdropFilter: isSports || scrolled ? "blur(20px)" : "blur(0px)",
                borderBottom: scrolled || !isAura ? "1px solid rgba(0,0,0,0.05)" : "none",
                boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.05)" : "none",
                left: "50%",
                x: "-50%"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 z-50 transition-all duration-700`}>
                <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {menuType === 'side' && (
                            <button onClick={() => setIsMenuOpen(true)} className={`p-2 transition-colors lg:flex items-center ${isAura ? 'text-white hover:text-white/80' : isSports ? (isHomePage && !scrolled ? 'text-white hover:text-white/80' : 'text-zinc-900 hover:text-black') : 'text-zinc-500 hover:text-black'}`}>
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <div className="flex-shrink-0">
                            <Link href={`/s/${slug}`} className="group flex items-center">
                                <div className={`h-10 sm:h-12 w-32 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden`}>
                                    {storeInfo?.logo ? (
                                        <Image 
                                            src={`${storeInfo.logo}${storeInfo.logo.includes('?') ? '&' : '?'}v=${version}`} 
                                            alt={storeInfo.name} 
                                            fill
                                            className={`object-contain ${isAura ? 'brightness-0 invert' : ''}`} 
                                            sizes="128px"
                                            priority
                                        />
                                    ) : (
                                        <span className={`text-xl font-black tracking-tighter italic uppercase ${isAura ? 'text-white' : isSports ? (isHomePage && !scrolled ? 'text-white' : 'text-zinc-900') : 'text-zinc-900'}`}>{storeInfo?.name || "Store"}</span>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Row 1 Middle: Search Bar (for Nextgen/Modern) */}
                    <div className="hidden lg:flex flex-1 max-w-xl mx-4">
                        <div className="w-full relative">
                            <form onSubmit={handleSearch} className="relative group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/search:text-black transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder={animatedPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-2.5 bg-zinc-100 border-zinc-200 text-zinc-900 rounded-full text-[11px] font-semibold focus:ring-4 focus:ring-black/5 transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        type="button" 
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-black transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </form>
                            
                            {/* In-bar Search Results */}
                            <AnimatePresence>
                                {searchQuery.trim().length >= 2 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-100 rounded-[32px] shadow-2xl overflow-hidden z-[101] p-2"
                                    >
                                        <div className="p-4 border-b border-zinc-50">
                                            <p className="text-[10px] font-bold text-zinc-400">Search results</p>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                                            {isSearching ? (
                                                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
                                                    <p className="text-[10px] font-bold italic">Looking for products...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <>
                                                    {searchResults.map((p) => (
                                                        <Link 
                                                            key={p.id} 
                                                            href={`/s/${slug}/products/${p.slug}`} 
                                                            onClick={() => setSearchQuery("")}
                                                            className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl group transition-all"
                                                        >
                                                            <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                                                                <img 
                                                                    src={JSON.parse(p.images)[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'} 
                                                                     alt={p.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-bold text-zinc-900 truncate tracking-tight">{p.name}</p>
                                                                <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{formatPrice(p.price, storeInfo.currency)}</p>
                                                            </div>
                                                            <div className="p-2 bg-zinc-100 text-zinc-400 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                                                                <ChevronDown className="w-3 h-3 -rotate-90" />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                    <Link 
                                                        href={`/s/${slug}/products?q=${encodeURIComponent(searchQuery)}`}
                                                        onClick={() => setSearchQuery("")}
                                                        className="block py-4 text-center text-[10px] font-bold text-zinc-400 hover:text-[var(--primary-color)] transition-colors border-t border-zinc-50 mt-2"
                                                    >
                                                        View all results →
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Search className="w-5 h-5 text-zinc-300" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No products found</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Hide search trigger logic if search is already in Row 1 */}
                        {(layoutStyle !== 'nextgen' && !isSports) && (
                            <div className={`relative items-center ${isSports ? 'flex' : 'hidden lg:flex'}`}>
                                {searchOpen ? (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center z-50">
                                        <motion.form
                                            initial={{ opacity: 0, x: 20, width: 0 }}
                                            animate={{ opacity: 1, x: 0, width: "auto" }}
                                            exit={{ opacity: 0, x: 20, width: 0 }}
                                            onSubmit={handleSearch}
                                            className="relative flex items-center"
                                        >
                                            <input
                                                autoFocus={!isSports}
                                                type="text"
                                                placeholder={animatedPlaceholder}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className={`w-32 sm:w-48 lg:w-80 px-4 sm:px-6 py-2 sm:py-3 border rounded-full text-[10px] sm:text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-[var(--primary-color)]/20 transition-all outline-none ${isAura ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-white/40' : isSports ? (isHomePage && !scrolled ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60' : 'bg-zinc-100 border-zinc-200 text-zinc-900') : 'bg-zinc-100 border-zinc-200 text-zinc-900'}`}
                                            />
                                            {isSearching ? (
                                                <Loader2 className="absolute right-4 w-3 h-3 animate-spin text-zinc-400" />
                                            ) : searchQuery && (
                                                <button type="button" onClick={() => setSearchQuery("")} className="absolute right-4 text-zinc-400 hover:text-black transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                            {!isSports && (
                                                <button type="button" onClick={() => setSearchOpen(false)} className={`ml-2 p-2 border rounded-full shadow-sm transition-colors ${isAura ? 'bg-zinc-900 border-zinc-800 text-white/40 hover:text-white' : isSports ? (isHomePage && !scrolled ? 'bg-zinc-900 border-zinc-800 text-white/40 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-200') : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'}`}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </motion.form>
                                    </div>
                                ) : (
                                    <button onClick={() => setSearchOpen(true)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAura ? 'text-white hover:bg-white/10' : isSports ? (isHomePage && !scrolled ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-100') : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                                        <Search className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        <Link href={`/s/${slug}/wishlist`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${isAura ? 'text-white hover:bg-white/10' : isSports ? (isHomePage && !scrolled ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-100') : 'text-zinc-500 hover:text-rose-500 hover:bg-zinc-50'}`}>
                            <Heart className="w-5 h-5" />
                            <AnimatePresence>
                                {wishlistCount > 0 && (
                                    <motion.span
                                        key={wishlistCount}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none ring-2 ring-white"
                                    >
                                        {wishlistCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                        <Link href={`/s/${slug}/cart`} className={`hidden lg:flex w-10 h-10 rounded-full items-center justify-center transition-all relative ${isAura ? 'text-white hover:bg-white/10' : isSports ? (isHomePage && !scrolled ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-100') : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}>
                            <ShoppingCart className="w-5 h-5" />
                            <AnimatePresence>
                                {totalItems > 0 && (
                                    <motion.span
                                        key={totalItems}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--primary-color)] text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none ring-2 ring-white"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                        <Link href={`/s/${slug}/profile`} className={`hidden lg:flex w-10 h-10 rounded-full items-center justify-center transition-all relative ${isAura ? 'text-white hover:bg-white/10' : isSports ? (isHomePage && !scrolled ? 'text-white hover:bg-white/10' : 'text-zinc-900 hover:bg-zinc-100') : 'text-zinc-500 hover:text-[var(--primary-color)] hover:bg-zinc-50'}`}>
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </nav>

            {/* Row 2: Menu Bar (Part of the same header container) */}
            {(layoutStyle === 'nextgen' || layoutStyle === 'sports' || storeTheme === 'modern') && (
                <div className="hidden lg:block border-t border-zinc-100/50">
                    <div className={`max-w-7xl mx-auto px-8 h-12 flex items-center gap-10 relative ${
                        menuAlignment === 'left' ? 'justify-start' : 
                        menuAlignment === 'right' ? 'justify-end' : 
                        'justify-center'
                    }`}>
                        {visibleItems.length > 0 ? (
                            visibleItems.map((item: any) => (
                                <div key={item.id} className="group py-2">
                                    <Link
                                        href={formatHref(item.href)}
                                        className={`text-[11px] font-bold uppercase transition-colors relative flex items-center gap-1 ${isAura || isSports ? '!text-white hover:opacity-80' : 'text-zinc-600 hover:text-black'}`}
                                    >
                                        {item.label}
                                        {item.children && item.children.some((c: any) => c.isVisible) && (
                                            <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform opacity-50" />
                                        )}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all group-hover:w-full rounded-full"></span>
                                    </Link>

                                    {item.children && item.children.some((c: any) => c.isVisible) && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-zinc-100 rounded-[48px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-16 z-[100] overflow-hidden pointer-events-auto">
                                            <div className="absolute top-0 left-0 w-full h-px bg-zinc-100"></div>
                                            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-16 text-left">
                                                <div className="col-span-9 max-h-[60vh] overflow-y-auto pr-8 custom-scrollbar">
                                                    <DesktopMenuRecursive items={item.children} />
                                                </div>
                                                <div className="col-span-3">
                                                    {item.bannerImage || item.image ? (
                                                        <Link href={formatHref(item.bannerLink) || "#"} className="relative block aspect-[3/4] rounded-[32px] overflow-hidden group/img">
                                                            <img 
                                                                src={item.bannerImage || item.image} 
                                                                className="absolute inset-0 w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" 
                                                                alt={item.bannerTitle || item.label} 
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-center sm:text-left">
                                                                <p className="text-white text-[16px] font-bold italic mb-1 leading-tight">{item.bannerTitle || item.label}</p>
                                                                <p className="text-zinc-400 text-[10px] font-bold">New collection →</p>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div className="bg-zinc-50 aspect-[3/4] rounded-[32px] flex items-center justify-center border border-zinc-100 p-12 shadow-inner italic">
                                                            <div className="text-center">
                                                                <p className="text-[12px] font-bold text-black">{item.label}</p>
                                                                <p className="text-zinc-400 text-[9px] font-medium mt-1">Discover store</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <Link href={`/s/${slug}`} className="text-[11px] font-bold uppercase text-zinc-600 hover:text-black transition-colors">{t("home")}</Link>
                                <Link href={`/s/${slug}/products`} className="text-[11px] font-bold uppercase text-zinc-600 hover:text-black transition-colors">{t("shop")}</Link>
                                {categories.slice(0, 5).map(cat => (
                                    <Link 
                                        key={cat.id} 
                                        href={formatHref(`/products?category=${encodeURIComponent(cat.name)}`)}
                                        className="text-[11px] font-bold uppercase text-zinc-600 hover:text-black transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Side Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-[101] flex flex-col p-8"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <Link href={`/s/${slug}`} onClick={() => setIsMenuOpen(false)}>
                                    {storeInfo?.logo ? (
                                        <img src={`${storeInfo.logo}?v=${version}`} className="h-10 w-auto" alt="Logo" />
                                    ) : (
                                        <span className="text-xl font-bold italic">{storeInfo.name}</span>
                                    )}
                                </Link>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-4">Store navigation</p>
                                    <Link href={formatHref("/")} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <Home className="w-5 h-5" />
                                        </div>
                                        Home
                                    </Link>
                                    <Link href={formatHref("/products")} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all group">
                                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        Products
                                    </Link>
                                    {visibleItems.map((item: any) => (
                                         <Link key={item.id} href={formatHref(item.href)} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all group">
                                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all capitalize">
                                                {item.label.charAt(0)}
                                            </div>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="space-y-1 pt-8 border-t border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 mb-4">Categories</p>
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        {categories.map((cat) => (
                                            <Link 
                                                key={cat.id} 
                                                href={formatHref(`/products?category=${encodeURIComponent(cat.name)}`)}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="px-4 py-3 text-[10px] font-bold text-zinc-600 bg-zinc-50 hover:bg-black hover:text-white rounded-xl transition-all text-center"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-zinc-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <Link href={formatHref("/profile")} onClick={() => setIsMenuOpen(false)} className="flex-1 flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <User className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">My Profile</p>
                                            <p className="text-[9px] font-medium text-zinc-400">Manage orders</p>
                                        </div>
                                    </Link>
                                    <Link href={formatHref("/cart")} onClick={() => setIsMenuOpen(false)} className="p-4 bg-zinc-950 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
                                        <ShoppingCart className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Large Mobile Search Bar */}
            <div className={`lg:hidden px-4 pb-4 ${isAura ? 'bg-zinc-950' : 'bg-white'} transition-all duration-300 ${isSports ? 'hidden' : 'border-b border-zinc-100 shadow-sm'}`}>
                <div className="relative max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-black transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={animatedPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-12 pr-12 py-3.5 ${isAura ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900'} rounded-full text-[13px] font-bold placeholder:text-zinc-400 focus:ring-4 focus:ring-black/5 transition-all outline-none shadow-sm`}
                        />
                        {searchQuery && (
                            <button 
                                type="button" 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-black transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Mobile Live Search Results */}
                    <AnimatePresence>
                        {searchQuery.trim().length >= 2 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-100 rounded-[32px] shadow-2xl overflow-hidden z-[101] p-2"
                            >
                                <div className="p-4 border-b border-zinc-50">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Search results</p>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                                    {isSearching ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
                                            <p className="text-[10px] font-bold italic">Looking for products...</p>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <>
                                            {searchResults.map((p) => (
                                                <Link 
                                                    key={p.id} 
                                                    href={`/s/${slug}/products/${p.slug}`} 
                                                    onClick={() => setSearchQuery("")}
                                                    className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl group transition-all"
                                                >
                                                    <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                                                        <img 
                                                            src={JSON.parse(p.images)[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
                                                            alt={p.name}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-zinc-900 truncate tracking-tight">{p.name}</p>
                                                        <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{formatPrice(p.price, storeInfo.currency)}</p>
                                                    </div>
                                                    <div className="p-2 bg-zinc-100 text-zinc-400 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                                                        <ChevronDown className="w-3 h-3 -rotate-90" />
                                                    </div>
                                                </Link>
                                            ))}
                                            <Link 
                                                href={`/s/${slug}/products?q=${encodeURIComponent(searchQuery)}`}
                                                onClick={() => setSearchQuery("")}
                                                className="block py-4 text-center text-[10px] font-bold text-zinc-400 hover:text-[var(--primary-color)] transition-colors border-t border-zinc-50 mt-2"
                                            >
                                                View all results →
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Search className="w-5 h-5 text-zinc-300" />
                                            </div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No products found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({ storeInfo, slug, categories, pages, storeTheme, version }: { storeInfo: StoreInfo; slug: string; categories: StoreCategory[]; pages: CustomPage[]; storeTheme?: string; version: number }) {
    const { t } = useLanguage()
    const isAura = storeTheme === "aura"
    const isGlass = storeTheme === "glass"
    const isSports = storeTheme === "sports"

    return (
        <footer className={`${isSports ? 'bg-black text-white border-t border-white/5' : isAura ? 'bg-black border-t border-white/5 text-white' : isGlass ? 'bg-white/20 backdrop-blur-3xl border-t border-white/20 text-white' : 'bg-zinc-950 text-white'} py-12 mt-auto`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
                <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="mb-6">
                        {storeInfo.logo ? (
                            <img src={`${storeInfo.logo}${storeInfo.logo.includes('?') ? '&' : '?'}v=${version}`} alt={storeInfo.name} className="h-10 w-auto object-contain" />
                        ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] flex items-center justify-center text-white font-bold text-xl italic mx-auto md:mx-0">
                                {storeInfo.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <p className="text-zinc-500 text-[12px] font-medium leading-relaxed max-w-sm">{storeInfo.description || "Premium products at the best prices. Redefining your shopping experience with style."}</p>
                    
                    {/* Social Links */}
                    {storeInfo.themeConfig && (() => {
                        try {
                            const config = JSON.parse(storeInfo.themeConfig);
                            const socialLinks = [
                                { icon: Instagram, url: config.instagramUrl, color: "hover:text-pink-500" },
                                { icon: Facebook, url: config.facebookUrl, color: "hover:text-blue-600" },
                                { icon: Twitter, url: config.twitterUrl, color: "hover:text-sky-400" },
                                { icon: Linkedin, url: config.linkedinUrl, color: "hover:text-blue-700" },
                                { icon: Youtube, url: config.youtubeUrl, color: "hover:text-red-600" }
                            ].filter(link => link.url);

                            if (socialLinks.length === 0) return null;

                            return (
                                <div className="flex items-center gap-4 mt-8">
                                    {socialLinks.map((link, idx) => (
                                        <a 
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 transition-all duration-300 hover:scale-110 hover:bg-zinc-800 ${link.color}`}
                                        >
                                            <link.icon size={14} />
                                        </a>
                                    ))}
                                </div>
                            );
                        } catch (e) { return null; }
                    })()}
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className={`text-[13px] font-black uppercase tracking-wider mb-8 ${isSports ? 'text-white/40' : 'text-white/40'}`}>Collections</h4>
                    <ul className="space-y-4">
                        {categories.slice(0, 5).map((cat) => (
                            <li key={cat.id}>
                                <Link 
                                    href={`/s/${slug}/products?category=${encodeURIComponent(cat.name || 'All')}`} 
                                    className={`${isSports ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-white'} transition-all text-[12px] font-medium hover:translate-x-1 inline-block`}
                                >
                                    {cat.name || 'Uncategorized'}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className={`text-[13px] font-black uppercase tracking-wider mb-8 ${isSports ? 'text-white/40' : 'text-white/40'}`}>Quick Links</h4>
                    <ul className="space-y-4">
                        <li><Link href={`/s/${slug}/profile`} className={`${isSports ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-white'} transition-all text-[12px] font-medium hover:translate-x-1 inline-block`}>My account</Link></li>
                        <li><Link href={`/s/${slug}/wishlist`} className={`${isSports ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-white'} transition-all text-[12px] font-medium hover:translate-x-1 inline-block`}>Wishlist</Link></li>
                        <li><Link href={`/s/${slug}/cart`} className={`${isSports ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-white'} transition-all text-[12px] font-medium hover:translate-x-1 inline-block`}>Shopping bag</Link></li>
                    </ul>
                </div>

                {pages.length > 0 && (
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className={`text-[13px] font-black uppercase tracking-wider mb-8 ${isSports ? 'text-white/40' : 'text-white/40'}`}>Pages</h4>
                        <ul className="space-y-4">
                            {pages.map((page) => (
                                <li key={page.id}>
                                    <Link 
                                        href={`/s/${slug}/page/${page.slug}`} 
                                        className={`${isSports ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-white'} transition-all text-[12px] font-medium hover:translate-x-1 inline-block`}
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className={`text-[13px] font-black uppercase tracking-wider mb-8 ${isSports ? 'text-white/40' : 'text-white/40'}`}>Newsletter</h4>
                    <p className="text-zinc-500 text-[12px] font-medium mb-6">Join our newsletter to get weekly updates.</p>
                    <div className="flex w-full group/input">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className={`flex-1 min-w-0 ${isSports ? 'bg-zinc-900/50 text-white border-zinc-800' : 'bg-zinc-900/50 text-white border-zinc-800'} px-6 py-4 rounded-l-2xl border text-[12px] font-medium focus:outline-none focus:border-[var(--primary-color)] transition-all`} 
                        />
                        <button className={`${isSports ? 'bg-white text-black hover:bg-[var(--primary-color)]/100 hover:text-white' : 'bg-white text-black hover:bg-[var(--primary-color)]/100 hover:text-white'} px-8 py-4 rounded-r-2xl text-[12px] font-bold transition-all active:scale-95`}>Go</button>
                    </div>
                </div>
            </div>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t ${isSports ? 'border-white/10' : 'border-zinc-800/60'} flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-medium ${isSports ? 'text-zinc-500' : 'text-zinc-500'}`}>
                <span>
                    {(() => {
                        try {
                            const config = JSON.parse(storeInfo.themeConfig || '{}');
                            return config.footerText || `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;
                        } catch (e) {
                            return `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;
                        }
                    })()}
                </span>

                {/* Powered by Qicmart Watermark */}
                {storeInfo.planName !== 'Pro' && storeInfo.planName !== 'Enterprise' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-all group">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400">Powered by</span>
                        <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-lg bg-indigo-600 overflow-hidden flex items-center justify-center">
                                <img src="/logo.png" alt="Qicmart Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[12px] font-black italic tracking-tighter text-white">Qic<span className="text-indigo-500">Mart</span></span>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 italic font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Premium Design</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Secure</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Fast Delivery</span>
                </div>
            </div>
        </footer>
    )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function StoreLayout({
    children,
    params,
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = use(params)
    const slug = resolvedParams.slug
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isHomePage = pathname === `/s/${slug}` || pathname === `/s/${slug}/`
    
    const [storeInfo, setStoreInfo] = useState<StoreInfo>({ id: "", name: "Store", currency: "INR" })
    const [categories, setCategories] = useState<StoreCategory[]>([])
    const [pages, setPages] = useState<CustomPage[]>([])
    const [isSuspended, setIsSuspended] = useState(false)
    const [version, setVersion] = useState(0)
    
    useEffect(() => {
        setVersion(Date.now())
    }, [])
    const { data: session } = useSession()

    // 0. RESTRICTION: Redirect Super Admin to Admin Dashboard
    useEffect(() => {
        if (session?.user && (session.user as any).role === "SUPER_ADMIN") {
            window.location.href = "/admin"
        }
    }, [session])

    // Silent Profile Creation / Sync
    useEffect(() => {
        if (session?.user && storeInfo.id) {
            // Call profile API silently to ensure Customer record exists
            fetch(`/api/customer/profile?storeId=${storeInfo.id}`).catch(() => {})
        }
    }, [session, storeInfo.id])

    useEffect(() => {
        if (!slug || !storeInfo.id) return

        // Track store view for analytics
        const trackView = async () => {
            try {
                const isNewVisitor = !sessionStorage.getItem(`visited_${storeInfo.id}`)
                await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ storeId: storeInfo.id, isNewVisitor })
                })
                if (isNewVisitor) {
                    sessionStorage.setItem(`visited_${storeInfo.id}`, "true")
                }
            } catch (e) {
                console.error("Tracking error:", e)
            }
        }

        trackView()

        // Local history for "Recently Viewed Stores"
        try {
            const history = JSON.parse(localStorage.getItem("recentlyViewedStores") || "[]")
            const newEntry = {
                id: storeInfo.id,
                name: storeInfo.name,
                slug: slug,
                logo: storeInfo.logo,
                timestamp: Date.now()
            }
            const updated = [newEntry, ...history.filter((s: any) => s.id !== storeInfo.id)].slice(0, 10)
            localStorage.setItem("recentlyViewedStores", JSON.stringify(updated))
        } catch (e) {
            console.error("History tracking error:", e)
        }
    }, [slug, storeInfo.id, storeInfo.name])

    useEffect(() => {
        if (!slug) return
        Promise.all([
            fetch(`/api/store-info?slug=${slug}&v=${version}`).then((r) => r.json()),
            fetch(`/api/store-categories?slug=${slug}&v=${version}`).then((r) => r.json()),
            fetch(`/api/store-pages?slug=${slug}&v=${version}`).then((r) => r.json()),
        ]).then(([info, cats, storePages]) => {
            if (info?.isPlatformDisabled || info?.isStorefrontDisabled || info?.error === "Not found") {
                setIsSuspended(true)
                return
            }
            if (info?.name) {
                setStoreInfo(info)
                let favicon = "/favicon.ico"
                if (info.themeConfig) {
                    try {
                        const config = JSON.parse(info.themeConfig)
                        if (config.favicon) favicon = config.favicon
                    } catch (e) { }
                }
                const existingLinks = document.querySelectorAll("link[rel*='icon']")
                existingLinks.forEach(l => l.remove())
                const link = document.createElement('link')
                link.rel = 'shortcut icon'
                link.href = `${favicon}${favicon.includes('?') ? '&' : '?'}v=${version}`
                document.getElementsByTagName('head')[0].appendChild(link)
            }
            if (Array.isArray(cats)) setCategories(cats)
            if (Array.isArray(storePages)) setPages(storePages)
        }).catch(() => { })
    }, [slug, version])

    if (isSuspended) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
                <h1 className="text-6xl font-bold tracking-tighter mb-4 text-zinc-900">404</h1>
                <p className="text-xl font-bold text-zinc-500 mb-8 max-w-md mx-auto">This store is currently unavailable or has been suspended.</p>
                <a href="/" className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-xs shadow-xl">Return to platform</a>
            </div>
        )
    }

    const config = storeInfo.themeConfig ? JSON.parse(storeInfo.themeConfig) : {}
    const storeTheme = config.storeTheme || "modern"
    const layoutStyle = storeTheme === 'nextgen' ? 'nextgen' : (config.layoutStyle || "default")
    const isAura = storeTheme === "aura"
    const isSports = storeTheme === "sports"
    const fontStyle = config.fontStyle || "modern"

    const FONT_MAP: Record<string, { heading: string; body: string }> = {
        modern: { heading: 'var(--font-poppins)', body: 'var(--font-inter)' },
        premium: { heading: 'var(--font-playfair)', body: 'var(--font-montserrat)' },
        minimal: { heading: 'var(--font-montserrat)', body: 'var(--font-opensans)' },
        tech: { heading: 'var(--font-ubuntu)', body: 'var(--font-lato)' },
    }

    const { heading, body } = FONT_MAP[fontStyle] || FONT_MAP.modern

    const COLOR_MAP: Record<string, string> = {
        purple: '#6366f1',
        orange: '#f97316',
        green: '#22c55e',
        blue: '#3b82f6',
    }
    const primaryColorHex = COLOR_MAP[config.primaryColor] || COLOR_MAP.purple

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "99, 102, 241"
    }
    const primaryColorRgb = hexToRgb(primaryColorHex)

    const ownerId = searchParams.get("ownerId")?.trim()
    const profileHref = `/s/${slug}/profile`

    const isVisiblePage = !pathname.includes('/checkout')

    const MobileBottomNav = () => {
        const { totalItems } = useCart()
        const { t } = useLanguage()
        const navItems = [
            { label: t("home"), icon: Home, href: `/s/${slug}` },
            { label: t("shop"), icon: ShoppingBag, href: `/s/${slug}/products` },
            { label: t("cart"), icon: ShoppingCart, href: `/s/${slug}/cart`, count: totalItems },
            { label: t("profile"), icon: User, href: profileHref },
        ]

        if (!isVisiblePage) return null

        return (
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-sm">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-between p-2 gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative flex items-center justify-center focus:outline-none flex-1 min-w-0"
                            >
                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.span 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[var(--primary-color)] rounded-[20px] shadow-lg shadow-[var(--primary-color)]/20"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10 flex items-center justify-center gap-2 px-4 py-3 h-full">
                                    <Icon 
                                        className={`w-5 h-5 transition-all duration-300 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"}`} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                    />
                                    
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10, width: 0 }}
                                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                                exit={{ opacity: 0, x: -10, width: 0 }}
                                                className="text-[12px] font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {item.count !== undefined && item.count > 0 && (
                                        <span className={`absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 shadow-sm transition-all duration-300 ${isActive ? "bg-white text-[var(--primary-color)] border-[var(--primary-color)]" : "bg-[var(--primary-color)] text-white border-white"}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        )
    }


    const WhatsAppButton = () => {
        const config = storeInfo.themeConfig ? JSON.parse(storeInfo.themeConfig || '{}') : {}
        if (!config.isWhatsappEnabled || !config.whatsappNumber) return null

        const message = encodeURIComponent(config.whatsappMessage || "Hello! I have a question about your products.")
        const waLink = `https://wa.me/${config.whatsappNumber}?text=${message}`

        return (
            <div className="fixed bottom-24 lg:bottom-10 right-6 z-[70] flex flex-col items-center gap-2 pointer-events-none">
                <motion.a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1,
                        boxShadow: [
                            "0 0 0 0px rgba(37, 211, 102, 0.4)",
                            "0 0 0 20px rgba(37, 211, 102, 0)"
                        ]
                    }}
                    transition={{
                        boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        scale: { type: "spring", stiffness: 260, damping: 20 }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer overflow-hidden border-2 border-white/20 pointer-events-auto"
                >
                    <motion.svg 
                        viewBox="0 0 24 24" 
                        width="28" 
                        height="28" 
                        fill="currentColor"
                        animate={{
                            rotate: [-5, 5, -5, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut"
                        }}
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </motion.svg>
                </motion.a>
            </div>
        )
    }
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const ScrollingAnnouncementBar = ({ themeConfig }: { themeConfig: any }) => {
        if (!themeConfig.showAnnouncement || scrolled) return null

        return (
            <div 
                className="w-full py-2 flex items-center overflow-hidden h-9 z-[60] bg-zinc-950 text-white relative border-b border-white/5"
                style={{ 
                    backgroundColor: themeConfig.announcementBg || '#000000', 
                    color: themeConfig.announcementColor || '#ffffff' 
                }}
            >
                <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{themeConfig.announcementText || "Welcome to our store!"}</span>
                            <Star size={10} fill="currentColor" className="opacity-40" />
                        </div>
                    ))}
                </div>
                <style jsx>{`
                    .animate-marquee {
                        display: flex;
                        width: max-content;
                        animation: marquee 40s linear infinite;
                    }
                    @keyframes marquee {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <Providers>
            <LanguageProvider>
                <CartProvider>
                    <WishlistProvider>
                        <div className={`min-h-screen flex flex-col storefront-fonts ${isAura ? "bg-zinc-950 text-white" : "bg-white"} ${isVisiblePage ? "pb-24 lg:pb-0" : ""}`} style={{ '--font-heading': heading, '--font-body': body, '--primary-color': primaryColorHex, '--primary-rgb': primaryColorRgb } as any}>
                            <ScrollingAnnouncementBar themeConfig={config} />
                            {slug && <Header storeInfo={storeInfo} slug={slug} categories={categories} version={version} scrolled={scrolled} announcementHeight={config.showAnnouncement && !scrolled ? 36 : 0} />}
                            
                            {/* Plugin Third-Party Scripts */}
                            {config.isGoogleAnalyticsEnabled && config.googleAnalyticsId && (
                                <>
                                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`} strategy="lazyOnload" />
                                    <Script id="google-analytics" strategy="lazyOnload">
                                        {`
                                            window.dataLayer = window.dataLayer || [];
                                            function gtag(){dataLayer.push(arguments);}
                                            gtag('js', new Date());
                                            gtag('config', '${config.googleAnalyticsId}', {
                                                page_path: window.location.pathname,
                                            });
                                        `}
                                    </Script>
                                </>
                            )}
                            {config.isFacebookPixelEnabled && config.facebookPixelId && (
                                <Script id="facebook-pixel" strategy="lazyOnload">
                                    {`
                                        !function(f,b,e,v,n,t,s)
                                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                                        n.queue=[];t=b.createElement(e);t.async=!0;
                                        t.src=v;s=b.getElementsByTagName(e)[0];
                                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                                        'https://connect.facebook.net/en_US/fbevents.js');
                                        fbq('init', '${config.facebookPixelId}');
                                        fbq('track', 'PageView');
                                    `}
                                </Script>
                            )}

                            <CouponPopup storeId={storeInfo.id} currency={storeInfo.currency} />
                            <main 
                                className={`relative flex-1 transition-all duration-300
                                ${isSports && !isHomePage ? 'pt-24 lg:pt-40' : 
                                  layoutStyle === 'nextgen' ? 'pt-20 lg:pt-36' : 
                                  !isSports && !isAura ? 'pt-20' : ''}`}
                                style={{
                                    paddingTop: config.showAnnouncement && !scrolled ? `calc(${(!isSports && !isAura ? '80px' : '0px')} + 36px)` : undefined
                                }}
                            >
                                {/* Ambient Glows */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-color)]/5 blur-[120px] rounded-full animate-pulse" />
                                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
                                </div>
                                {children}
                            </main>
                            {slug && <Footer storeInfo={storeInfo} slug={slug} categories={categories} pages={pages} storeTheme={storeTheme} version={version} />}
                            {slug && <MobileBottomNav />}
                            {slug && <WhatsAppButton />}
                        </div>
                    </WishlistProvider>
                </CartProvider>
            </LanguageProvider>
        </Providers>
    )
}
