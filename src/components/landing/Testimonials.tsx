"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
    {
        name: "Arjun Mehta",
        role: "Founder, Urban Threads",
        content: "Qicmart transformed our local boutique into a national brand. The AI tools for product descriptions saved us weeks of work.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
        name: "Sarah Jenkins",
        role: "CEO, Glow Kitchen",
        content: "The mobile speed is incredible. Our conversion rate jumped by 40% in the first month after switching to Qicmart's infrastructure.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
        name: "Vikram Singh",
        role: "Director, TechGadget India",
        content: "Managing 10,000+ SKUs used to be a nightmare. Qicmart's dashboard is modern, fast, and actually fun to use.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
    },
    {
        name: "Priya Sharma",
        role: "Artisan, Handcrafted Bliss",
        content: "I started with zero coding knowledge. Within 30 minutes, my store was live and accepting UPI payments. Truly revolutionary.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
    }
];

export default function Testimonials() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <section id="reviews" className="py-24 relative overflow-hidden bg-black">
            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mono-label mb-4 !text-indigo-400"
                    >
                        / GLOBAL_VOICES
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black uppercase italic leading-none text-white"
                    >
                        Success Stories from <br /> <span className="text-indigo-500">The Edge</span>.
                    </motion.h2>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Carousel Container */}
                    <div className="relative h-[400px] md:h-[350px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full bg-zinc-900/50 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[40px] flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group"
                            >
                                {/* Decorative Quote Icon */}
                                <Quote className="absolute top-6 right-8 text-indigo-500/20 w-24 h-24 -z-10" />

                                <div className="shrink-0">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                                        <img 
                                            src={testimonials[current].image} 
                                            alt={testimonials[current].name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                                        {[...Array(testimonials[current].rating)].map((_, i) => (
                                            <Star key={i} size={16} className="fill-indigo-500 text-indigo-500" />
                                        ))}
                                    </div>
                                    <p className="text-xl md:text-2xl font-medium text-white mb-8 italic leading-relaxed">
                                        "{testimonials[current].content}"
                                    </p>
                                    <div>
                                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">
                                            {testimonials[current].name}
                                        </h4>
                                        <p className="mono-label !text-zinc-500 !text-[10px]">
                                            {testimonials[current].role}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-center gap-6 mt-8 md:mt-0 md:absolute md:-bottom-20 md:left-1/2 md:-translate-x-1/2">
                        <button
                            onClick={prev}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
