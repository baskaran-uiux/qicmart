"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { translations, Language, TranslationKey } from "@/lib/translations"

interface DashboardStoreContextType {
    id: string
    name: string
    logo: string | null
    currency: string
    loading: boolean
    hasStore: boolean
    isAdminPanelDisabled: boolean
    slug: string | null
    subscription: { plan: string; maxProducts: number } | null
    fontFamily: string
    primaryColor: string
    dashboardType: string
    userImage: string | null
    language: Language
    t: (key: TranslationKey) => string
    setLanguage: (lang: Language) => void
    whatsappNumber?: string
    whatsappMessage?: string
    storeTheme?: string
    aiCredits: number
    updateCredits: (credits: number) => void
}

const DashboardStoreContext = createContext<DashboardStoreContextType>({
    id: "",
    name: "Admin",
    logo: null,
    currency: "INR",
    loading: true,
    hasStore: false,
    isAdminPanelDisabled: false,
    slug: null,
    subscription: null,
    fontFamily: "Inter",
    primaryColor: "purple",
    dashboardType: "1",
    userImage: null,
    language: "English",
    t: (key: TranslationKey) => key,
    setLanguage: () => {},
    whatsappNumber: "",
    whatsappMessage: "",
    storeTheme: "modern",
    aiCredits: 0,
    updateCredits: () => {}
})

export function DashboardStoreProvider({ children, dashboardType = "1" }: { children: React.ReactNode, dashboardType?: string }) {
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")?.trim()

    const [store, setStore] = useState<DashboardStoreContextType>({
        id: "",
        name: "Admin",
        logo: null,
        currency: "INR",
        loading: true,
        hasStore: false,
        isAdminPanelDisabled: false,
        slug: null,
        subscription: null,
        fontFamily: "Inter",
        primaryColor: "purple",
        dashboardType,
        userImage: null,
        language: "English",
        t: (key: TranslationKey) => key,
        setLanguage: (lang: Language) => {
            setStore(prev => ({
                ...prev,
                language: lang,
                t: (k: TranslationKey) => translations[lang]?.[k] || translations["English"][k] || k
            }))
        },
        storeTheme: "modern",
        aiCredits: 0,
        updateCredits: (credits: number) => {
            setStore(prev => ({ ...prev, aiCredits: credits }))
        }
    })

    useEffect(() => {
        let fetchUrl = `/api/dashboard/settings?dashboardType=${dashboardType}`
        if (ownerId) fetchUrl += `&ownerId=${ownerId}`

        fetch(fetchUrl)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    setStore(s => ({ ...s, loading: false }))
                    return
                }
                const lang = (data.language || "English") as Language
                setStore(prev => ({
                    ...prev,
                    id: data.id || "",
                    name: data.name || "Admin",
                    logo: data.logo || null,
                    currency: data.currency || "INR",
                    loading: false,
                    hasStore: !!data.hasStore,
                    isAdminPanelDisabled: !!data.isAdminPanelDisabled,
                    slug: data.slug || null,
                    subscription: data.subscription || null,
                    fontFamily: data.fontFamily || "Inter",
                    primaryColor: data.primaryColor || "purple",
                    userImage: data.userImage || null,
                    language: lang,
                    t: (key: TranslationKey) => {
                        const dict = (translations as any)[lang] || translations["English"];
                        return dict[key] || (translations["English"] as any)[key] || key;
                    },
                    whatsappNumber: data.whatsappNumber || "",
                    whatsappMessage: data.whatsappMessage || "",
                    storeTheme: data.storeTheme || "modern",
                    aiCredits: data.aiCredits || 0,
                    updateCredits: (credits: number) => {
                        setStore(prev => ({ ...prev, aiCredits: credits }))
                    }
                }))
            })
            .catch((err) => {
                console.error("Dashboard Settings Fetch Exception:", err)
                setStore(s => ({ ...s, loading: false }))
            })
    }, [ownerId, dashboardType])

    return (
        <DashboardStoreContext.Provider value={store}>
            {children}
        </DashboardStoreContext.Provider>
    )
}

export const useDashboardStore = () => useContext(DashboardStoreContext)
