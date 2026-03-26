"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Banner {
    id: string
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
}

const defaultSlides = [
    {
        id: "default-1",
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

export default function HeroBanner({ slug, banners = [] }: Props) {
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

    return (
        <div
            className="relative h-[380px] sm:h-[700px] overflow-hidden bg-zinc-950"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <style jsx>{`
                @keyframes zoomOut {
                    from { transform: scale(1.15); }
                    to { transform: scale(1); }
                }
                .animate-zoom-banner {
                    animation: zoomOut 8s ease-out forwards;
                }
            `}</style>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onPanEnd={(_, info) => {
                        if (info.offset.x > 100) prev()
                        else if (info.offset.x < -100) next()
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y"
                >
                    {activeSlides.map((s: any) => {
                        const currentIdx = activeSlides.indexOf(s);
                        if (currentIdx !== current) return null;
                        const isDefault = (s as any).bg !== undefined;
                        return (
                            <div key={s.id} className="absolute inset-0">
                                {s.showOverlay !== false && (
                                    <>
                                        {isDefault ? (
                                            <div className={`absolute inset-0 bg-gradient-to-r ${(s as any).bg} opacity-90`} />
                                        ) : (
                                            <div className="absolute inset-0 bg-black/70 z-10" />
                                        )}
                                    </>
                                )}
                                
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    className="absolute inset-0 w-full h-full object-cover animate-zoom-banner"
                                />
 
                                <div className={`relative z-20 h-full flex flex-col justify-center px-6 sm:px-20 lg:px-32 text-white
                                    ${s.textAlign === 'left' ? 'items-start text-left' : 
                                      s.textAlign === 'right' ? 'items-end text-right' : 
                                      'items-center text-center'}`}>
                                    
                                    {s.title && (
                                        <motion.h2 
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 0.9, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-2xl sm:text-6xl font-bold tracking-tight mb-3 sm:mb-6 drop-shadow-2xl"
                                            style={{ color: s.titleColor || '#ffffff' }}
                                        >
                                            {s.title}
                                        </motion.h2>
                                    )}
                                    
                                    {s.subtitle && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="text-[10px] sm:text-base text-white/80 max-w-xl mb-6 sm:mb-10 font-medium leading-relaxed line-clamp-2"
                                            style={{ color: s.subtitleColor || 'rgba(255,255,255,0.8)' }}
                                        >
                                            {s.subtitle}
                                        </motion.p>
                                    )}
                                    
                                    {s.buttonText && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <Link
                                                href={s.buttonLink.startsWith('/') ? `/s/${slug}${s.buttonLink}` : `/s/${slug}/${s.buttonLink}`}
                                                className="inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-14 py-3 sm:py-5 font-bold rounded-lg sm:rounded-2xl transition-all shadow-2xl hover:scale-105 active:scale-95 text-[11px] sm:text-[14px] group"
                                                style={{ 
                                                    backgroundColor: s.btnColor || '#ffffff',
                                                    color: s.btnTextColor || '#000000'
                                                }}
                                            >
                                                {s.buttonText} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {activeSlides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-3xl glass text-zinc-900 border border-white/40 hover:bg-white hover:text-zinc-950 transition-all items-center justify-center group shadow-2xl"
                    >
                        <span className="text-2xl group-hover:-translate-x-1 transition-transform font-light">‹</span>
                    </button>
                    <button
                        onClick={next}
                        className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-3xl glass text-zinc-900 border border-white/40 hover:bg-white hover:text-zinc-950 transition-all items-center justify-center group shadow-2xl"
                    >
                        <span className="text-2xl group-hover:translate-x-1 transition-transform font-light">›</span>
                    </button>
                    
                    {/* Dots */}
                    <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                        {activeSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 rounded-full transition-all duration-700 ${i === current ? "w-10 bg-white shadow-xl" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
