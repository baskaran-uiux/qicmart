"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CompareItem {
    id: string
    name: string
    price: number
    image: string
    slug: string
    description?: string | null
    stock: number
}

interface CompareContextType {
    items: CompareItem[]
    addItem: (item: CompareItem) => void
    removeItem: (id: string) => void
    toggleItem: (item: CompareItem) => void
    isCompared: (id: string) => boolean
    clearCompare: () => void
    totalItems: number
}

const CompareContext = createContext<CompareContextType | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CompareItem[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("compare")
            if (saved) setItems(JSON.parse(saved))
        } catch { }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("compare", JSON.stringify(items))
        }
    }, [items, isInitialized])

    const addItem = (item: CompareItem) => {
        if (items.length >= 4) return // max 4
        setItems((prev) => prev.some((i) => i.id === item.id) ? prev : [...prev, item])
    }

    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

    const toggleItem = (item: CompareItem) => {
        if (items.some((i) => i.id === item.id)) {
            removeItem(item.id)
        } else {
            addItem(item)
        }
    }

    const isCompared = (id: string) => items.some((i) => i.id === id)
    const clearCompare = () => setItems([])
    const totalItems = items.length

    return (
        <CompareContext.Provider value={{ items, addItem, removeItem, toggleItem, isCompared, clearCompare, totalItems }}>
            {children}
        </CompareContext.Provider>
    )
}

export function useCompare() {
    const ctx = useContext(CompareContext)
    if (!ctx) throw new Error("useCompare must be used within CompareProvider")
    return ctx
}
