"use client"

import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { Crown, Zap, CheckCircle2, ShieldCheck, ShoppingBag, Users, HardDrive, CreditCard } from "lucide-react"

export default function PlansPage() {
    const { subscription } = useDashboardStore()
    const currentPlan = subscription?.plan || "Normal"
    const maxProducts = subscription?.maxProducts || 100

    const plans = [
        {
            name: "Normal",
            price: "₹0",
            desc: "Everything you need to start your online journey.",
            icon: Zap,
            color: "zinc",
            features: [
                { label: `${maxProducts} Product Listings`, active: true },
                { label: "Basic Analytics", active: true },
                { label: "Standard Storefront Theme", active: true },
                { label: "Simple Product Types Only", active: true },
                { label: "Custom Domain Support", active: false },
                { label: "Advanced Logistics Control", active: false },
                { label: "Staff Accounts", active: false },
            ]
        },
        {
            name: "Pro",
            price: "₹1,999/mo",
            desc: "Professional tools for scaling your growing business.",
            icon: Crown,
            color: "amber",
            features: [
                { label: "Unlimited Product Listings", active: true },
                { label: "Advanced AI-Powered Analytics", active: true },
                { label: "Premium Themes & Customization", active: true },
                { label: "Variable Product Support", active: true },
                { label: "Custom Domain Support", active: true },
                { label: "Advanced Logistics & Shipping", active: true },
                { label: "Multi-Staff Accounts", active: true },
                { label: "Priority Support 24/7", active: true },
            ]
        }
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Your Growth Plan</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Simple pricing to grow your business.</p>
                </div>
            </div>

            {/* Current Plan Banner */}
            <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${currentPlan === 'Pro' ? 'bg-amber-500/10 text-amber-500 shadow-xl shadow-amber-500/10' : 'bg-indigo-500/10 text-indigo-500 shadow-xl shadow-indigo-500/10'} border border-black/5 dark:border-white/5`}>
                        {currentPlan === 'Pro' ? <Crown size={32} strokeWidth={2.5} /> : <Zap size={32} strokeWidth={2.5} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold capitalize tracking-wide text-zinc-500">Current active plan</span>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-semibold capitalize tracking-wide border border-indigo-500/20">Active</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{currentPlan} Membership</h3>
                    </div>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                    <a 
                        href="https://wa.me/918072171027?text=Hi, I would like to upgrade my NamMart store plan." 
                        target="_blank"
                        className="block w-full px-8 py-4 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-xs capitalize tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-all text-center shadow-indigo-500/10"
                    >
                        Upgrade Benefits
                    </a>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                {plans.map((p) => (
                    <div key={p.name} className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 ${p.name === currentPlan ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-zinc-200 dark:shadow-black ring-2 ring-black/5 dark:ring-white/5' : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
                        {p.name === currentPlan && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-semibold capitalize tracking-wide shadow-xl shadow-indigo-500/10">
                                Your current plan
                            </div>
                        )}
                        
                        <div className="mb-8">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${p.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                                <p.icon size={24} />
                            </div>
                            <h3 className="text-[22px] font-bold text-zinc-900 dark:text-white">{p.name}</h3>
                            <p className="text-[12px] font-medium text-zinc-500 mt-1">{p.desc}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mt-6">
                            <span className="text-[32px] font-bold text-zinc-900 dark:text-white">{p.price}</span>
                            <span className="text-[14px] font-medium text-zinc-500">/month</span>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {p.features.map((f, i) => (
                                <li key={i} className={`flex items-center gap-3 text-[14px] font-medium ${f.active ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600 line-through decoration-zinc-300 dark:decoration-zinc-800'}`}>
                                    <CheckCircle2 size={16} className={f.active ? 'text-indigo-600' : 'text-zinc-300 dark:text-zinc-800'} />
                                    <span className="font-semibold">{f.label}</span>
                                </li>
                            ))}
                        </ul>

                        {p.name === currentPlan ? (
                            <button disabled className="w-full py-4 rounded-2xl font-semibold text-xs capitalize tracking-wide transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-zinc-700">
                                Current Active Plan
                            </button>
                        ) : (
                            <a 
                                href={`https://wa.me/918072171027?text=Hi, I would like to get the ${p.name} plan for my NamMart store.`}
                                target="_blank"
                                className="block w-full py-4 rounded-2xl font-semibold text-xs capitalize tracking-wide bg-indigo-600 dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-xl shadow-indigo-500/10 text-center"
                            >
                                Get {p.name}
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {[
                    { label: "Products", value: `${maxProducts === 100 ? "0/100" : "Unlimited"}`, icon: ShoppingBag, color: "text-purple-500 dark:text-purple-400" },
                    { label: "Staff", value: "0 / 1", icon: Users, color: "text-blue-500 dark:text-blue-400" },
                    { label: "Storage", value: "0 MB / 5GB", icon: HardDrive, color: "text-emerald-500 dark:text-emerald-400" },
                    { label: "Billing Status", value: "Active", icon: CreditCard, color: "text-rose-500 dark:text-rose-400" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                        <div className={`p-2 w-fit rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-4 transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                        <div className="text-xs font-semibold capitalize tracking-wide text-zinc-500 mb-1">{stat.label}</div>
                        <div className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
