"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Code2, ArrowRight } from "lucide-react";
import PremiumGetStartedButton from "./PremiumGetStartedButton";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ y: -120, opacity: 0, scale: 0.98 }}
                animate={{
                    width: isScrolled ? "min(90%, 850px)" : "100%",
                    y: isScrolled ? 16 : 0,
                    opacity: 1,
                    scale: 1,
                    borderRadius: isScrolled ? "9999px" : "0px",
                    backgroundColor: isScrolled ? "rgba(10, 10, 12, 0.8)" : "rgba(0, 0, 0, 0.95)",
                    paddingLeft: isScrolled ? "2.5rem" : "5%",
                    paddingRight: isScrolled ? "2.5rem" : "5%",
                    height: isScrolled ? "68px" : "96px",
                }}
                transition={{
                    type: "spring",
                    stiffness: 60,   // Slower, more elegant
                    damping: 22,    // Less bouncy
                    mass: 1.2,       // Feeling more 'heavy' and premium
                    duration: 1.2   // Added for general smoothness
                }}
                className={`
                    flex items-center justify-between backdrop-blur-3xl 
                    border-b border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] pointer-events-auto
                    ${isScrolled ? 'border border-white/20 ring-1 ring-white/10 shadow-indigo-500/10' : ''}
                `}
            >
                {/* Left Side: Logo & Main Nav */}
                <div className="flex items-center gap-12 lg:gap-16">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            animate={{ 
                                width: isScrolled ? 36 : 48,
                                height: isScrolled ? 36 : 48,
                                borderRadius: isScrolled ? "12px" : "16px"
                            }}
                            className="bg-indigo-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20"
                        >
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.span 
                            animate={{ 
                                fontSize: isScrolled ? "1.25rem" : "1.875rem",
                                letterSpacing: isScrolled ? "-0.04em" : "-0.07em"
                            }}
                            className="font-black tracking-[-0.07em] uppercase italic text-white shrink-0 leading-none"
                        >
                            Qic<span className="text-indigo-500">Mart</span>
                        </motion.span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Market', { name: 'Pricing', href: '#pricing' }].map((item) => (
                            <Link 
                                key={typeof item === 'string' ? item : item.name} 
                                href={typeof item === 'string' ? '#' : item.href} 
                                className="mono-label !text-zinc-400 hover:!text-white transition-colors text-[10px] tracking-[0.2em] whitespace-nowrap"
                            >
                                {(typeof item === 'string' ? item : item.name).toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {!isScrolled && (
                        <div className="hidden lg:flex items-center gap-6 mr-6 opacity-40">
                            <span className="mono-label text-[9px] tracking-widest uppercase">/ SECURE_SHELL</span>
                            <div className="h-3 w-px bg-white/20" />
                            <span className="mono-label text-[9px] tracking-widest uppercase">v2.0.4</span>
                        </div>
                    )}
                    <PremiumGetStartedButton />
                </div>
            </motion.div>
        </nav>
    );
};

export default Navbar;
