"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion"
import OptimizedImage from "@/components/common/OptimizedImage"


interface CategoryCarouselProps {
    categories: any[]
    slug: string
    storeTheme?: string
}

export default function CategoryCarousel({ categories, slug, storeTheme = "modern" }: CategoryCarouselProps) {
    const isSports = storeTheme === "sports"
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const [isHovering, setIsHovering] = useState(false)

    // Framer Motion 3D Carousel Logic
    const DRAG_FACTOR = 0.5
    const x = useMotionValue(0)
    const [currentIndex, setCurrentIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Double/Triple is not needed for the 3D carousel, but we use categories directly
    const displayCategories = isSports ? categories : [...categories, ...categories, ...categories]
    const originalCount = categories.length

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)

        // Seamless Loop Logic: If we scroll past the first set, or before it
        if (!isSports) {
            const setWidth = scrollWidth / 3
            if (scrollLeft <= 0) {
                scrollRef.current.scrollLeft = setWidth
            } else if (scrollLeft >= setWidth * 2) {
                scrollRef.current.scrollLeft = setWidth
            }
        }
    }

    useEffect(() => {
        if (isSports) return
        const el = scrollRef.current
        if (el && originalCount > 0) {
            // Initial position: Start at the second set (the middle one)
            const setWidth = el.scrollWidth / 3
            el.scrollLeft = setWidth

            el.addEventListener("scroll", checkScroll)
            window.addEventListener("resize", checkScroll)
            checkScroll()
        }
        return () => {
            el?.removeEventListener("scroll", checkScroll)
            window.removeEventListener("resize", checkScroll)
        }
    }, [originalCount, isSports])

    // Auto-move logic
    useEffect(() => {
        if (isHovering || originalCount === 0) return

        const interval = setInterval(() => {
            if (isSports) {
                setCurrentIndex((prev) => (prev + 1) % originalCount)
            } else {
                autoScroll()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [isHovering, originalCount, isSports])

    const autoScroll = () => {
        if (!scrollRef.current) return
        const itemWidth = window.innerWidth < 640 ? 156 : 216 
        scrollRef.current.scrollBy({
            left: itemWidth,
            behavior: "smooth"
        })
    }

    const scroll = (direction: "left" | "right") => {
        if (isSports) {
            if (direction === "left") {
                setCurrentIndex((prev) => (prev - 1 + originalCount) % originalCount)
            } else {
                setCurrentIndex((prev) => (prev + 1) % originalCount)
            }
            return
        }

        if (!scrollRef.current) return
        const scrollAmount = 400
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    // 3D Carousel Component for Sports Theme (Panoramic Arc)
    if (isSports) {
        return (
            <motion.div 
                className="relative h-[320px] sm:h-[480px] w-full flex flex-col items-center justify-center overflow-visible select-none cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.05}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                onDrag={(_, info) => x.set(info.offset.x)}
                onDragEnd={(_, info) => {
                    x.set(0)
                    const threshold = 30
                    if (info.offset.x < -threshold) {
                        setCurrentIndex((prev) => (prev + 1) % originalCount)
                    } else if (info.offset.x > threshold) {
                        setCurrentIndex((prev) => (prev - 1 + originalCount) % originalCount)
                    }
                }}
            >
                <div 
                    className="relative w-full h-[200px] sm:h-[350px] flex items-center justify-center"
                    style={{ perspective: "3000px" }}
                >
                    {categories.map((cat, index) => {
                        // Logic to calculate position based on currentIndex
                        let offset = index - currentIndex
                        // Circular logic
                        if (offset > originalCount / 2) offset -= originalCount
                        if (offset < -originalCount / 2) offset += originalCount

                        const absOffset = Math.abs(offset)
                        const isCenter = index === currentIndex
                        
                        // Tight panoramic spacing (Overlap for "no gap" look)
                        const cardWidth = window.innerWidth < 640 ? 280 : 550
                        const spacing = window.innerWidth < 640 ? 130 : 300
                        const rotate = offset * (window.innerWidth < 640 ? 25 : 30)
                        const xPos = offset * spacing 
                        const z = -absOffset * (window.innerWidth < 640 ? 150 : 250) 
                        const scale = 1 - absOffset * 0.1
                        const opacity = 1 - absOffset * 0.4

                        return (
                            <motion.div
                                key={cat.id}
                                className="absolute aspect-video cursor-pointer"
                                style={{ width: cardWidth }}
                                initial={false}
                                animate={{
                                    x: xPos,
                                    scale: scale,
                                    rotateY: rotate,
                                    z: z,
                                    opacity: opacity,
                                    zIndex: originalCount - absOffset
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    mass: 1
                                }}
                                onClick={(e) => {
                                    // Prevent click if we were dragging
                                    if (Math.abs(x.get()) > 5) {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    } else {
                                        setCurrentIndex(index)
                                    }
                                }}
                            >
                                <Link
                                    href={`/s/${slug}/products?category=${encodeURIComponent(cat.name)}`}
                                    className={`block w-full h-full group relative rounded-[20px] sm:rounded-[32px] overflow-visible border-2 border-white shadow-2xl bg-zinc-900 transition-shadow duration-500 ${isCenter ? 'ring-4 ring-white/30' : ''}`}
                                    draggable={false}
                                >
                                    <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
                                        <OptimizedImage 
                                            src={cat.image || `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop`} 
                                            alt={cat.name} 
                                            fill
                                            className={`object-cover group-hover:scale-110 transition-transform duration-700 ${isCenter ? 'opacity-100' : 'opacity-40'} group-hover:opacity-100`} 
                                            draggable={false}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    </div>

                                    {/* Realistic Floor Reflection (Reduced height & opacity) */}
                                    <div 
                                        className="absolute top-[100%] left-0 right-0 h-[25%] sm:h-[35%] pointer-events-none opacity-[0.15] select-none overflow-hidden"
                                        style={{ 
                                            transform: "scaleY(-1) translateY(-2px)",
                                            maskImage: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                                        }}
                                    >
                                        <OptimizedImage 
                                            src={cat.image || `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop`} 
                                            alt="" 
                                            fill
                                            className="object-cover brightness-75 blur-[1px]" 
                                            draggable={false}
                                        />
                                    </div>
                                    
                                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-center">
                                        <h3 className="text-white font-bold capitalize tracking-tight text-base sm:text-xl leading-none drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity">
                                            {cat.name}
                                        </h3>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Panoramic Dots Navigation */}
                <div className="mt-8 flex gap-2 z-30">
                    {categories.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>

                {/* Sports Navigation Arrows (More prominent) */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-[-10px] sm:left-[-30px] top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-white backdrop-blur-md border border-zinc-200 text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-[-10px] sm:right-[-30px] top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 bg-white backdrop-blur-md border border-zinc-200 text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all active:scale-95"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </motion.div>
        )
    }

    return (
        <div 
            className="relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Navigation Arrows */}
            <button
                onClick={() => scroll("left")}
                className={`absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex
                    ${storeTheme === 'aura' ? 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800' : 'bg-white border-zinc-100 text-zinc-400 hover:text-black'}`}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
                onClick={() => scroll("right")}
                className={`absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex
                    ${storeTheme === 'aura' ? 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800' : 'bg-white border-zinc-100 text-zinc-400 hover:text-black'}`}
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div 
                ref={scrollRef}
                className="flex overflow-x-auto pb-6 gap-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {displayCategories.map((cat: any, index) => {
                    const img = cat.image || `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop`
                    return (
                        <Link
                            key={`${cat.id}-${index}`}
                            href={`/s/${slug}/products?category=${encodeURIComponent(cat.name)}`}
                            className="group/item relative overflow-hidden rounded-[32px] aspect-square text-white flex flex-col items-center justify-end p-6 shadow-sm hover:shadow-xl transition-all duration-500 shrink-0 w-[140px] sm:w-[200px] snap-start border border-zinc-100/50"
                        >
                            <div className="absolute inset-0">
                                <OptimizedImage 
                                    src={img} 
                                    alt={cat.name} 
                                    fill
                                    className="object-cover group-hover/item:scale-110 transition-transform duration-700" 
                                    sizes="(max-width: 640px) 140px, 200px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/item:opacity-100 transition-opacity" />
                            </div>

                            <div className="relative z-10 text-center">
                                <span className="text-[11px] font-bold drop-shadow-2xl">{cat.name}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

