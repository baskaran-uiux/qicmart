"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    image: string
    quantity: number
    options?: Record<string, string>
    slug: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, "id">) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
    isInCart: (productId: string, options?: Record<string, string>) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("cart")
            if (saved) setItems(JSON.parse(saved))
        } catch { }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("cart", JSON.stringify(items))
        }
    }, [items, isInitialized])

    const addItem = (newItem: Omit<CartItem, "id">) => {
        const optionsKey = newItem.options ? Object.entries(newItem.options).sort().map(([k, v]) => `${k}:${v}`).join("|") : "none"
        const id = `${newItem.productId}-${optionsKey}`
        setItems((prev) => {
            const existing = prev.find((i) => i.id === id)
            if (existing) {
                return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i)
            }
            return [...prev, { ...newItem, id }]
        })
    }

    const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return removeItem(id)
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i))
    }

    const clearCart = () => setItems([])

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

    const isInCart = (productId: string, options?: Record<string, string>) => {
        const optionsKey = options ? Object.entries(options).sort().map(([k, v]) => `${k}:${v}`).join("|") : "none"
        const id = `${productId}-${optionsKey}`
        return items.some((i) => i.id === id)
    }

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isInCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error("useCart must be used within CartProvider")
    return ctx
}
