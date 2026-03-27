"use client"

import { ReactNode, useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown, Home, ShoppingBag, Loader2, Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { CartProvider, useCart } from "@/context/CartContext"
import { WishlistProvider, useWishlist } from "@/context/WishlistContext"
import { Providers } from "@/components/Providers"
import { LanguageProvider, useLanguage } from "@/context/LanguageContext"
import { formatPrice } from "./utils"
import CouponPopup from "@/components/storefront/CouponPopup"

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
function Header({ storeInfo, slug, categories, version }: { storeInfo: StoreInfo; slug: string; categories: StoreCategory[]; version: number }) {
    const router = useRouter()
    const { t } = useLanguage()
    const { totalItems } = useCart()
    const { totalItems: wishlistCount } = useWishlist()
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [openMobileSub, setOpenMobileSub] = useState<string | null>(null)

    const themeConfig = storeInfo.themeConfig ? JSON.parse(storeInfo.themeConfig) : {}
    const menuAlignment = themeConfig.menuAlignment || "left"
    const headerStyle = themeConfig.headerStyle || "flat"
    const menuItems = themeConfig.menuItems || []
    const visibleItems = menuItems.filter((i: any) => i.isVisible)

    const formatHref = (href: string) => {
        if (!href) return "#"
        if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href
        if (href.startsWith("/s/")) return href
        return `/s/${slug}${href.startsWith("/") ? href : `/${href}`}`
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchOpen(false)
            setSearchQuery("")
        }
    }

    const DesktopMenuRecursive = ({ items }: { items: any[] }) => (
        <div className="grid grid-cols-4 gap-x-12 gap-y-10">
            {items.filter((i: any) => i.isVisible).map((item: any) => (
                <div key={item.id} className="space-y-6">
                    <p className="text-[12px] font-bold text-black">{item.label}</p>
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

    return (
        <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-zinc-100 dark:border-white/5 transition-all duration-500">
            <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                <div className="flex-shrink-0">
                    <Link href={`/s/${slug}`} className="group flex items-center">
                        <div className="h-10 sm:h-12 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                            {storeInfo?.logo ? (
                                <img src={`${storeInfo.logo}${storeInfo.logo.includes('?') ? '&' : '?'}v=${version}`} alt={storeInfo.name} className="h-full w-auto object-contain" />
                            ) : (
                                <span className="text-xl font-bold tracking-tight text-zinc-900 italic">{storeInfo?.name || "Store"}</span>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className={`hidden lg:flex items-center gap-10 flex-1 px-4 ${menuAlignment === 'center' ? 'justify-center' :
                        menuAlignment === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                    {visibleItems.length > 0 ? (
                        visibleItems.map((item: any) => (
                            <div key={item.id} className="group py-2">
                                <Link
                                    href={formatHref(item.href)}
                                    className="text-[13px] font-semibold text-zinc-900 hover:text-black transition-colors relative flex items-center gap-1"
                                >
                                    {item.label}
                                    {item.children && item.children.some((c: any) => c.isVisible) && (
                                        <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform opacity-50" />
                                    )}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all group-hover:w-full rounded-full"></span>
                                </Link>

                                {item.children && item.children.some((c: any) => c.isVisible) && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-zinc-100 rounded-[48px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-16 z-50 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-px bg-zinc-100"></div>
                                        
                                        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-16">
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
                            <Link href={`/s/${slug}`} className="text-[13px] font-semibold text-zinc-700 hover:text-black transition-colors relative group py-2">
                                {t("home")}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full rounded-full"></span>
                            </Link>

                            <div className="group relative py-2">
                                <Link
                                    href={`/s/${slug}/products`}
                                    className="text-[13px] font-semibold text-zinc-700 hover:text-black transition-colors relative flex items-center gap-1"
                                >
                                    {t("shop")}
                                    <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform opacity-50" />
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full rounded-full"></span>
                                </Link>

                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white border border-zinc-100 rounded-[32px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-8 z-50">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-zinc-400 border-b border-zinc-100 pb-2">Collections</p>
                                            <div className="grid grid-cols-1 gap-1">
                                                {categories.map((cat: any) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/s/${slug}/products?category=${encodeURIComponent(cat.name)}`}
                                                        className="px-4 py-2 text-[10px] font-bold text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-lg transition-all"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-950 rounded-[24px] p-6 flex flex-col justify-end min-h-[160px] relative overflow-hidden group/banner">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--primary-color)]/40 group-hover/banner:scale-110 transition-transform duration-700"></div>
                                            <div className="relative">
                                                <p className="text-white text-[12px] font-bold italic">New arrivals</p>
                                                <Link href={`/s/${slug}/products`} className="text-zinc-400 text-[9px] font-bold mt-2 block hover:text-white transition-colors">See all →</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Search Trigger */}
                    <div className="relative flex items-center">
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
                                        autoFocus
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-48 sm:w-80 px-6 py-3 bg-zinc-100 border border-zinc-200 rounded-full text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all outline-none"
                                    />
                                    {isSearching ? (
                                        <Loader2 className="absolute right-12 w-3 h-3 animate-spin text-zinc-400" />
                                    ) : searchQuery && (
                                        <button type="button" onClick={() => setSearchQuery("")} className="absolute right-12 text-zinc-400 hover:text-black transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 p-2 bg-white border border-zinc-100 rounded-full shadow-sm hover:bg-zinc-50 transition-colors">
                                        <X className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </motion.form>

                                {/* Live Search Results Dropdown */}
                                <AnimatePresence>
                                    {searchQuery.trim().length >= 2 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-4 w-[320px] sm:w-[450px] bg-white border border-zinc-100 rounded-[32px] shadow-2xl overflow-hidden z-[60] p-2"
                                        >
                                            <div className="p-4 border-b border-zinc-50">
                                                <p className="text-[10px] font-bold text-zinc-400">Search results</p>
                                            </div>
                                            
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                                {isSearching ? (
                                                    <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                        <p className="text-[10px] font-bold">Searching products...</p>
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    <>
                                                        {searchResults.map((product) => (
                                                            <Link 
                                                                key={product.id}
                                                                href={`/s/${slug}/products/${product.slug}`}
                                                                onClick={() => setSearchOpen(false)}
                                                                className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-all group"
                                                            >
                                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100">
                                                                    <img 
                                                                        src={JSON.parse(product.images)[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'} 
                                                                        alt={product.name} 
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold text-zinc-900 tracking-tight truncate">{product.name}</p>
                                                                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{formatPrice(product.price, storeInfo.currency)}</p>
                                                                </div>
                                                                <div className="p-2 bg-zinc-100 text-zinc-400 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                                                                    <ChevronDown className="w-3 h-3 -rotate-90" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        <Link 
                                                            href={`/s/${slug}/products?q=${encodeURIComponent(searchQuery)}`}
                                                            onClick={() => setSearchOpen(false)}
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
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No products found for "{searchQuery}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button onClick={() => setSearchOpen(true)} className="p-2 text-zinc-500 hover:text-black transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <Link href={`/s/${slug}/wishlist`} className="p-2 text-zinc-500 hover:text-rose-500 transition-colors relative">
                        <Heart className="w-5 h-5" />
                        <AnimatePresence>
                            {wishlistCount > 0 && (
                                <motion.span
                                    key={wishlistCount}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <Link href={`/s/${slug}/cart`} className="hidden lg:flex p-2 text-zinc-500 hover:text-black transition-colors relative">
                        <ShoppingCart className="w-5 h-5" />
                        <AnimatePresence>
                            {totalItems > 0 && (
                                <motion.span
                                    key={totalItems}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute top-1 right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    <Link href={`/s/${slug}/profile`} className="hidden lg:flex p-2 text-zinc-500 hover:text-[var(--primary-color)] transition-colors relative text-center items-center justify-center">
                        <User className="w-5 h-5" />
                    </Link>
                </div>
            </nav>
        </header>
    )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({ storeInfo, slug, categories, pages }: { storeInfo: StoreInfo; slug: string; categories: StoreCategory[]; pages: CustomPage[] }) {
    const { t } = useLanguage()
    return (
        <footer className="bg-zinc-950 text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
                <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="mb-6">
                        {storeInfo.logo ? (
                            <img src={`${storeInfo.logo}${storeInfo.logo.includes('?') ? '&' : '?'}v=${Date.now()}`} alt={storeInfo.name} className="h-10 w-auto object-contain" />
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
                    <h4 className="text-[13px] font-black uppercase tracking-wider mb-8 text-white/40">Collections</h4>
                    <ul className="space-y-4">
                        {categories.slice(0, 5).map((cat) => (
                            <li key={cat.id}>
                                <Link 
                                    href={`/s/${slug}/products?category=${encodeURIComponent(cat.name || 'All')}`} 
                                    className="text-zinc-400 hover:text-white transition-all text-[12px] font-medium hover:translate-x-1 inline-block"
                                >
                                    {cat.name || 'Uncategorized'}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className="text-[13px] font-black uppercase tracking-wider mb-8 text-white/40">Quick Links</h4>
                    <ul className="space-y-4">
                        <li><Link href={`/s/${slug}/profile`} className="text-zinc-400 hover:text-white transition-all text-[12px] font-medium hover:translate-x-1 inline-block">My account</Link></li>
                        <li><Link href={`/s/${slug}/wishlist`} className="text-zinc-400 hover:text-white transition-all text-[12px] font-medium hover:translate-x-1 inline-block">Wishlist</Link></li>
                        <li><Link href={`/s/${slug}/cart`} className="text-zinc-400 hover:text-white transition-all text-[12px] font-medium hover:translate-x-1 inline-block">Shopping bag</Link></li>
                    </ul>
                </div>

                {pages.length > 0 && (
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h4 className="text-[13px] font-black uppercase tracking-wider mb-8 text-white/40">Pages</h4>
                        <ul className="space-y-4">
                            {pages.map((page) => (
                                <li key={page.id}>
                                    <Link 
                                        href={`/s/${slug}/page/${page.slug}`} 
                                        className="text-zinc-400 hover:text-white transition-all text-[12px] font-medium hover:translate-x-1 inline-block"
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className="text-[13px] font-black uppercase tracking-wider mb-8 text-white/40">Newsletter</h4>
                    <p className="text-zinc-500 text-[12px] font-medium mb-6">Join our newsletter to get weekly updates.</p>
                    <div className="flex w-full group/input">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className="flex-1 min-w-0 bg-zinc-900/50 text-white px-6 py-4 rounded-l-2xl border border-zinc-800 text-[12px] font-medium focus:outline-none focus:border-[var(--primary-color)] transition-all" 
                        />
                        <button className="bg-white text-black px-8 py-4 rounded-r-2xl text-[12px] font-bold transition-all hover:bg-[var(--primary-color)]/100 hover:text-white active:scale-95">Go</button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-medium text-zinc-500">
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
    
    const [storeInfo, setStoreInfo] = useState<StoreInfo>({ id: "", name: "Store", currency: "INR" })
    const [categories, setCategories] = useState<StoreCategory[]>([])
    const [pages, setPages] = useState<CustomPage[]>([])
    const [isSuspended, setIsSuspended] = useState(false)
    const [version] = useState(Date.now())
    const { data: session } = useSession()

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

    const ownerId = searchParams.get("ownerId")?.trim()
    const profileHref = `/s/${slug}/profile`

    const isVisiblePage = [
        `/s/${slug}`,
        `/s/${slug}/products`,
        `/s/${slug}/cart`,
        `/s/${slug}/profile`
    ].some(path => pathname === path)

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
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-sm">
                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[24px] shadow-2xl shadow-black/10 flex items-center justify-around p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative flex items-center justify-center py-3 focus:outline-none flex-1 min-w-0"
                            >
                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.span 
                                            layoutId="activeTab"
                                            className="absolute -inset-2 bg-[var(--primary-color)]/10 rounded-xl -z-10"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className="relative z-10 flex items-center justify-center gap-1.5 px-3 h-full">
                                    <Icon 
                                        className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-black" : "text-zinc-400"}`} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                    />
                                    
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10, width: 0 }}
                                                animate={{ opacity: 1, x: 0, width: "auto" }}
                                                exit={{ opacity: 0, x: -10, width: 0 }}
                                                className="text-[12px] font-bold text-black tracking-tight whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {item.count !== undefined && item.count > 0 && (
                                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-sm transition-colors duration-300 ${isActive ? "bg-[var(--primary-color)] text-white" : "bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/20 text-white"}`}>
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

    return (
        <Providers>
            <LanguageProvider>
                <CartProvider>
                    <WishlistProvider>
                        <div className={`min-h-screen bg-white flex flex-col storefront-fonts ${isVisiblePage ? "pb-24 lg:pb-0" : ""}`} style={{ '--font-heading': heading, '--font-body': body, '--primary-color': primaryColorHex } as any}>
                            {slug && <Header storeInfo={storeInfo} slug={slug} categories={categories} version={version} />}
                            <CouponPopup storeId={storeInfo.id} currency={storeInfo.currency} />
                            <main className="relative flex-1">
                                {/* Ambient Glows */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary-color)]/5 blur-[120px] rounded-full animate-pulse" />
                                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
                                </div>
                                {children}
                            </main>
                            {slug && <Footer storeInfo={storeInfo} slug={slug} categories={categories} pages={pages} />}
                            {slug && <MobileBottomNav />}
                            {slug && <WhatsAppButton />}
                        </div>
                    </WishlistProvider>
                </CartProvider>
            </LanguageProvider>
        </Providers>
    )
}
