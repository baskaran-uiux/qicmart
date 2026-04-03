"use client"

import React, { useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { X, User, Layers, Globe, Send, Loader2, MessageSquare } from 'lucide-react'

interface PricingInquiryModalProps {
    isOpen: boolean
    onClose: () => void
    planName: string
    planPrice: string
}

export const PricingInquiryModal = ({ isOpen, onClose, planName, planPrice }: PricingInquiryModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        businessName: '',
        location: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // WhatsApp Detail Construction
        const message = `NEW_LEAD: ${planName.toUpperCase()} / QICMART_INQUIRY
---------------------------------
/ COMMANDER: ${formData.fullName}
/ BUSINESS: ${formData.businessName}
/ LOCATION: ${formData.location}
/ PRICE_POINT: ${planPrice}
---------------------------------
I am interested in deploying the ${planName} for my business. Please assist me with the next steps.`.trim()

        const whatsappUrl = `https://wa.me/918072171027?text=${encodeURIComponent(message)}`

        // Simulate a small processing delay for "premium feel"
        await new Promise(resolve => setTimeout(resolve, 800))
        
        window.open(whatsappUrl, '_blank')
        setIsSubmitting(false)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-zinc-950 border border-white/10 rounded-[40px] w-full max-w-lg p-8 md:p-10 relative overflow-hidden beveled-lg"
                    >
                        {/* Glow Background */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="mono-label !text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] px-3 py-1 bg-indigo-500/10 rounded-full">
                                    / INQUIRY_PROTOCOL
                                </div>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
                                Launch <span className="text-indigo-500">{planName}</span>.
                            </h3>
                            <p className="text-zinc-500 mb-8 font-medium">
                                Fill in your details to finalize your infrastructure deployment via secure WhatsApp channel.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="mono-label !text-zinc-500 flex items-center gap-2">
                                        <User size={12} className="text-indigo-500" />
                                        COMMANDER_NAME
                                    </label>
                                    <input 
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="Full Name"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="mono-label !text-zinc-500 flex items-center gap-2">
                                        <Layers size={12} className="text-indigo-500" />
                                        BUSINESS_NAME
                                    </label>
                                    <input 
                                        required
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="Store or Company Name"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="mono-label !text-zinc-500 flex items-center gap-2">
                                        <Globe size={12} className="text-indigo-500" />
                                        GEOGRAPHIC_COORD (Location)
                                    </label>
                                    <input 
                                        required
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="City, Country"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>

                                <div className="pt-4 pb-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`sparkle-button group w-full ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                                        style={{ "--sparkle-bg": "#4f46e5" } as React.CSSProperties}
                                    >
                                        <div className="dots_border" />
                                        <div className="text_button flex items-center justify-center gap-3">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    REDIRECTING TO WA...
                                                </>
                                            ) : (
                                                <>
                                                    <MessageSquare size={18} />
                                                    START DEPLOYMENT
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </form>
                            
                            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-zinc-600 font-mono">
                                <div className="flex items-center gap-1.5 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    SECURE_WA_PROTOCOL
                                </div>
                                <div className="flex items-center gap-1.5 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    INSTANT_NOTIFICATION
                                </div>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
