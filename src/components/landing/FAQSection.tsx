"use client"

import { useState } from "react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, Mail, ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "How long does it take to launch a store?",
        answer: "With Qicmart, you can launch a professional storefront in under 5 minutes. Simply add your products, choose a theme, and you're ready to sell globally."
    },
    {
        question: "Can I use my own custom domain?",
        answer: "Absolutely. All paid plans include free custom domain integration with SSL security as standard. You can connect your existing domain or buy one through us."
    },
    {
        question: "Are there any hidden transaction fees?",
        answer: "No. Unlike other platforms, Qicmart does not charge additional transaction fees. You only pay your standard credit card processing fee (e.g., via Stripe or PayPal)."
    },
    {
        question: "What kind of support is provided?",
        answer: "Standard plans include email and community support. Professional and Enterprise plans include priority 24/7 rapid response and dedicated account handlers."
    },
    {
        question: "How does the AI Magic Studio work?",
        answer: "Our AI Magic Studio uses generative AI to automatically remove backgrounds, enhance product lighting, and create professional-grade lifestyle mockups from simple photos."
    }
]

export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="py-16 md:py-32 relative overflow-hidden bg-[#020205] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
                    
                    {/* Left Column: Heading & Contact Card */}
                    <div className="space-y-12">
                        <Motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-12"
                        >
                            <div>
                                <Motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
                                >
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">SUPPORT_RESOURCES</span>
                                </Motion.div>
                                <Motion.h2 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-5xl md:text-6xl font-bold text-white leading-tight"
                                >
                                    Frequently asked <br />
                                    <span className="text-[#7670FE]">questions</span>
                                </Motion.h2>
                            </div>
                        </Motion.div>

                        {/* Still have questions? Card */}
                        <Motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="p-10 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6">
                                    <Mail size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Still have a questions?</h3>
                                <p className="text-zinc-500 mb-8 max-w-xs transition-colors group-hover:text-zinc-400">
                                    Can't find the answer to your question? Send us an email and we'll get back to you as soon as possible!
                                </p>
                                <a 
                                    href="mailto:support@qicmart.com"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold hover:bg-indigo-500 hover:text-white transition-all"
                                >
                                    Contact support
                                </a>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full" />
                        </Motion.div>
                    </div>

                    {/* Right Column: Accordions */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <Motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                className={`rounded-[32px] border transition-all duration-300 overflow-hidden ${
                                    activeIndex === index 
                                        ? "bg-white/[0.05] border-white/20" 
                                        : "bg-transparent border-white/5 hover:border-white/10"
                                }`}
                            >
                                <button
                                    onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    className="w-full p-8 flex items-center justify-between text-left group"
                                >
                                    <span className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-all duration-300">
                                        {faq.question}
                                    </span>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        activeIndex === index 
                                            ? "bg-indigo-600 text-white rotate-180" 
                                            : "bg-white/5 text-zinc-500 group-hover:bg-white/10"
                                    }`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <Motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-8 pb-8 text-zinc-500 leading-relaxed max-w-2xl">
                                                {faq.answer}
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
