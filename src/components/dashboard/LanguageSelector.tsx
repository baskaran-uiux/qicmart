"use client"

import React, { useState } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { Language, translations } from "@/lib/translations"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function LanguageSelector() {
    const { language, setLanguage, t, dashboardType } = useDashboardStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")?.trim()

    const languages: Language[] = ["English", "Tamil", "Hindi"]

    const handleLanguageChange = async (newLang: Language) => {
        if (newLang === language) {
            setIsOpen(false)
            return
        }

        setIsUpdating(true)
        setIsOpen(false)

        try {
            // Update local state first for immediate UI response
            setLanguage(newLang)

            // Persist to database
            let url = `/api/dashboard/settings?dashboardType=${dashboardType}`
            if (ownerId) url += `&ownerId=${ownerId}`

            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: newLang })
            })

            if (!res.ok) {
                throw new Error("Failed to save language preference")
            }

            toast.success(t("languageUpdated"))
        } catch (error) {
            console.error("Language update error:", error)
            toast.error(t("failedToSaveLanguage"))
            // Revert on error? Or just let it be. Usually better to stay on what user selected locally.
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-[13px] font-medium border border-transparent focus:border-indigo-500/50 outline-none"
                disabled={isUpdating}
            >
                <Globe size={16} className={isUpdating ? "animate-spin text-indigo-500" : "text-zinc-500"} />
                <span className="hidden sm:inline">{language}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden p-1"
                        >
                            <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                {t("selectLanguage")}
                            </div>
                            {languages.map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors ${
                                        language === lang
                                            ? "bg-indigo-500/10 text-indigo-500 font-semibold"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    <span>{lang}</span>
                                    {language === lang && <Check size={14} />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
