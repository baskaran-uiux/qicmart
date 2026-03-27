"use client"

import { ReactNode } from "react"
import { CheckCircle2, Circle, ArrowRight, Package, CreditCard, Layout, Star, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import * as Motion from "framer-motion/client"

interface StepProps {
    title: string
    description: string
    icon: any
    isCompleted: boolean
    href: string
    actionLabel: string
}

function Step({ title, description, icon: Icon, isCompleted, href, actionLabel }: StepProps) {
    return (
        <div className={`p-6 rounded-[24px] border transition-all duration-300 ${
            isCompleted 
            ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/5 dark:border-emerald-500/20" 
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 shadow-sm"
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCompleted ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            {title}
                            {isCompleted && <CheckCircle2 size={18} className="text-emerald-500" />}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
                    </div>
                </div>
                {!isCompleted && (
                    <Link 
                        href={href}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        {actionLabel} <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    )
}

export default function SetupGuide({ 
    storeName, 
    hasProducts, 
    hasPayment 
}: { 
    storeName: string, 
    hasProducts: boolean, 
    hasPayment: boolean 
}) {
    const steps = [
        {
            title: "Store Identity",
            description: "Give your store a unique name and personality.",
            icon: Layout,
            isCompleted: !!storeName && storeName.length >= 3,
            href: "/dashboard/settings",
            actionLabel: "Set Name"
        },
        {
            title: "Add your first product",
            description: "Enthusiastically add items to your inventory to start selling.",
            icon: Package,
            isCompleted: hasProducts,
            href: "/dashboard/products",
            actionLabel: "Add Product"
        },
        {
            title: "Configure Payments",
            description: "Connect UPI or Razorpay to receive payments from customers.",
            icon: CreditCard,
            isCompleted: hasPayment,
            href: "/dashboard/payment",
            actionLabel: "Setup Payments"
        }
    ]

    const completedSteps = steps.filter(s => s.isCompleted).length
    const progress = Math.round((completedSteps / steps.length) * 100)

    return (
        <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto py-12 px-4"
        >
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20">
                    <Star size={12} className="fill-indigo-500" /> Getting Started
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
                    Welcome to <span className="text-indigo-600">Qicmart</span>, {storeName}!
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
                    Complete these simple steps to activate your store dashboard and start growing your business.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl mb-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Setup Progress</span>
                        <span className="text-2xl font-black text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <Motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <Motion.div 
                        key={step.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Step {...step} />
                    </Motion.div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-zinc-950 rounded-[32px] border border-white/5 text-center group cursor-pointer relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <p className="text-zinc-400 text-sm font-medium relative z-10">
                    Need help setting up? <Link href="#" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-indigo-500/50">Contact our support team</Link> or watch our <Link href="#" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-indigo-500/50">video guide</Link>.
                 </p>
            </div>
        </Motion.div>
    )
}
