"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const RANGES = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "All Time", value: "all" },
]

export default function DashboardFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const currentRange = searchParams.get("range") || "all"
    const selectedRange = RANGES.find(r => r.value === currentRange) || RANGES[3]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("range")
        } else {
            params.set("range", value)
        }
        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pr-4 pl-4 py-2 bg-indigo-600 text-white rounded-full text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
                <Filter size={14} />
                <span>{selectedRange.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full z-50 w-48 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
                    >
                        <div className="p-2">
                            {RANGES.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => handleSelect(range.value)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-bold rounded-xl transition-colors ${
                                        currentRange === range.value 
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    {range.label}
                                    {currentRange === range.value && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
