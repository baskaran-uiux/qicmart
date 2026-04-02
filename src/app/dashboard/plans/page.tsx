"use client"

import { useState } from "react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { Crown, Zap, CheckCircle2, ShieldCheck, ShoppingBag, Users, HardDrive, CreditCard, Star, Layout, Mail, Ticket, BarChart2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import PremiumButton from "@/components/dashboard/PremiumButton"

export default function PlansPage() {
    const { subscription } = useDashboardStore()
    const currentPlan = subscription?.plan || "Normal"
    const maxProducts = subscription?.maxProducts || 100
    const [isYearly, setIsYearly] = useState(true)

    const plans = [
        {
            name: "Standard",
            monthlyPrice: 399,
            yearlyPrice: 2999,
            desc: "Everything you need to run and grow your online brand.",
            icon: Zap,
            color: "indigo",
            features: [
                { label: "Unlimited Product Listings", active: true },
                { label: "Advanced Order Management", active: true },
                { label: "Inventory Tracking & Alerts", active: true },
                { label: "Detailed Analytics & Reports", active: true },
                { label: "Coupons & Promotion Tools", active: true },
                { label: "Newsletter & Customer CRM", active: true },
                { label: "Customer Reviews System", active: true },
                { label: "Blogs & Custom Pages", active: true },
                { label: "Media Library & Storage", active: true },
                { label: "Premium Plugins Access", active: true },
                { label: "Priority Email Support", active: true },
            ]
        },
        {
            name: "Pro",
            comingSoon: true,
            desc: "Pro plan develop pannitu erukom. Stay tuned for advanced AI features!",
            icon: Crown,
            color: "amber",
            features: []
        }
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-4 pb-20">
            {/* Current Plan Banner - Now at the Top */}
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
                    <div className={`p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-xl shadow-indigo-500/10 border border-indigo-500/10`}>
                        <Zap size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="text-xs font-semibold capitalize tracking-wide text-zinc-500">Currently managing as</span>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-semibold capitalize tracking-wide border border-indigo-500/20">Standard Plan</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">Active Membership</h3>
                    </div>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                    <PremiumButton 
                        href="https://wa.me/918072171027?text=Hi, I would like to discuss about QICMART store plans." 
                    >
                        Plan Details
                    </PremiumButton>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 pb-10 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[32px] font-black tracking-tight text-black dark:text-white capitalize">Your Growth Plan</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-[14px] sm:text-[16px] font-medium tracking-normal">Comprehensive tools to build and scale your business.</p>
                </div>

                {/* Billing Toggle - Centralized and Prominent */}
                <div className="pt-4">
                    <div className="flex items-center gap-6 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-inner">
                        <button 
                            onClick={() => setIsYearly(false)}
                            className={`relative px-8 py-3.5 rounded-2xl text-[12px] font-black transition-all ${!isYearly ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-xl" : "text-zinc-400 hover:text-zinc-600"}`}
                        >
                            Monthly
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setIsYearly(true)}
                                className={`relative px-8 py-3.5 rounded-2xl text-[12px] font-black transition-all flex items-center gap-2 ${isYearly ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-zinc-400 hover:text-zinc-600"}`}
                            >
                                Yearly
                            </button>
                            {/* Prominent Save Badge */}
                            <div className="absolute -top-6 -right-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-xl shadow-emerald-500/20 border-2 border-white dark:border-zinc-900 rotate-12 transform hover:scale-110 transition-transform">
                                SAVE 37% 🚀
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map((p) => {
                    const price = isYearly ? p.yearlyPrice : p.monthlyPrice
                    const isActive = p.name === "Standard" // Since user wants normal/standard to be the main one

                    return (
                        <div 
                            key={p.name} 
                            className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${isActive ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-zinc-200 dark:shadow-black ring-2 ring-black/5 dark:ring-white/5' : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800'}`}
                        >
                            {isActive && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-semibold capitalize tracking-wide shadow-xl shadow-indigo-500/10">
                                    Recommended for Growth
                                </div>
                            )}
                            
                            <div className="mb-8">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${p.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                                    <p.icon size={24} />
                                </div>
                                <h3 className="text-[22px] font-bold text-zinc-900 dark:text-white">{p.name}</h3>
                                <p className="text-[12px] font-medium text-zinc-500 mt-1 leading-relaxed">{p.desc}</p>
                            </div>

                            <div className="mb-10">
                                {p.comingSoon ? (
                                    <div className="py-4 px-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
                                        <p className="text-xl font-bold text-zinc-400">Under Development</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[42px] font-black text-zinc-900 dark:text-white tracking-tighter">₹{price?.toLocaleString()}</span>
                                            <span className="text-[14px] font-bold text-zinc-400 capitalize">/ {isYearly ? "year" : "month"}</span>
                                        </div>
                                        {isYearly && (
                                            <p className="text-[11px] font-bold text-emerald-500 mt-1">₹{Math.floor(p.yearlyPrice! / 12)} / month billed annually</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {p.features.length > 0 && (
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 font-poppins">Standard Features</p>
                                    <ul className="space-y-4 mb-12">
                                        {p.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <div className="mt-0.5 p-0.5 bg-indigo-500/10 rounded-full">
                                                    <CheckCircle2 size={16} className="text-indigo-600" />
                                                </div>
                                                <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 leading-tight">{f.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-auto">
                                {p.comingSoon ? (
                                    <PremiumButton 
                                        className="w-full"
                                        disabled
                                        icon={Zap}
                                    >
                                        Coming Soon
                                    </PremiumButton>
                                ) : (
                                    <PremiumButton 
                                        href={`https://wa.me/918072171027?text=Hi, I would like to get the ${p.name} (${isYearly ? "Yearly" : "Monthly"}) plan for my QICMART store.`}
                                        className="w-full"
                                    >
                                        Subscribe to {p.name}
                                    </PremiumButton>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {[
                    { label: "Products", value: `Unlimited`, icon: ShoppingBag, color: "text-purple-500 dark:text-purple-400" },
                    { label: "Inventory", value: "Enabled", icon: HardDrive, color: "text-emerald-500 dark:text-emerald-400" },
                    { label: "Analytics", value: "Advanced", icon: BarChart2, color: "text-amber-500 dark:text-amber-400" },
                    { label: "Status", value: "Standard", icon: Star, color: "text-rose-500 dark:text-rose-400" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                        <div className={`p-2 w-fit rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4 transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
