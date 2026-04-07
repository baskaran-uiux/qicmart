"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Code2, ArrowRight } from "lucide-react";
import PremiumGetStartedButton from "./PremiumGetStartedButton";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
 
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        handleResize();
        window.addEventListener("resize", handleResize);
        
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#contact' }
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-[100] flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: -120, opacity: 0, scale: 0.9 }}
                animate={{
                    width: isMobileMenuOpen ? "100%" : (isMobile ? "calc(100% - 24px)" : (isScrolled ? "min(90%, 1000px)" : "min(95%, 1200px)")),
                    y: isMobile ? (isScrolled ? 12 : 12) : (isScrolled ? 24 : 12),
                    opacity: 1,
                    scale: 1,
                    borderRadius: isMobileMenuOpen ? "0px" : "9999px",
                    backgroundColor: isScrolled ? "rgba(15, 15, 20, 0.4)" : "rgba(10, 10, 15, 0.6)",
                    backdropFilter: "blur(20px)",
                    paddingLeft: isMobile ? "1rem" : (isScrolled ? "2rem" : "2.5rem"),
                    paddingRight: isMobile ? "1rem" : (isScrolled ? "1.5rem" : "2.5rem"),
                    height: isMobile ? "56px" : (isScrolled ? "64px" : "80px"),
                }}
                className={`
                    flex items-center justify-between border border-white/10 
                    shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                    hover:border-white/20 transition-all duration-700 pointer-events-auto
                    ring-1 ring-white/5
                `}
            >
                {/* Left Side: Logo & Main Nav */}
                <div className="flex items-center gap-12 lg:gap-16">
                    <Link href="/" className="flex items-center gap-4 group">
                        <motion.div 
                            animate={{ 
                                width: (isScrolled || isMobile) ? 32 : 48,
                                height: (isScrolled || isMobile) ? 32 : 48,
                                borderRadius: (isScrolled || isMobile) ? "10px" : "16px"
                            }}
                            className="bg-indigo-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform"
                        >
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.span 
                            animate={{ 
                                fontSize: (isScrolled || isMobile) ? "1.1rem" : "1.875rem",
                                letterSpacing: (isScrolled || isMobile) ? "-0.04em" : "-0.07em"
                            }}
                            className="font-black tracking-[-0.07em] uppercase italic text-white shrink-0 leading-none"
                        >
                            Qic<span className="text-indigo-500">Mart</span>
                        </motion.span>
                    </Link>
                    
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((item) => (
                            <Link 
                                key={item.name} 
                                href={item.href} 
                                className="mono-label !text-zinc-400 hover:!text-white transition-colors text-[10px] tracking-[0.2em] whitespace-nowrap"
                            >
                                {item.name.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        {!isScrolled && (
                            <div className="hidden lg:flex items-center gap-6 mr-6 opacity-40">
                                <span className="mono-label text-[9px] tracking-widest uppercase">/ SECURE_SHELL</span>
                                <div className="h-3 w-px bg-white/20" />
                                <span className="mono-label text-[9px] tracking-widest uppercase">v2.0.4</span>
                            </div>
                        )}
                        <PremiumGetStartedButton />
                    </div>

                    {/* Mobile Menu Trigger (Two Bar) */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex flex-col gap-1.5 p-2 md:hidden group"
                    >
                        <motion.div 
                            animate={isMobileMenuOpen ? { rotate: 45, y: 7, width: 24 } : { rotate: 0, y: 0, width: 20 }}
                            className="h-0.5 bg-indigo-500 rounded-full self-end transition-all" 
                        />
                        <motion.div 
                            animate={isMobileMenuOpen ? { rotate: -45, y: -1, width: 24 } : { rotate: 0, y: 0, width: 28 }}
                            className="h-0.5 bg-white rounded-full self-end transition-all" 
                        />
                    </button>
                </div>
            </motion.div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 pointer-events-auto"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] h-auto max-h-[80vh] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 p-10 z-50 pointer-events-auto shadow-[0_0_100px_rgba(79,70,229,0.3)] flex flex-col rounded-[40px] overflow-hidden"
                        >
                            {/* Close Button Inside Menu */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="self-end p-2 mb-8 text-zinc-500 hover:text-white transition-colors"
                            >
                                <motion.div
                                    whileHover={{ rotate: 90 }}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </motion.div>
                            </button>

                            <div className="flex flex-col gap-8 flex-1">
                                <div className="mono-label text-[10px] text-indigo-500/60 mb-2">/ NAVIGATION_CLUSTER</div>
                                {navLinks.map((item, i) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link 
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-2xl font-bold italic tracking-tight text-white hover:text-indigo-500 transition-colors block"
                                        >
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-auto space-y-8">
                                <div className="h-px w-full bg-white/5" />
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="w-full"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <PremiumGetStartedButton />
                                </motion.div>

                                <div className="flex flex-col gap-2 opacity-30">
                                    <div className="flex items-center justify-between">
                                        <span className="mono-label text-[9px]">ENCRYPTED_ID</span>
                                        <span className="mono-label text-[9px]">v2.0.4</span>
                                    </div>
                                    <div className="flex items-center justify-between text-indigo-400">
                                        <span className="mono-label text-[9px]">STABLE_CONNECTION</span>
                                        <span className="mono-label text-[9px]">MKXXVI</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
