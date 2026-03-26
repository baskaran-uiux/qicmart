"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface WishlistItem {
    id: string
    name: string
    price: number
    image: string
    slug: string
    compareAtPrice?: number | null
}

interface WishlistContextType {
    items: WishlistItem[]
    addItem: (item: WishlistItem) => void
    removeItem: (id: string) => void
    toggleItem: (item: WishlistItem) => void
    isWishlisted: (id: string) => boolean
    totalItems: number
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("wishlist")
            if (saved) setItems(JSON.parse(saved))
        } catch { }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("wishlist", JSON.stringify(items))
        }
    }, [items, isInitialized])

    const addItem = (item: WishlistItem) => {
        setItems((prev) => prev.some((i) => i.id === item.id) ? prev : [...prev, item])
    }

    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

    const toggleItem = (item: WishlistItem) => {
        if (items.some((i) => i.id === item.id)) {
            removeItem(item.id)
        } else {
            addItem(item)
        }
    }

    const isWishlisted = (id: string) => items.some((i) => i.id === id)

    const totalItems = items.length

    return (
        <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isWishlisted, totalItems }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const ctx = useContext(WishlistContext)
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
    return ctx
}
