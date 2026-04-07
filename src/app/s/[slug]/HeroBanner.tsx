"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import OptimizedImage from "@/components/common/OptimizedImage"


interface Banner {
    id: string
    type?: "image" | "video"
    image: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    titleColor?: string
    subtitleColor?: string
    btnColor?: string
    btnTextColor?: string
    textAlign?: "left" | "center" | "right"
    showOverlay?: boolean
}

interface Props {
    slug: string
    banners?: Banner[]
    layoutStyle?: string
}

const defaultSlides: Banner[] = [
    {
        id: "default-1",
        type: "image",
        title: "New Season",
        subtitle: "Discover the latest trends — curated just for you",
        buttonText: "Shop Now",
        buttonLink: "/products",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
        titleColor: "#ffffff",
        subtitleColor: "#ffffff",
        btnColor: "#ffffff",
        btnTextColor: "#000000",
        textAlign: "center",
        showOverlay: true
    },
    {
        id: "default-2",
        type: "image",
        title: "Up to 50% Off",
        subtitle: "Flash sale on premium products — limited time only",
        buttonText: "Shop Sale",
        buttonLink: "/products",
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
        titleColor: "#ffffff",
        subtitleColor: "#ffffff",
        btnColor: "#ffffff",
        btnTextColor: "#000000",
        textAlign: "center",
        showOverlay: true
    },
]

