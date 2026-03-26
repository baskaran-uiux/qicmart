"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StaggeredGridProps {
    children: ReactNode
    className?: string
    delay?: number
}

export default function StaggeredGrid({ children, className, delay = 0.1 }: StaggeredGridProps) {
    const gridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: delay
            }
        }
    }

    return (
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={gridVariants}
            className={className}
        >
            {children}
        </motion.div>
    )
}
