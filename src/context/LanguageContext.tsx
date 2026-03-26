"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { translations, Language, TranslationKey } from "@/lib/translations"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
    language: "English",
    setLanguage: () => {},
    t: (key: TranslationKey) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("English")

    useEffect(() => {
        const saved = localStorage.getItem("storefront-language") as Language
        if (saved && translations[saved]) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("storefront-language", lang)
    }

    const t = (key: TranslationKey): string => {
        return translations[language]?.[key] || translations["English"][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
