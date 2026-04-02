"use client"

import { Star, ShieldCheck, User } from "lucide-react"
import { motion } from "framer-motion"

interface Review {
    id: number | string
    author: string
    avatar?: string
    rating: number
    text: string
    date?: string
}

interface GoogleReviewsProps {
    reviews: Review[]
    storeName: string
}

export default function GoogleReviews({ reviews, storeName }: GoogleReviewsProps) {
    if (!reviews || reviews.length === 0) return null

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "5.0"

    // Duplicate reviews for infinite scroll
    // Increase duplication if the number of reviews is small to ensure smooth transition
    const displayReviews = reviews.length < 10 
        ? [...reviews, ...reviews, ...reviews, ...reviews] 
        : [...reviews, ...reviews]

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 mb-16 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600 text-xs font-bold">
                            <Star size={14} fill="currentColor" />
                            Customer Testimonials
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-none italic">Loved by our shoppers</h2>
                        <p className="text-zinc-500 font-medium max-w-xl text-lg leading-relaxed">Join thousands of happy customers at {storeName}. Here's why we're their first choice.</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-[40px] border border-zinc-100 shadow-2xl shadow-zinc-500/5">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={28} fill={Number(averageRating) >= i ? "currentColor" : "none"} className={Number(averageRating) >= i ? "text-amber-400" : "text-zinc-200"} />)}
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-zinc-900 leading-none">{averageRating} / 5.0</p>
                            <p className="text-xs font-bold text-zinc-400 mt-2 flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Verified Experience
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Continuous Infinite Carousel */}
            <div className="relative flex overflow-hidden">
                <motion.div 
                    className="flex gap-8 px-4"
                    animate={{
                        x: [0, -1035] // Roughly half the width of duplicated content
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    whileHover={{ animationPlayState: 'paused' }}
                >
                    {displayReviews.map((review, idx) => (
                        <div 
                            key={`${review.id}-${idx}`}
                            className="w-[350px] shrink-0 bg-zinc-50/50 p-10 rounded-[48px] border border-zinc-100 hover:border-indigo-200 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col justify-between group h-[300px]"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-amber-400" : "text-zinc-200"} />)}
                                    </div>
                                    <span className="text-[11px] text-zinc-400 font-bold">{review.date || "Verified"}</span>
                                </div>
                                <p className="text-zinc-700 font-medium leading-relaxed italic text-lg line-clamp-4">"{review.text}"</p>
                            </div>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-lg overflow-hidden border-2 border-white shadow-sm ring-4 ring-zinc-50 ring-offset-0 group-hover:ring-indigo-50 transition-all">
                                    {review.avatar ? (
                                        <img src={review.avatar} alt={review.author || "Shopper"} className="w-full h-full object-cover" />
                                    ) : review.author ? review.author.charAt(0) : <User size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-zinc-900 group-hover:text-indigo-600 transition-colors tracking-tight">{review.author || "Valued Customer"}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Purchase Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
