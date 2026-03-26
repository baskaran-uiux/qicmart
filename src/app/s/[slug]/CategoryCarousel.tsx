"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoryCarouselProps {
    categories: any[]
    slug: string
}

export default function CategoryCarousel({ categories, slug }: CategoryCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)
    const [isHovering, setIsHovering] = useState(false)

    // Triple the categories for a seamless infinite effect
    const displayCategories = [...categories, ...categories, ...categories]
    const originalCount = categories.length

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)

        // Seamless Loop Logic: If we scroll past the first set, or before it
        const setWidth = scrollWidth / 3
        if (scrollLeft <= 0) {
            scrollRef.current.scrollLeft = setWidth
        } else if (scrollLeft >= setWidth * 2) {
            scrollRef.current.scrollLeft = setWidth
        }
    }

    useEffect(() => {
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
    }, [originalCount])

    // Auto-move every 5 seconds
    useEffect(() => {
        if (isHovering || originalCount === 0) return

        const interval = setInterval(() => {
            autoScroll()
        }, 5000)

        return () => clearInterval(interval)
    }, [isHovering, originalCount])

    const autoScroll = () => {
        if (!scrollRef.current) return
        // Scroll by one item's width (200px + 16px gap)
        const itemWidth = window.innerWidth < 640 ? 156 : 216 
        scrollRef.current.scrollBy({
            left: itemWidth,
            behavior: "smooth"
        })
    }

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = 400
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
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
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-zinc-100 rounded-full shadow-lg flex items-center justify-center text-zinc-400 hover:text-black hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
                onClick={() => scroll("right")}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-zinc-100 rounded-full shadow-lg flex items-center justify-center text-zinc-400 hover:text-black hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
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
                            className="group/item relative overflow-hidden rounded-[32px] aspect-square text-white flex flex-col items-center justify-end p-6 shadow-sm hover:shadow-2xl transition-all duration-500 shrink-0 w-[140px] sm:w-[200px] snap-start border border-zinc-100/50"
                        >
                            <div className="absolute inset-0">
                                <img src={img} alt={cat.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
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
