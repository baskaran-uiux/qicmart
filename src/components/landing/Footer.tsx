"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Mail, Phone, MapPin, Youtube, Facebook, 
    Instagram, MessageCircle, X 
} from "lucide-react";

const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg 
        viewBox="0 0 24 24" 
        width={size} 
        height={size} 
        fill="currentColor" 
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.88 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
)

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const companyLinks = [
        { name: "Home", href: "#" },
        { name: "Themes", href: "#" },
        { name: "Pricing", href: "#" },
        { name: "About Us", href: "#" },
        { name: "Contact Us", href: "#" },
    ];

    const legalLinks = [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms & Conditions", href: "#" },
        { name: "Refund Policy", href: "#" },
        { name: "Shipping Policy", href: "#" },
        { name: "Referral Program", href: "#" },
    ];

    return (
        <footer className="bg-black text-white pt-12 pb-6 px-6 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 mb-8">
                    
                    {/* Branding & Contact */}
                    <div className="lg:col-span-1.5 space-y-6">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-black tracking-[-0.07em] uppercase italic text-white shrink-0 leading-none">
                                Qic<span className="text-indigo-500">Mart</span>
                            </span>
                        </Link>
                        
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                            Create your online store without coding. Build a professional 
                            ecommerce website and start selling online with Qicmart.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-zinc-400 hover:text-indigo-500 transition-colors group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                    <Mail size={14} className="text-indigo-500" />
                                </div>
                                <span className="text-sm font-medium">support@qicmart.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400 hover:text-indigo-500 transition-colors group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                    <Phone size={14} className="text-indigo-500" />
                                </div>
                                <span className="text-sm font-medium">+91 8072171027</span>
                            </div>
                            <div className="flex items-start gap-3 text-zinc-400 hover:text-indigo-500 transition-colors group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center mt-1 group-hover:bg-indigo-500/10 transition-colors shrink-0">
                                    <MapPin size={14} className="text-indigo-500" />
                                </div>
                                <span className="text-sm font-medium leading-relaxed text-left">
                                    Bagula Bus Stand, near PNB Bank ATM, <br />
                                    Bagula, Nadia, West Bengal 741502, India
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {[Youtube, Facebook, Instagram, WhatsAppIcon].map((Icon, i) => (
                                <Link 
                                    key={i} 
                                    href="#" 
                                    className="w-10 h-10 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:bg-indigo-500 hover:text-white transition-all duration-300"
                                >
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div className="md:ml-12">
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white text-left">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.name} className="text-left">
                                    <Link 
                                        href={link.href} 
                                        className="text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white text-left">Resources & Legal</h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.name} className="text-left">
                                    <Link 
                                        href={link.href} 
                                        className="text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Status Card */}
                    <div className="relative">
                        <div className="p-6 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-[32px] space-y-4 text-left">
                            <div className="space-y-2">
                                <h4 className="text-base font-bold text-white">System Status</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    All systems are currently operational across all data centers.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-zinc-400">Uptime (30d)</span>
                                    <span className="text-indigo-500 font-mono tracking-tighter">99.99%</span>
                                </div>
                                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "99.9%" }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        className="h-full bg-indigo-500 rounded-full"
                                    />
                                </div>
                            </div>

                            <Link 
                                href="https://wa.me/918072171027"
                                target="_blank"
                                className="flex items-center gap-3 text-indigo-500 hover:text-indigo-400 transition-colors group pt-2"
                            >
                                <WhatsAppIcon size={20} />
                                <span className="text-sm font-bold tracking-tight">WhatsApp Support</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <p className="text-[11px] font-medium text-zinc-600">
                        &copy; 2026 Qicmart. All rights reserved.
                    </p>
                    <p className="text-[11px] font-medium text-zinc-600">
                        Made with <Link href="https://venlo.co.in" target="_blank" className="text-indigo-500 hover:underline">Venlo Solutions</Link>
                    </p>
                </div>
            </div>

            {/* Massive Background Watermark */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full overflow-hidden pointer-events-none select-none z-0 opacity-[0.04] flex justify-center translate-y-1/2">
                <span className="text-[25vw] font-black tracking-[-0.07em] uppercase italic leading-none whitespace-nowrap text-white/50">
                    QICMART
                </span>
            </div>

            {/* WhatsApp Chat Widget */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-8 w-[350px] bg-[#1a1d21] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl z-[110] shadow-emerald-500/10"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-br from-[#12CF5F] to-[#0CB05A] relative">
                            <button 
                                onClick={() => setIsChatOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                    <WhatsAppIcon className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white tracking-tight">Qicmart</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                                        <span className="text-[11px] font-bold text-white/80">Usually replies instantly</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-[#232730] rounded-2xl rounded-tl-none border border-white/5 relative">
                                <p className="text-sm text-zinc-300 leading-relaxed text-left">
                                    Hi there! 👋 <br />
                                    How can we help you today? Click below to start a conversation on WhatsApp.
                                </p>
                                <span className="absolute bottom-2 right-4 text-[10px] text-zinc-500 font-medium italic">10:50 AM</span>
                            </div>

                            <Link 
                                href="https://wa.me/918072171027"
                                target="_blank"
                                className="w-full h-14 bg-[#12CF5F] hover:bg-[#10B854] text-white font-bold flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <WhatsAppIcon size={20} className="text-white" />
                                <span>Start Chat</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsChatOpen(!isChatOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 right-8 w-14 h-14 bg-[#12CF5F] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20 z-[100] animate-whatsapp-pulse cursor-pointer"
            >
                {isChatOpen ? <X size={28} /> : <WhatsAppIcon size={28} />}
            </motion.button>
        </footer>
    );
};

export default Footer;