export default function HeroBanner({ slug, banners = [], layoutStyle = "default" }: Props) {
    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)

    // Use custom banners if they have images, otherwise use defaults
    const activeSlides = banners.length > 0 && banners.some(b => b.image)
        ? banners.filter(b => b.image)
        : defaultSlides

    const next = useCallback(() => setCurrent((c) => (c + 1) % activeSlides.length), [activeSlides.length])
    const prev = useCallback(() => setCurrent((c) => (c - 1 + activeSlides.length) % activeSlides.length), [activeSlides.length])

    useEffect(() => {
        if (paused || activeSlides.length <= 1) return
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [next, paused, activeSlides.length])

    const isNextgen = layoutStyle === 'nextgen'
    const isSports = layoutStyle === 'sports'

    return (
        <div
            className={`relative transition-all duration-700 ${isSports ? 'bg-zinc-950 overflow-hidden' : isNextgen ? 'bg-white dark:bg-zinc-950 px-4 sm:px-8 py-2 sm:py-6' : 'bg-zinc-950'}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className={`relative overflow-hidden transition-all duration-700 
                ${isSports ? 'h-[450px] sm:h-[650px] w-full' : isNextgen ? 'h-[380px] sm:h-[520px] rounded-xl sm:rounded-3xl shadow-2xl' : 
                  'h-[350px] sm:h-[500px]'}`}>
                <style jsx>{`
                    @keyframes zoomOut {
                        from { transform: scale(1.15); }
                        to { transform: scale(1); }
                    }
                    .animate-zoom-banner {
                        animation: zoomOut 8s ease-out forwards;
                    }
                    .premium-orange-btn {
                        background-color: var(--primary-color, #f97316);
                        color: white !important;
                        box-shadow: 0 20px 40px rgba(var(--primary-rgb, 249, 115, 22), 0.3);
                        border: none;
                        position: relative;
                        overflow: hidden;
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .premium-orange-btn:hover {
                        transform: translateY(-4px) scale(1.02);
                        box-shadow: 0 25px 50px rgba(var(--primary-rgb, 249, 115, 22), 0.4);
                        background-color: var(--primary-color, #f97316) !important;
                    }
                    .premium-custom-btn:hover {
                        filter: brightness(1.1);
                        transform: translateY(-4px) scale(1.02);
                    }
                    .premium-orange-btn::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            90deg,
                            transparent,
                            rgba(255, 255, 255, 0.2),
                            transparent
                        );
                        transition: 0.5s;
                    }
                    .premium-orange-btn:hover::before {
                        left: 100%;
                    }
                    .sports-neon-btn {
                        background-color: #000000;
                        color: white !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                        border: none;
                        transform: skewX(-12deg);
                        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .sports-neon-btn:hover {
                        background-color: #222222 !important;
                        transform: skewX(-12deg) translateY(-4px) scale(1.05);
                        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
                    }
                    .sports-neon-btn span {
                        transform: skewX(12deg);
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                    }
                `}</style>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onPanEnd={(_, info) => {
                            if (info.offset.x > 100) prev()
                            else if (info.offset.x < -100) next()
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
                    >
                        {(function() {
                            const s = activeSlides[current];
                            if (!s) return null;
                            const isDefault = (s as any).bg !== undefined;
                            
                            // Robust video detection: 
                            // 1. Check if type is explicitly 'video'
                            // 2. Fallback to regex that handles query params (e.g., from Media Library)
                            const videoRegex = /\.(mp4|webm|ogg|mov|mov)(\?|$)/i;
                            const isVideo = s.type === 'video' || (s.image && videoRegex.test(s.image));
                            
                            return (
                                <div key={s.id} className="absolute inset-0">
                                    {(s.showOverlay !== false && (s.title || s.subtitle || s.buttonText)) && (
                                        <>
                                            {isDefault ? (
                                                <div className={`absolute inset-0 bg-gradient-to-r ${(s as any).bg} opacity-90`} />
                                            ) : (
                                                <div className={`absolute inset-0 z-10 ${isSports ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/20' : 'bg-black/40'}`} />
                                            )}
                                        </>
                                    )}
                                    
                                    <div className={`absolute inset-0 z-0 bg-zinc-900`}>
                                        {s.image ? (
                                            isVideo ? (
                                                <video 
                                                    src={s.image} 
                                                    autoPlay 
                                                    loop 
                                                    muted 
                                                    playsInline
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className={`w-full h-full relative flex items-center justify-center`}>
                                                    <OptimizedImage
                                                        src={s.image}
                                                        alt={s.title}
                                                        fill
                                                        priority={current === 0}
                                                        unoptimized={true}
                                                        className={`w-full h-full object-cover animate-zoom-banner`}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                        )}
                                    </div>

                                    <div className={`relative z-20 h-full flex flex-col justify-center px-8 sm:px-24 lg:px-40 text-white
                                        ${s.textAlign === 'left' ? 'items-start text-left' : 
                                          s.textAlign === 'right' ? 'items-end text-right' : 
                                          'items-center text-center'}`}>
                                        
                                        {s.title && (
                                            <motion.h2 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2, duration: 0.8 }}
                                                className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-4 leading-tight max-w-4xl`}
                                                style={{ color: isSports ? '#ffffff' : s.titleColor || '#ffffff' }}
                                            >
                                                {s.title}
                                            </motion.h2>
                                        )}
                                        
                                        {s.subtitle && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4, duration: 0.8 }}
                                                className={`text-[13px] sm:text-[16px] max-w-xl mb-6 sm:mb-10 font-medium tracking-wide opacity-90 leading-relaxed text-white`}
                                                style={{ color: isSports ? '#ffffff' : s.subtitleColor || 'rgba(255,255,255,0.9)' }}
                                            >
                                                {s.subtitle}
                                            </motion.p>
                                        )}
                                        
                                        {s.buttonText && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.6, duration: 0.8 }}
                                            >
                                                <Link
                                                    href={s.buttonLink.startsWith('/s/') ? s.buttonLink : `/s/${slug}${s.buttonLink.startsWith('/') ? s.buttonLink : `/${s.buttonLink}`}`}
                                                    className={`inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 text-[12px] sm:text-[14px] group tracking-tight 
                                                        ${isSports ? 'sports-neon-btn' : isNextgen ? (s.btnColor && s.btnColor !== '#ffffff' ? 'premium-custom-btn' : 'premium-orange-btn') : ''}`}
                                                    style={!isSports && isNextgen && (!s.btnColor || s.btnColor === '#ffffff') ? { 
                                                        backgroundColor: 'var(--primary-color)',
                                                        color: '#ffffff'
                                                    } : !isSports ? { 
                                                        backgroundColor: s.btnColor || '#ffffff',
                                                        color: s.btnTextColor || '#000000'
                                                    } : {}}
                                                >
                                                    <span className="flex items-center justify-center gap-2">
                                                        {s.buttonText} 
                                                        <ArrowRight className="w-4 h-4 sm:w-5 h-5 group-hover:translate-x-1.5 transition-transform shrink-0" />
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </motion.div>
                </AnimatePresence>

                {/* Arrows */}
                {activeSlides.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl text-white border border-white/20 hover:bg-white hover:text-black transition-all items-center justify-center group shadow-2xl"
                        >
                            <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={next}
                            className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full bg-white/5 backdrop-blur-3xl text-white border border-white/20 hover:bg-white hover:text-black transition-all items-center justify-center group shadow-2xl"
                        >
                            <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        
                        {/* Pagination Progress */}
                        <div className="absolute bottom-10 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                            <div className="text-white/40 text-[10px] font-black tracking-widest uppercase mr-4">
                                {String(current + 1).padStart(2, '0')} <span className="mx-2 text-white/10">/</span> {String(activeSlides.length).padStart(2, '0')}
                            </div>
                            {activeSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1 rounded-full transition-all duration-700 ${i === current ? "w-12 bg-white" : "w-2 bg-white/20 hover:bg-white/40"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
