"use client"

import React, { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle2, Layers, Globe } from 'lucide-react'
import { toast } from 'sonner'

const ContactSection = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        businessName: '',
        location: '',
        whatsapp: '',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (response.ok) {
                setIsSent(true)
                setFormData({
                    fullName: '',
                    email: '',
                    businessName: '',
                    location: '',
                    whatsapp: '',
                    message: ''
                })
                toast.success('Transmission Received / HQ Aware')
                setTimeout(() => setIsSent(false), 5000)
            } else {
                toast.error(result.error || 'System Failure: Communication Channel Blocked')
            }
        } catch (error) {
            console.error('Contact Error:', error)
            toast.error('Tactical Error: Network Interference Detected')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="py-10 md:py-20 relative overflow-hidden bg-zinc-950">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <Motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <div className="mono-label mb-4 flex items-center justify-center gap-4">
                        <span className="h-px w-8 bg-indigo-500/30" />
                        / DIRECT_CHANNEL_HQ
                        <span className="h-px w-8 bg-indigo-500/30" />
                    </div>
                    <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter text-white mb-6">
                        Establish <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Contact</span>.
                    </h2>
                    <p className="text-zinc-500 font-medium max-w-xl mx-auto text-sm md:text-base">
                        Need technical support or custom infrastructure? Our command center is standing by to assist with your deployment.
                    </p>
                </Motion.div>

                <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-12 beveled-lg relative overflow-hidden"
                >
                    {/* Subtle Internal Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
                    
                    {isSent ? (
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Transmission Received</h3>
                                <p className="text-zinc-500">Your message has been encrypted and sent to the command center.</p>
                            </div>
                            <button 
                                onClick={() => setIsSent(false)}
                                className="text-sm font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                / SEND_NEW_MESSAGE
                            </button>
                        </Motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" />
                                        Full Name
                                    </label>
                                    <input 
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="Enter your name"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                        <Mail size={14} className="text-indigo-500" />
                                        Business Email
                                    </label>
                                    <input 
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email" 
                                        placeholder="name@yourbrand.com"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                        <Layers size={14} className="text-indigo-500" />
                                        Business Name
                                    </label>
                                    <input 
                                        required
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="Your Store or Brand Name"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                        <Globe size={14} className="text-indigo-500" />
                                        Location
                                    </label>
                                    <input 
                                        required
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        type="text" 
                                        placeholder="City, Country"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-indigo-500/40 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        </div>
                                        WhatsApp Number
                                    </label>
                                    <input 
                                        required
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        type="tel" 
                                        placeholder="+91 Your Number"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="mono-label !text-zinc-400 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-indigo-500" />
                                    Your Inquiry
                                </label>
                                <textarea 
                                    required
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="How can we help your business grow today?"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-3xl px-6 py-5 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all hover:border-white/20 resize-none"
                                />
                            </div>

                            <div className="pt-4">
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
                                                SUBMITTING...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                SUBMIT MESSAGE
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>
                    )}
                </Motion.div>

                {/* Footer Status Indicators */}
                <div className="mt-12 flex items-center justify-between px-4 opacity-50">
                    <div className="flex items-center gap-6">
                        <div className="mono-label !text-zinc-500 flex items-center gap-2 text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            SECURE_CHANNEL_READY
                        </div>
                        <div className="mono-label !text-zinc-500 flex items-center gap-2 text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            ENCRYPTION: AES-256_ACTIVE
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactSection
