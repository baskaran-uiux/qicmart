"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, X, ChevronRight, Settings } from "lucide-react"

const COOKIE_KEY = "qicmart-cookie-consent"

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [showCustomize, setShowCustomize] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY)
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem(COOKIE_KEY, "accepted")
        setIsVisible(false)
    }

    const handleReject = () => {
        localStorage.setItem(COOKIE_KEY, "rejected")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] z-[9999] font-outfit"
                >
                    <div className="relative group">
                        {/* Background with Glassmorphism */}
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-2xl shadow-black/50" />
                        
                        {/* Interactive Content */}
                        <div className="relative p-6 space-y-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg tracking-tight">Privacy Check</h3>
                                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-none mt-1">Compliance & Safety</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="p-1 text-zinc-600 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                We use cookies to optimize your platform experience, analyze performance, and deliver personalized retail insights.
                            </p>

                            <div className="grid grid-cols-2 gap-3 items-center pt-2">
                                <button
                                    onClick={handleAccept}
                                    className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                                >
                                    Accept All
                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-5 py-3.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 font-bold text-[13px] rounded-2xl border border-white/5 transition-all active:scale-95"
                                >
                                    Reject
                                </button>
                            </div>

                            <button
                                onClick={() => setShowCustomize(!showCustomize)}
                                className="w-full py-2 text-[11px] font-bold text-zinc-500 hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
                            >
                                <Settings size={12} />
                                Customize Preferences
                            </button>

                            {/* Nested Customize View */}
                            <AnimatePresence>
                                {showCustomize && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-white/5 pt-4 space-y-3"
                                    >
                                        <CookieToggle label="Necessary" description="Essential for site logic" disabled />
                                        <CookieToggle label="Analytics" description="Help us grow better" defaultChecked />
                                        <CookieToggle label="Marketing" description="Relevant offers only" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function CookieToggle({ label, description, disabled, defaultChecked }: { label: string; description: string; disabled?: boolean; defaultChecked?: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-zinc-500">{description}</p>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${disabled || defaultChecked ? "bg-indigo-600" : "bg-zinc-800"}`}>
                <div className={`absolute top-1 left-1 w-2 h-2 rounded-full bg-white transition-transform ${disabled || defaultChecked ? "translate-x-4" : ""}`} />
            </div>
        </div>
    )
}
