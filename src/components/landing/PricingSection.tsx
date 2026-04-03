"use client"

import { useState } from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Check, User, Rocket, Globe, ArrowRight } from "lucide-react"
import LoginButton from "@/components/auth/LoginButton"
import { PricingInquiryModal } from "@/components/landing/PricingInquiryModal"

const plans = [
    {
        name: "Professional Plan",
        desc: "Optimized for Scaling Businesses",
        monthlyPrice: "LAUNCHING",
        yearlyPrice: "COMING SOON",
        icon: Rocket,
        features: ["AI Magic Studio", "Priority Node Access", "Advanced Fraud Shield", "Custom Domain Integration", "Multi-Currency Support"],
        color: "purple"
    },
    {
        name: "Starter Plan",
        desc: "Perfect for Small Teams and Startups",
        monthlyPrice: "₹399",
        yearlyPrice: "₹3,990",
        icon: User,
        features: ["Unlimited Product Listings", "Advanced Order Management", "Inventory Tracking", "Detailed Analytics", "Coupons & CRM"],
        highlight: true,
        color: "indigo"
    },
    {
        name: "Enterprise Plan",
        desc: "Solutions for Large Organizations",
        monthlyPrice: "Custom",
        yearlyPrice: "Custom",
        icon: Globe,
        features: ["Unlimited Node Access", "Dedicated Hardware", "24/7 Rapid Response", "Custom Infrastructure", "SLA Guarantee"],
        color: "emerald"
    }
]

export default function PricingSection() {
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")
    const [isInquiryOpen, setIsInquiryOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState({ name: '', price: '' })

    const handleInquiry = (plan: any) => {
        const price = period === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
        const message = `Hello Qicmart!\n\nI am interested in deploying the ${plan.name.toUpperCase()} (${price}).\n\nPlease assist me with the infrastructure setup and next steps.`
        
        const whatsappUrl = `https://wa.me/918072171027?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <section id="pricing" className="py-16 md:py-32 relative overflow-hidden bg-[#020205]">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <Motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-mono tracking-[0.1em] text-zinc-400">Pricing_Models_v2</span>
                    </Motion.div>
                    <Motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-7xl font-bold text-white mb-6"
                    >
                        Flexible Pricing Plans
                    </Motion.h2>
                    <Motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 max-w-2xl mx-auto mb-12 text-lg leading-relaxed"
                    >
                        Transparent pricing for businesses of all sizes. Scale your infrastructure as you grow with our planetary-scale edge network.
                    </Motion.p>
 
                    {/* Toggle */}
                    <div className="flex justify-center mb-10 md:mb-20">
                        <div className="relative p-1 bg-white/5 rounded-2xl border border-white/10 flex items-center">
                            <Motion.div
                                className="absolute bg-indigo-600 rounded-xl h-[calc(100%-8px)]"
                                initial={false}
                                animate={{
                                    x: period === "monthly" ? 0 : "100%",
                                    width: "calc(50%)"
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => setPeriod("monthly")}
                                className={`relative z-10 px-8 py-3 rounded-xl transition-colors text-sm font-bold w-32 ${period === "monthly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPeriod("yearly")}
                                className={`relative z-10 px-8 py-3 rounded-xl transition-colors text-sm font-bold w-32 ${period === "yearly" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                </Motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, i) => (
                        <Motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className={`p-6 md:p-10 rounded-3xl md:rounded-[40px] bg-white/[0.03] border transition-all duration-500 hover:bg-white/[0.05] flex flex-col h-full group relative ${
                                plan.highlight 
                                    ? "border-indigo-500/50 shadow-[0_0_50px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/20" 
                                    : "border-white/5 hover:border-white/10"
                            }`}
                        >
                            {/* ... (card content stays the same) */}
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <span className="bg-indigo-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                                        Recommended Node
                                    </span>
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                                plan.highlight ? "bg-indigo-600/20 text-indigo-400" : "bg-white/5 text-zinc-400"
                            }`}>
                                <plan.icon size={28} />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-zinc-500 text-sm mb-8">{plan.desc}</p>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                    {period === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                                </span>
                                {(plan.monthlyPrice.includes("₹") || plan.monthlyPrice === "Custom") && (
                                    <span className="text-zinc-500 font-medium font-mono text-sm uppercase">
                                        / {period === "monthly" ? "month" : "year"}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 mb-12">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                                        <div className={`w-1.5 h-1.5 rounded-full ${plan.highlight ? "bg-indigo-500" : "bg-zinc-700"}`} />
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <LoginButton 
                                    label={plan.name === "Starter Plan" ? "START NOW ₹399" : (plan.monthlyPrice.includes("LAUNCH") ? "Stay Notified" : (plan.monthlyPrice === "Custom" ? "Contact us" : "Explore plan"))}
                                    variant={plan.name === "Starter Plan" ? "sparkle" : "default"}
                                    style={plan.name === "Starter Plan" ? { "--sparkle-bg": "#8b5cf6" } as React.CSSProperties : undefined}
                                    showIcon={false}
                                    onClick={() => handleInquiry(plan)}
                                    className={`${
                                        plan.highlight && plan.name !== "Starter Plan"
                                            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:shadow-[0_0_45px_rgba(168,85,247,0.8)]" 
                                            : (plan.name === "Starter Plan" ? "shadow-none hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]" : "bg-white/5 text-white hover:bg-white/10 border border-white/10")
                                    } !rounded-2xl transition-all duration-300 border-none`}
                                />
                            </div>
                        </Motion.div>
                    ))}
                </div>
            </div>

            <PricingInquiryModal 
                isOpen={isInquiryOpen}
                onClose={() => setIsInquiryOpen(false)}
                planName={selectedPlan.name}
                planPrice={selectedPlan.price}
            />
        </section>
    )
}
