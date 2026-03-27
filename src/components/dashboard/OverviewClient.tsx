"use client"

import { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Copy, ExternalLink, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface OverviewClientProps {
    storeUrl: string
    planName: string
}

export default function OverviewClient({ storeUrl, planName }: OverviewClientProps) {
    const { t } = useDashboardStore()
    const handleCopy = () => {
        navigator.clipboard.writeText(storeUrl)
        toast.success(t("linkCopied"))
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Store QR Code card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm flex flex-col sm:flex-row items-center gap-8 group">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <QRCodeCanvas 
                        value={storeUrl}
                        size={160}
                        level="H"
                        includeMargin={false}
                        className="dark:invert dark:contrast-125"
                    />
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight italic mb-2">{t("storeQrCode")}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{t("scanToVisit")}</p>
                    </div>
                    
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <span className="flex-1 text-xs font-bold text-zinc-400 truncate">{storeUrl}</span>
                            <button 
                                onClick={handleCopy}
                                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-indigo-600"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <a 
                            href={storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-black dark:hover:opacity-90 active:scale-95 shadow-xl shadow-zinc-900/10"
                        >
                            <ExternalLink size={14} />
                            {t("openStore")}
                        </a>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Subscription Info card */}
            <div className="bg-indigo-600 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group border border-indigo-400/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter italic uppercase text-white mb-2 leading-none">{t("empireStatus")}</h3>
                            <p className="text-indigo-100/70 text-sm font-medium tracking-tight">{t("storeIsActive")}</p>
                        </div>
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-[10px] font-black uppercase text-white tracking-widest">
                            {planName} {t("member")}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/50 mb-1">{t("salesGoal")}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-black text-white">84%</p>
                                <TrendingUpUI size={16} className="text-emerald-400" />
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-emerald-400 h-full w-[84%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                            </div>
                        </div>
                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100/50 mb-1">{t("storeHealth")}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-black text-white">{t("excellent")}</p>
                                <CheckCircle size={16} className="text-white" />
                            </div>
                            <p className="text-[8px] font-bold text-white/40 mt-3 uppercase tracking-widest">{t("everythingIsPerfect")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TrendingUpUI({ size, className }: { size: number, className?: string }) {
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
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
