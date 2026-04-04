"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Ticket, X, Copy, Check, Sparkles } from "lucide-react"

interface Coupon {
    id: string
    code: string
    discountType: 'PERCENTAGE' | 'FIXED'
    discountValue: number
}

export default function CouponPopup({ storeId, currency }: { storeId: string; currency: string }) {
    const [coupon, setCoupon] = useState<Coupon | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!storeId) return

        // Check if shown in this session
        const isShown = sessionStorage.getItem(`coupon_popup_${storeId}`)
        if (isShown) return

        const fetchCoupon = async () => {
            try {
                const res = await fetch(`/api/coupons?storeId=${storeId}`)
                const data = await res.json()
                if (data && data.length > 0) {
                    // Get the best coupon (highest discount)
                    setCoupon(data[0])
                    // Show after a short delay
                    setTimeout(() => {
                        setIsOpen(true)
                        sessionStorage.setItem(`coupon_popup_${storeId}`, "true")
                    }, 3000)
                }
            } catch (err) {
                console.error("Failed to fetch coupon popup:", err)
            }
        }

        fetchCoupon()
    }, [storeId])

    const handleCopy = () => {
        if (!coupon) return
        navigator.clipboard.writeText(coupon.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!coupon) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden pointer-events-auto"
                    >
                        <div className="relative p-8 text-center">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles size={32} />
                            </div>

                            <h3 className="text-[24px] font-bold text-black dark:text-white tracking-tight mb-1">Exclusive Offer!</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[14px] font-medium mb-8">Enjoy a special discount on your purchase today.</p>

                            <div className="bg-zinc-50 dark:bg-zinc-950/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[24px] p-6 mb-8 relative group">
                                <div className="flex flex-col items-center gap-1 mb-4">
                                    <span className="text-[42px] font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${currency === 'MYR' ? 'RM' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'}${coupon.discountValue}`}
                                    </span>
                                    <span className="text-[12px] font-bold text-zinc-400">Discount Applied</span>
                                </div>
                                
                                <button 
                                    onClick={handleCopy}
                                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                                >
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    {copied ? "Copied to clipboard" : coupon.code}
                                </button>
                            </div>

                            <p className="text-[11px] font-bold text-zinc-400">Use this code at checkout to save</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
