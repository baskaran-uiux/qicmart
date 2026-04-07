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
        sm: "px-3 py-1.5 text-[10px]",
        md: "px-4 py-2 text-[12px]",
        lg: "px-5 py-3 text-[14px]"
    }

    const baseClasses = `group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden border border-white/10 shadow-lg ${sizeClasses[size]}`
    
    const variantClasses = variant === "primary" 
        ? "bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-500 dark:to-purple-600 text-white hover:shadow-[0_10px_30px_rgba(124,58,237,0.2)]"
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
                    width: 100px;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.4), transparent);
                    animation: shootingStar 6s infinite linear;
                    pointer-events: none;
                    z-index: 5;
                }
                .star:nth-child(1) { top: -20%; left: -20%; animation-delay: 0s; }
                .star:nth-child(2) { top: 20%; left: -40%; animation-delay: 2s; }
                .star:nth-child(3) { top: 50%; left: -10%; animation-delay: 4s; }
            `}</style>
            
            {/* Shooting Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="star" />
                <div className="star" />
                <div className="star" />
            </div>

            {/* Shine Sweep Effect */}
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-10" />
            
            <div className={`relative overflow-hidden z-20 flex items-center h-5 ${isLoading || isSaved ? 'w-full text-center justify-center' : ''}`}>
                <motion.div
                    initial={false}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center gap-2 group-hover:-translate-y-full transition-transform duration-500 whitespace-nowrap">
                        <span>{isLoading ? loadingText : isSaved ? savedText : children}</span>
                    </div>
                    <div className="absolute top-full flex items-center gap-2 group-hover:-translate-y-full transition-transform duration-500 whitespace-nowrap">
                        <span>{isLoading ? loadingText : isSaved ? savedText : children}</span>
                    </div>
                </motion.div>
            </div>

            {!isLoading && !isSaved && Icon && <Icon size={size === "sm" ? 14 : 16} className={`group-hover:translate-x-1 group-hover:rotate-12 transition-transform duration-300 relative z-20 shrink-0 ${iconClassName}`} />}
        </>
    )

    if (href) {
        return (
            <Link href={href} className={`${baseClasses} ${variantClasses} ${className}`}>
                {content}
            </Link>
        )
    }

    return (
        <button 
            type={type}
            onClick={onClick} 
            disabled={disabled || isLoading}
            className={`${baseClasses} ${variantClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {content}
        </button>
    )
}
