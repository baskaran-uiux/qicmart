"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, ShoppingBag, X, Star } from "lucide-react"
import Link from "next/link"

interface Notification {
    id: string
    title: string
    message: string
    time: string
    link: string
    type?: 'ORDER' | 'REVIEW'
}

export function Notifications({ ownerId }: { ownerId?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [lastViewedAt, setLastViewedAt] = useState<number>(0)
    const [lastClearedAt, setLastClearedAt] = useState<number>(0)
    const [dismissedIds, setDismissedIds] = useState<string[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const savedDismissed = localStorage.getItem("notifications-dismissed")
        if (savedDismissed) setDismissedIds(JSON.parse(savedDismissed))
        const savedViewed = localStorage.getItem("notifications-last-viewed")
        if (savedViewed) setLastViewedAt(parseInt(savedViewed))

        const savedCleared = localStorage.getItem("notifications-last-cleared")
        if (savedCleared) setLastClearedAt(parseInt(savedCleared))

        const fetchNotifications = async () => {
            try {
                const url = ownerId 
                    ? `/api/dashboard/notifications?ownerId=${ownerId}` 
                    : "/api/dashboard/notifications"
                const res = await fetch(url)
                const data = await res.json()
                if (data.notifications) {
                    setNotifications(data.notifications)
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err)
            }
        }

        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [ownerId])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const activeNotifications = notifications.filter(n => 
        new Date(n.time).getTime() > lastClearedAt && 
        !dismissedIds.includes(n.id)
    )
    const unreadCount = activeNotifications.filter(n => new Date(n.time).getTime() > lastViewedAt).length

    const handleToggle = () => {
        const nextState = !isOpen
        setIsOpen(nextState)
        if (nextState) {
            const now = Date.now()
            setLastViewedAt(now)
            localStorage.setItem("notifications-last-viewed", String(now))
        }
    }

    const handleClearAll = () => {
        const now = Date.now()
        setLastClearedAt(now)
        setLastViewedAt(now) // Also clear badge
        setDismissedIds([]) // Reset individual dismissals if we cleared all by time
        localStorage.setItem("notifications-last-cleared", String(now))
        localStorage.setItem("notifications-last-viewed", String(now))
        localStorage.removeItem("notifications-dismissed")
    }

    const handleDismissOne = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        const newDismissed = [...dismissedIds, id]
        setDismissedIds(newDismissed)
        localStorage.setItem("notifications-dismissed", JSON.stringify(newDismissed))
    }

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button 
                onClick={handleToggle}
                className="relative p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all"
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-bold text-white text-[9px] shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                                <Bell size={14} className="text-zinc-400" /> Notifications
                            </h4>
                            <div className="flex items-center gap-3">
                                {activeNotifications.length > 0 && (
                                    <button 
                                        onClick={handleClearAll}
                                        className="text-[10px] uppercase tracking-widest font-black text-rose-500 hover:text-rose-600 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <span className="text-xs text-zinc-500 font-medium">{unreadCount} new</span>
                                )}
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {activeNotifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No new notifications yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {activeNotifications.map((n) => {
                                        const finalLink = ownerId ? `${n.link}?ownerId=${ownerId}` : n.link
                                        return (
                                            <div className="flex items-start justify-between gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                                <Link 
                                                    href={finalLink} 
                                                    className="flex items-start gap-3 flex-1"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                        n.type === 'REVIEW' 
                                                            ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' 
                                                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    }`}>
                                                        {n.type === 'REVIEW' ? <Star size={14} /> : <ShoppingBag size={14} />}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-sm text-black dark:text-white">{n.title}</h5>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{n.message}</p>
                                                        <span className="text-[10px] text-zinc-400 font-medium mt-1.5 block">
                                                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <button 
                                                    onClick={(e) => handleDismissOne(e, n.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all"
                                                    title="Dismiss"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
