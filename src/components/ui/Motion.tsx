"use client"

import { motion, AnimatePresence } from "framer-motion"

export const MotionDiv = motion.div
export const MotionSection = motion.section
export const MotionNav = motion.nav
export const MotionHeader = motion.header
export const MotionAside = motion.aside
export const Presence = AnimatePresence

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
}

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
}

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}
