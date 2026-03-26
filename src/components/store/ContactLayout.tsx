"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Send } from "lucide-react"

export function ContactLayout({ config }: { config: any }) {
    return (
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: MapPin, title: "Our Location", value: config.location || "Add your address", sub: "Contact Us", link: "View on Map" },
                    { icon: Phone, title: "Phone Number", value: config.phone || "Add your phone", sub: "Customer Service:", link: config.hours || "Mon-Fri: 8am-8pm" },
                    { icon: Mail, title: "Email", value: config.email || "Add your email", sub: "General Inquiries:", link: "We aim to respond within 24 hours" },
                ].map((item, i) => (
                    <motion.div 
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-xl hover:scale-105 transition-all duration-500 group"
                    >
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-[var(--primary-color)] group-hover:bg-[var(--primary-color)] group-hover:text-white transition-colors duration-500">
                            <item.icon size={28} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-zinc-900">{item.title}</h3>
                            <p className="text-zinc-500 text-sm font-medium">{item.sub}</p>
                            <p className="text-lg font-bold text-[var(--primary-color)] leading-tight">{item.value}</p>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{item.link}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Contact Form */}
                <div className="space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Send Us A Message</h2>
                        <div className="h-1.5 w-20 bg-[var(--primary-color)] rounded-full" />
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">First Name <span className="text-rose-500">*</span></label>
                                <input type="text" placeholder="Enter first name" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Last Name <span className="text-rose-500">*</span></label>
                                <input type="text" placeholder="Enter last name" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email <span className="text-rose-500">*</span></label>
                                <input type="email" placeholder="Enter email address" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Phone Number</label>
                                <input type="text" placeholder="Enter phone number" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Subject <span className="text-rose-500">*</span></label>
                            <select className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all appearance-none cursor-pointer">
                                <option>Select a subject</option>
                                <option>General Inquiry</option>
                                <option>Order Support</option>
                                <option>Feedback</option>
                                <option>Business Inquiry</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Message <span className="text-rose-500">*</span></label>
                            <textarea rows={6} placeholder="Write your message here..." className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)] outline-none transition-all resize-none" />
                        </div>

                        <div className="flex items-center gap-3 px-1">
                            <input type="checkbox" id="consent" className="w-4 h-4 rounded border-zinc-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                            <label htmlFor="consent" className="text-[11px] font-medium text-zinc-500 leading-none">I agree to the <span className="text-[var(--primary-color)] font-bold">Privacy Policy</span> and consent to processing my data.</label>
                        </div>

                        <button 
                            type="button"
                            className="w-full sm:w-auto px-10 py-4 bg-[var(--primary-color)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-[var(--primary-color)]/20 hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            Send Message
                            <Send size={16} strokeWidth={2.5} />
                        </button>
                    </form>
                </div>

                {/* Map */}
                <div className="space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Visit Our Store</h2>
                        <div className="h-1.5 w-20 bg-[var(--primary-color)] rounded-full" />
                    </div>
                    
                    <div className="aspect-[4/5] w-full rounded-[48px] overflow-hidden border-8 border-white shadow-2xl relative">
                        {config.mapEmbed ? (
                            <iframe 
                                src={config.mapEmbed}
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 gap-4 text-center p-10">
                                <div className="p-6 bg-white rounded-full shadow-inner">
                                    <MapPin size={48} className="opacity-20" />
                                </div>
                                <p className="font-bold text-sm tracking-tight italic">Map location not provided yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
