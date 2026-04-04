"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import React from "react"
import { LucideIcon } from "lucide-react"

interface PremiumButtonProps {
    children: React.ReactNode
    icon?: LucideIcon
    onClick?: (e?: React.MouseEvent) => void
    href?: string
    className?: string
    iconClassName?: string
    variant?: "primary" | "outline"
    size?: "sm" | "md" | "lg"
    isLoading?: boolean
    isSaved?: boolean
    loadingText?: string
    savedText?: string
    type?: "button" | "submit"
    disabled?: boolean
}

export default function PremiumButton({
    children,
    icon: Icon,
    onClick,
    href,
    className = "",
    iconClassName = "",
    variant = "primary",
    size = "md",
    isLoading = false,
    isSaved = false,
    loadingText = "Saving...",
    savedText = "Saved",
    type = "button",
    disabled = false
}: PremiumButtonProps) {
    const sizeClasses = {
        sm: "px-5 py-2.5 text-[11px]",
        md: "px-7 py-3 text-[13px]",
        lg: "px-9 py-4 text-[15px]"
    }

    const baseClasses = `group relative inline-flex items-center gap-2.5 rounded-2xl font-medium tracking-wide transition-all duration-500 hover:scale-[1.05] active:scale-[0.95] overflow-hidden border border-white/10 shadow-xl ${sizeClasses[size]} ${className}`
    
    const variantClasses = variant === "primary" 
        ? "bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-violet-500 dark:to-indigo-600 text-white hover:shadow-[0_20px_40px_rgba(124,58,237,0.3)] dark:hover:shadow-[0_20px_40px_rgba(139,92,246,0.3)] shadow-purple-500/10 dark:shadow-indigo-500/20"
        : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"

    const content = (
        <>
            <style jsx>{`
                @keyframes shootingStar {
                    0% { transform: translateX(-200%) translateY(-200%) rotate(45deg); opacity: 0; }
                    10% { opacity: 1; }
                    40% { transform: translateX(200%) translateY(200%) rotate(45deg); opacity: 0; }
                    100% { transform: translateX(200%) translateY(200%) rotate(45deg); opacity: 0; }
                }
                .star {
                    position: absolute;
                    width: 150px;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.4), transparent);
                    animation: shootingStar 4s infinite linear;
                    pointer-events: none;
                    z-index: 5;
                }
                .star:nth-child(1) { top: -20%; left: -20%; animation-delay: 0s; }
                .star:nth-child(2) { top: 20%; left: -40%; animation-delay: 1.5s; }
                .star:nth-child(3) { top: 50%; left: -10%; animation-delay: 2.5s; }
                .star:nth-child(4) { top: 80%; left: -50%; animation-delay: 3.5s; }
            `}</style>
            
            {/* Shooting Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="star" />
                <div className="star" />
                <div className="star" />
                <div className="star" />
            </div>

            {/* Shine Sweep Effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] z-10" />
            
            <div className={`relative h-6 overflow-hidden z-20 ${isLoading || isSaved ? 'w-full text-center' : ''}`}>
                <motion.div
                    initial={false}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col"
                >
                    <span className="group-hover:-translate-y-full transition-transform duration-500 whitespace-nowrap">
                        {isLoading ? loadingText : isSaved ? savedText : children}
                    </span>
                    <span className="absolute top-full group-hover:-translate-y-full transition-transform duration-500 whitespace-nowrap flex items-center gap-2">
                        {isLoading ? loadingText : isSaved ? savedText : children}
                    </span>
                </motion.div>
            </div>

            {!isLoading && !isSaved && Icon && <Icon size={size === "sm" ? 14 : 16} className={`group-hover:translate-x-1 group-hover:rotate-12 transition-transform duration-300 relative z-20 shrink-0 ${iconClassName}`} />}
        </>
    )

    if (href) {
        return (
            <Link href={href} className={`${baseClasses} ${variantClasses}`}>
                {content}
            </Link>
        )
    }

    return (
        <button 
            type={type}
            onClick={onClick} 
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variantClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {content}
        </button>
    )
}
