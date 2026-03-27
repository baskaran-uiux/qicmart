"use client"

import { useState, useEffect } from "react"
import {
    Store, Upload, Image as ImageIcon, Globe, 
    Check, X, Loader2, RefreshCw, Plus, Trash2, ArrowRight, Info, Shield, MessageCircle, ChevronDown,
    Settings as SettingsIcon, ExternalLink, Save, AlertCircle, ArrowLeft, GripVertical,
    Instagram, Facebook, Twitter, Linkedin, Youtube
} from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import Link from "next/link"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import { useSession } from "next-auth/react"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import { QRCodeCanvas } from "qrcode.react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface Banner {
    id: string
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

interface DomainConfig {
    id: string
    slug: string
    subdomain: string
    customDomain?: string
    isDomainVerified: boolean
    instructions: {
        cname: string
        aRecord: string
    }
}

interface StoreSettings {
    name: string
    slug: string
    description: string
    logo: string | null
    currency: string
    favicon: string | null
    banner: string | null
    banners: Banner[]
    fontFamily: string
    fontStyle: string
    primaryColor: string
    menuAlignment: string
    // Razorpay settings
    razorpayKeyId?: string | null
    razorpayKeySecret?: string | null
    razorpayWebhookSecret?: string | null
    isRazorpayEnabled?: boolean
    upiId?: string | null
    upiName?: string | null
    isUpiEnabled: boolean
    // WhatsApp settings
    whatsappNumber: string
    whatsappMessage: string
    isWhatsappEnabled: boolean
    // Announcement settings
    showAnnouncement: boolean
    announcementText: string
    announcementBg: string
    announcementColor: string
    instagramUrl: string
    facebookUrl: string
    twitterUrl: string
    linkedinUrl: string
    youtubeUrl: string
    timezone: string
    language: string
    footerText: string
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function BrandingTab({ settings, update, openMediaLibrary }: any) {
    const { t } = useDashboardStore()
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                    <Store size={18} className="text-zinc-400" />
                    <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">{t("identityAssets")}</h3>
                </div>
                <div className="p-8 sm:p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("primaryLogo")}</label>
                                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">1200 x 400</span>
                            </div>
                            <div 
                                onClick={() => openMediaLibrary("logo")}
                                className="group relative h-48 bg-zinc-50 dark:bg-zinc-800/30 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-[32px] overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-indigo-500/50"
                            >
                                {settings.logo ? (
                                    <>
                                        <img src={settings.logo} alt="Logo" className="max-h-24 max-w-[80%] object-contain group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all">
                                            <span className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">{t("changeLogo")}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-300 dark:text-zinc-600">
                                        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Plus size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t("uploadAsset")}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t("storeName")}</label>
                                <input 
                                    value={settings.name} 
                                    onChange={e => update("name", e.target.value)}
                                    placeholder="e.g. Minimalist Home Decors"
                                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t("storeDescription")}</label>
                                <textarea 
                                    value={settings.description} 
                                    onChange={e => update("description", e.target.value)}
                                    placeholder="Briefly describe your store's mission..."
                                    rows={4}
                                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none leading-relaxed"
                                />
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("footerCopyright")}</label>
                                    <div className="group relative">
                                        <Info size={14} className="text-zinc-300 cursor-help transition-colors hover:text-indigo-400" />
                                        <div className="absolute bottom-full right-0 mb-3 w-48 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-medium text-zinc-400 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 shadow-2xl">
                                            {t("footerCopyrightDesc")}
                                        </div>
                                    </div>
                                </div>
                                <input 
                                    value={settings.footerText} 
                                    onChange={e => update("footerText", e.target.value)}
                                    placeholder={`© ${new Date().getFullYear()} ${settings.name}. All rights reserved.`}
                                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[13px] font-bold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="space-y-6 max-w-md">
                            <div className="flex justify-between items-center pr-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("appFavicon")}</label>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">64 x 64</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-[28px] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                    {settings.favicon ? <img src={settings.favicon} alt="Favicon" className="w-full h-full object-contain p-4" /> : <Globe size={32} className="text-zinc-200" />}
                                </div>
                                <button 
                                    onClick={() => openMediaLibrary("favicon")}
                                    className="flex-1 py-5 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-500/10"
                                >
                                    {settings.favicon ? t("changeFavicon") : t("selectFavicon")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function AppearanceTab({ settings, update, openMediaLibrary, editingBannerId, setEditingBannerId, addBanner, updateBanner, removeBanner }: any) {
    const { t } = useDashboardStore()
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
        >
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t("heroBanners")}</h3>
                    </div>
                    {settings.banners.length < 5 && !editingBannerId && (
                        <button 
                            onClick={addBanner}
                            className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            <Plus size={16} /> {t("addBanner")}
                        </button>
                    )}
                </div>

                <div className="p-8 sm:p-10">
                    {editingBannerId ? (
                        <div className="max-w-4xl mx-auto">
                            {(() => {
                                const banner = settings.banners.find((b: any) => b.id === editingBannerId);
                                if (!banner) return null;
                                return (
                                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden">
                                        <div className="relative aspect-[21/9] bg-zinc-100 dark:bg-zinc-900">
                                            {banner.image ? (
                                                <img src={banner.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                                                    <ImageIcon size={48} className="mb-4 opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t("noImage")}</span>
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button 
                                                    onClick={() => openMediaLibrary("newBanner", banner.id)}
                                                    className="p-3 bg-white text-zinc-900 rounded-xl shadow-xl hover:scale-110 active:scale-90 transition-all"
                                                >
                                                    <Upload size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("heading")}</label>
                                                    <input 
                                                        value={banner.title} 
                                                        onChange={e => updateBanner(banner.id, "title", e.target.value)}
                                                        className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("subHeading")}</label>
                                                    <input 
                                                        value={banner.subtitle} 
                                                        onChange={e => updateBanner(banner.id, "subtitle", e.target.value)}
                                                        className="w-full px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {[
                                                    { label: t("bannerTitle"), key: "titleColor", value: banner.titleColor || "#ffffff" },
                                                    { label: t("bannerSubtitle"), key: "subtitleColor", value: banner.subtitleColor || "#ffffff" },
                                                    { label: t("btnBg"), key: "btnColor", value: banner.btnColor || "#ffffff" },
                                                    { label: t("btnText"), key: "btnTextColor", value: banner.btnTextColor || "#000000" }
                                                ].map((c) => (
                                                    <div key={c.key} className="space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{c.label}</label>
                                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5">
                                                            <input type="color" value={c.value} onChange={e => updateBanner(banner.id, c.key as any, e.target.value)} className="w-6 h-6 rounded-md border-none cursor-pointer" />
                                                            <input value={c.value} onChange={e => updateBanner(banner.id, c.key as any, e.target.value)} className="w-full bg-transparent text-[10px] font-mono font-bold outline-none uppercase" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                <button onClick={() => setEditingBannerId(null)} className="px-8 py-3 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
                                                    {t("doneDesigning")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={settings.banners} onReorder={(newOrder) => update("banners", newOrder)} className="space-y-4">
                            {settings.banners.map((banner: any, index: number) => (
                                <Reorder.Item key={banner.id} value={banner} className="group flex items-center gap-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing">
                                    <div className="w-32 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                                        {banner.image ? <img src={banner.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="opacity-20" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">{t("slide")} {index + 1}</div>
                                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{banner.title || t("noHeading")}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBannerId(banner.id)} className="px-4 py-2 bg-white dark:bg-zinc-800 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">{t("edit")}</button>
                                        <button onClick={() => removeBanner(banner.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </Reorder.Item>
                            ))}
                            {settings.banners.length === 0 && (
                                <div className="py-20 flex flex-col items-center text-zinc-300">
                                    <ImageIcon size={48} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">{t("noBannersAdded")}</p>
                                </div>
                            )}
                        </Reorder.Group>
                    )}
                </div>
            </section>

             <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <ImageIcon size={20} className="text-zinc-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">{t("designSettings")}</h3>
                </div>
                <div className="p-10 space-y-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("selectVibe")}</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'modern', name: 'Modern', h: 'Poppins', b: 'Inter' },
                                { id: 'premium', name: 'Premium', h: 'Playfair', b: 'Montserrat' },
                                { id: 'minimal', name: 'Minimal', h: 'Montserrat', b: 'Open Sans' },
                                { id: 'tech', name: 'Dynamic', h: 'Ubuntu', b: 'Lato' },
                            ].map((style) => (
                                <button key={style.id} onClick={() => update("fontStyle", style.id)} className={`p-6 rounded-2xl border-2 text-left transition-all ${settings.fontStyle === style.id ? "border-indigo-600 bg-indigo-50/20 shadow-lg" : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"}`}>
                                    <div className="text-xl font-bold mb-1">Aa</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{style.name}</div>
                                    <div className="text-[9px] text-zinc-400 font-medium truncate">{style.h} / {style.b}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("primaryColor")}</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: 'purple', bg: 'bg-[#6366f1]' },
                                    { id: 'orange', bg: 'bg-[#f97316]' },
                                    { id: 'green', bg: 'bg-[#22c55e]' },
                                    { id: 'blue', bg: 'bg-[#3b82f6]' },
                                ].map((color) => (
                                    <button key={color.id} onClick={() => update("primaryColor", color.id)} className={`h-12 rounded-xl flex items-center justify-center ${color.bg} shadow-lg transition-all ${settings.primaryColor === color.id ? "ring-4 ring-indigo-500/20 ring-offset-2 scale-105" : "opacity-80 hover:opacity-100"}`}>
                                        {settings.primaryColor === color.id && <Check className="text-white" size={20} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("menuAlignment")}</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                {["left", "center", "right"].map((align) => (
                                    <button key={align} onClick={() => update("menuAlignment", align)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${settings.menuAlignment === align ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}>
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

function FeaturesTab({ settings, update }: any) {
    const { t } = useDashboardStore()
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
        >
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <ImageIcon size={18} />
                        </div>
                        <h3 className="font-bold capitalize text-xs text-zinc-500">{t("announcementBar")}</h3>
                    </div>
                    <button 
                        onClick={() => update("showAnnouncement", !settings.showAnnouncement)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showAnnouncement ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showAnnouncement ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                {settings.showAnnouncement && (
                    <div className="p-8 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("announcementText")}</label>
                            <textarea 
                                value={settings.announcementText}
                                onChange={(e) => update("announcementText", e.target.value)}
                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none h-20 resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("background")}</label>
                                <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <input type="color" value={settings.announcementBg} onChange={(e) => update("announcementBg", e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer" />
                                    <input value={settings.announcementBg} onChange={(e) => update("announcementBg", e.target.value)} className="flex-1 bg-transparent text-[10px] font-mono font-bold outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("textColor")}</label>
                                <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                    <input type="color" value={settings.announcementColor} onChange={(e) => update("announcementColor", e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer" />
                                    <input value={settings.announcementColor} onChange={(e) => update("announcementColor", e.target.value)} className="flex-1 bg-transparent text-[10px] font-mono font-bold outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <MessageCircle size={18} />
                        </div>
                        <h3 className="font-bold capitalize text-xs text-zinc-500">{t("whatsAppSupport")}</h3>
                    </div>
                    <button 
                        onClick={() => update("isWhatsappEnabled", !settings.isWhatsappEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isWhatsappEnabled ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isWhatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("whatsappNumber")}</label>
                            <input 
                                value={settings.whatsappNumber} 
                                onChange={e => update("whatsappNumber", e.target.value)}
                                placeholder="919876543210"
                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("welcomeMessage")}</label>
                            <input 
                                value={settings.whatsappMessage} 
                                onChange={e => update("whatsappMessage", e.target.value)}
                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold capitalize text-xs text-zinc-500">{t("socialLinks")}</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { id: 'instagramUrl', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                        { id: 'facebookUrl', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                        { id: 'twitterUrl', label: 'Twitter / X', icon: Twitter, color: 'text-black dark:text-white' },
                        { id: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
                        { id: 'youtubeUrl', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                    ].map((link) => (
                        <div key={link.id} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{link.label}</label>
                            <div className="relative">
                                <link.icon size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${link.color}`} />
                                <input 
                                    value={(settings as any)[link.id]} 
                                    onChange={e => update(link.id as any, e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-zinc-500/10"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </motion.div>
    )
}

function PreferencesTab({ settings, update }: any) {
    const { t, setLanguage } = useDashboardStore()
    const timezones = ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Singapore"]
    const languages = ["English", "Tamil", "Hindi"]

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">{t("storeCurrency")}</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                                {["INR", "USD", "AED"].map((cur) => (
                                    <button key={cur} onClick={() => update("currency", cur)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${settings.currency === cur ? "bg-white dark:bg-zinc-700 text-indigo-600 shadow-xl" : "text-zinc-400 hover:text-zinc-600"}`}>
                                        {cur}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">{t("storeTimezone")}</label>
                            <select 
                                value={settings.timezone}
                                onChange={e => update("timezone", e.target.value)}
                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                            >
                                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">{t("defaultLanguage")}</label>
                            <select 
                                value={settings.language}
                                onChange={e => {
                                    const newLang = e.target.value
                                    update("language", newLang)
                                    setLanguage(newLang as any)
                                }}
                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                            >
                                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

function DangerTab({ setShowStoreDeleteModal, setShowStoreDataDeleteModal }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="bg-amber-50/50 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/20 rounded-[32px] overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Delete Store Data</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Clear all products, orders, and customer data</p>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl mb-8">
                        <div className="flex items-start gap-3">
                            <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">This will erase all your dashboard content.</h4>
                                <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mt-1 font-medium">Your store settings, logo, and theme will be kept, but all inventory and sales will be wiped.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowStoreDataDeleteModal(true)}
                        className="px-8 py-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
                    >
                        Delete store data
                    </button>
                </div>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-[32px] overflow-hidden">
                <div className="p-8 sm:p-10">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Delete Store</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Permanently remove your store and its database</p>
                        </div>
                    </div>

                    <div className="p-6 bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30 rounded-2xl mb-8">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Deleting this store will also remove your database.</h4>
                                <p className="text-xs text-rose-700/70 dark:text-rose-400/60 mt-1 font-medium">Make sure you have made a backup if you want to keep your data.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowStoreDeleteModal(true)}
                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 active:scale-95 transition-all shadow-xl shadow-rose-500/20"
                    >
                        Delete store
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function DomainTab({ domainConfig, newDomain, setNewDomain, handleSaveDomain, domainSaving, domainError, verifying, handleVerifyDomain, handleRemoveDomain }: any) {
    const { t } = useDashboardStore()
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-black dark:text-white">{t("domainManagement")}</h3>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{t("connectCustomBrandUrl")}</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            {domainConfig?.customDomain ? (
                                <div className="space-y-6">
                                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${domainConfig.isDomainVerified ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                                                {domainConfig.isDomainVerified ? <Check size={28} /> : <Loader2 size={28} className="animate-spin" />}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-black dark:text-white">{domainConfig.customDomain}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block ${domainConfig.isDomainVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                                                    {domainConfig.isDomainVerified ? t("active") : t("pending")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!domainConfig.isDomainVerified && (
                                                <button onClick={handleVerifyDomain} disabled={verifying} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                                    {verifying ? "..." : t("verify")}
                                                </button>
                                            )}
                                            <button onClick={handleRemoveDomain} className="p-3 text-red-500 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("connectCustomDomain")}</label>
                                        <div className="flex gap-4">
                                            <input 
                                                value={newDomain}
                                                onChange={e => setNewDomain(e.target.value)}
                                                placeholder="yourbrand.com"
                                                className="flex-1 px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                            />
                                            <button 
                                                onClick={handleSaveDomain}
                                                disabled={domainSaving || !newDomain}
                                                className="px-8 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {domainSaving ? "..." : t("connect")}
                                            </button>
                                        </div>
                                        {domainError && <p className="text-[10px] font-bold text-red-500">{domainError}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-950 rounded-[32px] p-8 text-white space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] italic">{t("dnsConfiguration")}</h4>
                            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{t("dnsConfigDescription")}</p>
                            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">{t("target")}</p>
                                    <p className="text-xs font-bold text-white font-mono">{domainConfig?.instructions?.cname || "cname.qicmart.com"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">{t("type")}</p>
                                    <p className="text-xs font-bold text-indigo-400">CNAME</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>({
        name: "", slug: "", description: "", logo: null, 
        currency: "INR", favicon: null, banner: null, banners: [],
        fontFamily: "Inter", fontStyle: "modern", primaryColor: "purple", menuAlignment: "left",
        upiId: "", upiName: "", isUpiEnabled: false,
        whatsappNumber: "", whatsappMessage: "", isWhatsappEnabled: false,
        showAnnouncement: false, announcementText: "", announcementBg: "#000000", announcementColor: "#ffffff",
        instagramUrl: "", facebookUrl: "", twitterUrl: "", linkedinUrl: "", youtubeUrl: "",
        timezone: "Asia/Kolkata", language: "English",
        footerText: ""
    })
    const [initialSettings, setInitialSettings] = useState<StoreSettings | null>(null)
    const [lastSaved, setLastSaved] = useState<string | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("branding")
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
    const { data: session } = useSession()
    const { t } = useDashboardStore()

    // Media Modal State
    const [modalOpen, setModalOpen] = useState(false)
    const [activeField, setActiveField] = useState<keyof StoreSettings | "newBanner" | null>(null)
    const [selectingForBanner, setSelectingForBanner] = useState<string | null>(null)
    const [showMediaLibrary, setShowMediaLibrary] = useState(false)
    const [showCountrySelector, setShowCountrySelector] = useState(false)

    const countries = [
        { code: "91", iso: "in", name: "India" },
        { code: "1", iso: "us", name: "USA" },
        { code: "44", iso: "gb", name: "UK" },
        { code: "971", iso: "ae", name: "UAE" },
        { code: "65", iso: "sg", name: "Singapore" },
        { code: "61", iso: "au", name: "Australia" },
        { code: "33", iso: "fr", name: "France" },
        { code: "49", iso: "de", name: "Germany" },
        { code: "81", iso: "jp", name: "Japan" },
        { code: "86", iso: "cn", name: "China" },
    ]

    // Domain State
    const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [newDomain, setNewDomain] = useState("")
    const [domainError, setDomainError] = useState<string | null>(null)
    const [domainSaving, setDomainSaving] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showStoreDeleteModal, setShowStoreDeleteModal] = useState(false)
    const [showStoreDataDeleteModal, setShowStoreDataDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [resetting, setResetting] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"

        fetch(url)
            .then(r => r.json())
            .then(data => {
                const loadedSettings: StoreSettings = {
                    name: data.name || "",
                    slug: data.slug || "",
                    description: data.description || "",
                    logo: data.logo || null,
                    currency: data.currency || "INR",
                    favicon: data.favicon || null,
                    banner: data.banner || null,
                    banners: data.banners || [],
                    fontFamily: data.fontFamily || "Inter",
                    fontStyle: data.fontStyle || "modern",
                    primaryColor: data.primaryColor || "purple",
                    menuAlignment: data.menuAlignment || "left",
                    razorpayKeyId: data.razorpayKeyId || "",
                    razorpayKeySecret: data.razorpayKeySecret || "",
                    razorpayWebhookSecret: data.razorpayWebhookSecret || "",
                    isRazorpayEnabled: data.isRazorpayEnabled || false,
                    upiId: data.upiId || "",
                    upiName: data.upiName || "",
                    isUpiEnabled: data.isUpiEnabled || false,
                    whatsappNumber: data.whatsappNumber || "",
                    whatsappMessage: data.whatsappMessage || "",
                    isWhatsappEnabled: data.isWhatsappEnabled || false,
                    showAnnouncement: data.showAnnouncement || false,
                    announcementText: data.announcementText || "",
                    announcementBg: data.announcementBg || "#000000",
                    announcementColor: data.announcementColor || "#ffffff",
                    instagramUrl: data.instagramUrl || "",
                    facebookUrl: data.facebookUrl || "",
                    twitterUrl: data.twitterUrl || "",
                    linkedinUrl: data.linkedinUrl || "",
                    youtubeUrl: data.youtubeUrl || "",
                    timezone: data.timezone || "Asia/Kolkata",
                    language: data.language || "English",
                    footerText: data.footerText || "",
                }
                setSettings(loadedSettings)
                setInitialSettings(loadedSettings)
                setLoading(false)
            })
        
        // Fetch domain config
        fetch("/api/dashboard/domains")
            .then(r => r.json())
            .then(data => setDomainConfig(data))
            .catch(() => {})
    }, [])

    // Auto-save logic
    useEffect(() => {
        if (!initialSettings) return;
        
        const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
        setIsDirty(hasChanged);

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleAutoSave();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [settings]);

    const handleAutoSave = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"

        setSaving(true)
        setError(null)
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                setInitialSettings(settings)
                setSaved(true)
                setLastSaved(new Date().toLocaleTimeString())
                setTimeout(() => setSaved(false), 2000)
            } else {
                const data = await res.json()
                setError(data.error || "Failed to auto-save")
            }
        } catch (e) {
            setError("Network error during auto-save")
        } finally {
            setSaving(false)
        }
    }

    const handleSave = async () => {
        // Manual save if needed, but we'll mostly use auto-save
        await handleAutoSave();
    }

    const update = (key: keyof StoreSettings, val: any) => setSettings(s => ({ ...s, [key]: val }))

    const openMediaLibrary = (field: keyof StoreSettings | "newBanner", bannerId: string | null = null) => {
        setActiveField(field)
        setEditingBannerId(bannerId)
        setModalOpen(true)
    }

    const handleMediaSelect = (url: string) => {
        if (activeField === "newBanner" && editingBannerId) {
            const updatedBanners = settings.banners.map(b => 
                b.id === editingBannerId ? { ...b, image: url } : b
            )
            update("banners", updatedBanners)
        } else if (activeField && activeField !== "newBanner") {
            update(activeField, url)
        }
        setModalOpen(false)
        setActiveField(null)
        setEditingBannerId(null)
    }

    const addBanner = () => {
        if (settings.banners.length >= 5) return
        const newBanner: Banner = {
            id: Math.random().toString(36).substr(2, 9),
            image: "",
            title: "New Banner",
            subtitle: "Enter text here",
            buttonText: "Shop Now",
            buttonLink: "/products",
            titleColor: "#ffffff",
            subtitleColor: "#ffffff",
            btnColor: "#ffffff",
            btnTextColor: "#000000",
            textAlign: "center",
            showOverlay: true
        }
        update("banners", [...settings.banners, newBanner])
        setEditingBannerId(newBanner.id)
    }

    const updateBanner = (id: string, key: keyof Banner, value: any) => {
        const newBanners = settings.banners.map(b => 
            b.id === id ? { ...b, [key]: value } : b
        )
        update("banners", newBanners)
    }

    const removeBanner = (id: string) => {
        update("banners", settings.banners.filter(b => b.id !== id))
    }

    // Domain Functions
    const handleSaveDomain = async () => {
        if (!newDomain) return
        setDomainSaving(true)
        setDomainError(null)
        try {
            const res = await fetch("/api/dashboard/domains", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customDomain: newDomain })
            })
            const data = await res.json()
            if (res.ok) {
                const updatedRes = await fetch("/api/dashboard/domains")
                const updatedData = await updatedRes.json()
                setDomainConfig(updatedData)
                setNewDomain("")
            } else {
                setDomainError(data.error)
            }
        } catch (e) {
            setDomainError("Failed to update domain")
        }
        setDomainSaving(false)
    }

    const handleVerifyDomain = async () => {
        setVerifying(true)
        try {
            const res = await fetch("/api/dashboard/domains/verify", { method: "POST" })
            const data = await res.json()
            if (res.ok && data.verified) {
                const updatedRes = await fetch("/api/dashboard/domains")
                const updatedData = await updatedRes.json()
                setDomainConfig(updatedData)
            } else {
                setDomainError(data.error || "Verification failed")
            }
        } catch (e) {
            setDomainError("Verification failed")
        }
        setVerifying(false)
    }

    const confirmRemoveDomain = async () => {
        setDeleting(true)
        try {
            const res = await fetch("/api/dashboard/domains", { method: "DELETE" })
            if (res.ok) {
                const updatedRes = await fetch("/api/dashboard/domains")
                const updatedData = await updatedRes.json()
                setDomainConfig(updatedData)
                setShowDeleteModal(false)
            }
        } catch (e) {
            console.error("Failed to remove domain", e)
        }
        setDeleting(false)
    }

    const handleRemoveDomain = () => {
        setShowDeleteModal(true)
    }

    const handleDeleteStore = async () => {
        setDeleting(true)
        setError(null)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"

            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                window.location.href = "/" // Redirect to landing page after deletion
            } else {
                const data = await res.json()
                setError(data.error || "Failed to delete store")
                setShowStoreDeleteModal(false)
            }
        } catch (e: any) {
            setError(e.message || "An error occurred during deletion")
            setShowStoreDeleteModal(false)
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteStoreData = async () => {
        setResetting(true)
        setError(null)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/settings/data?ownerId=${ownerId}` : "/api/dashboard/settings/data"

            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                setShowStoreDataDeleteModal(false)
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
                // Optionally reload or redirect
                window.location.reload()
            } else {
                const data = await res.json()
                setError(data.error || "Failed to erase store data")
                setShowStoreDataDeleteModal(false)
            }
        } catch (e: any) {
            setError(e.message || "An error occurred during reset")
            setShowStoreDataDeleteModal(false)
        } finally {
            setResetting(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-zinc-500">
            <Loader2 className="animate-spin text-purple-500" size={32} /> 
            <p className="font-medium tracking-tight">{t("loadingSettings")}</p>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Action Bar (Top) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">{settings.name || t("storeSettings")}</h1>
                        <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold capitalize border border-emerald-500/20 whitespace-nowrap">
                            {t("statusLive")}
                        </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{t("manageStore")}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                        {saving ? (
                            <div className="flex items-center gap-2 text-indigo-500 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("savingChanges")}</span>
                            </div>
                        ) : saved ? (
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 animate-in fade-in zoom-in duration-300">
                                <Check size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("allChangesSaved")}</span>
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/10">
                                <RefreshCw size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("unsavedChanges")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl border border-transparent">
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("lastSaved")} {lastSaved || t("recently")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="flex bg-zinc-100/80 dark:bg-zinc-800/50 p-1.5 rounded-[22px] backdrop-blur-md border border-white/5 shadow-inner">
                {[
                    { id: "branding", label: "Branding", icon: Store },
                    { id: "appearance", label: "Appearance & Design", icon: ImageIcon },
                    { id: "features", label: "Features & Marketing", icon: MessageCircle },
                    { id: "preferences", label: "Store Preferences", icon: SettingsIcon },
                    { id: "domain", label: "Domain", icon: Globe },
                    { id: "danger", label: "Danger Zone", icon: AlertCircle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? tab.id === 'danger' ? "text-white" : "text-indigo-600 dark:text-white" 
                            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="activeTab"
                                className={`absolute inset-0 shadow-sm rounded-xl border ${
                                    tab.id === 'danger' 
                                    ? "bg-zinc-800 border-zinc-700" 
                                    : "bg-white dark:bg-zinc-700 border-zinc-100 dark:border-zinc-600"
                                }`}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon size={16} className="relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === "branding" && (
                        <BrandingTab 
                            key="branding"
                            settings={settings} 
                            update={update} 
                            openMediaLibrary={openMediaLibrary}
                        />
                    )}
                    {activeTab === "appearance" && (
                        <AppearanceTab 
                            key="appearance"
                            settings={settings} 
                            update={update} 
                            openMediaLibrary={openMediaLibrary}
                            banners={settings.banners}
                            addBanner={addBanner}
                            updateBanner={updateBanner}
                            removeBanner={removeBanner}
                            editingBannerId={editingBannerId}
                            setEditingBannerId={setEditingBannerId}
                        />
                    )}
                    {activeTab === "features" && (
                        <FeaturesTab 
                            key="features"
                            settings={settings} 
                            update={update} 
                            openMediaLibrary={openMediaLibrary}
                        />
                    )}
                    {activeTab === "preferences" && (
                        <PreferencesTab 
                            key="preferences"
                            settings={settings} 
                            update={update} 
                        />
                    )}
                    {activeTab === "domain" && (
                        <DomainTab 
                            key="domain"
                            domainConfig={domainConfig}
                            newDomain={newDomain}
                            setNewDomain={setNewDomain}
                            handleSaveDomain={handleSaveDomain}
                            handleVerifyDomain={handleVerifyDomain}
                            handleRemoveDomain={handleRemoveDomain}
                            domainSaving={domainSaving}
                            verifying={verifying}
                            domainError={domainError}
                        />
                    )}
                    {activeTab === "danger" && (
                        <DangerTab 
                            key="danger"
                            setShowStoreDeleteModal={setShowStoreDeleteModal}
                            setShowStoreDataDeleteModal={setShowStoreDataDeleteModal}
                        />
                    )}
                </AnimatePresence>
            </div>


            {/* Action Bar (Bottom) */}
            <div className="flex items-center justify-end pt-8 mt-12 border-t border-zinc-100 dark:border-zinc-800">
                <button
                     onClick={handleSave}
                     disabled={saving}
                     className={`w-full sm:w-auto group flex items-center justify-center gap-3 px-8 sm:px-12 py-4 rounded-2xl text-sm font-bold capitalize transition-all shadow-xl active:scale-95 ${
                         saved ? "bg-emerald-500 text-white" : "bg-indigo-600 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-indigo-500/10"
                     } disabled:opacity-60`}
                 >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <><Check size={18} /> {t("saved")}</> : <>{t("saveChanges")} <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /></>}
                </button>
            </div>

            {/* Space at bottom */}
            <div className="h-12" />

            {/* Media Library Modal */}
            <MediaLibraryModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleMediaSelect}
                title={t("selectMedia")}
            />

            {/* Remove Domain Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmRemoveDomain}
                loading={deleting}
                title={t("removeDomainTitle")}
                description={t("removeDomainDesc")}
            />

            {/* Delete Store Modal */}
            <DeleteConfirmationModal
                isOpen={showStoreDeleteModal}
                onClose={() => setShowStoreDeleteModal(false)}
                onConfirm={handleDeleteStore}
                loading={deleting}
                confirmationValue={settings.slug}
                title={`Confirm deletion of ${settings.slug}`}
                description={`This will permanently delete the ${settings.slug} store and all of its database configuration.`}
                confirmText="I understand, delete this store"
            />

            {/* Delete Store Data Modal */}
            <DeleteConfirmationModal
                isOpen={showStoreDataDeleteModal}
                onClose={() => setShowStoreDataDeleteModal(false)}
                onConfirm={handleDeleteStoreData}
                loading={resetting}
                actionType="reset"
                dangerText="All products, orders, and customers will be erased."
                title={`Reset data for ${settings.name}`}
                description={`This will wipe all inventory, sales, and shopper data for ${settings.name}. This action is irreversible.`}
                confirmText="Yes, erase all store data"
            />
        </div>
    )
}
