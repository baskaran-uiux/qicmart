"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, Check, X, ShieldCheck, Loader2 } from "lucide-react"

export function SessionManager() {
    const { data: session, status } = useSession()
    const [pendingRequests, setPendingRequests] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (status !== "authenticated" || !session?.user) return

        const heartbeat = async () => {
            try {
                const res = await fetch("/api/auth/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: (session.user as any).sessionId })
                })
                const data = await res.json()

                if (data.status === "INVALID_SESSION") {
                    signOut({ callbackUrl: "/login?error=SessionExpired" })
                    return
                }

                if (data.pendingCount > 0) {
                    fetchPendingRequests()
                }
            } catch (err) {
                console.error("Heartbeat error:", err)
            }
        }

        const fetchPendingRequests = async () => {
            try {
                const res = await fetch("/api/auth/login-request/active")
                const data = await res.json()
                setPendingRequests(data.requests || [])
            } catch (err) {
                console.error("Fetch requests error:", err)
            }
        }

        const interval = setInterval(heartbeat, 15000) // Every 15 seconds
        heartbeat()

        return () => clearInterval(interval)
    }, [status, session])

    const handleAction = async (requestId: string, action: "APPROVED" | "REJECTED") => {
        setIsProcessing(true)
        try {
            await fetch("/api/auth/login-request/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action })
            })
            setPendingRequests(prev => prev.filter(r => r.id !== requestId))

            // If approved, we logout IMMEDIATELY for a better UX
            if (action === "APPROVED") {
                signOut({ callbackUrl: "/login?message=AccountTakenOver" })
            }
        } catch (err) {
            console.error("Action error:", err)
        } finally {
            setIsProcessing(false)
        }
    }

    if (pendingRequests.length === 0) return null

    return (
        <AnimatePresence>
            {pendingRequests.map((request) => (
                <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-[9999] w-96 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-zinc-100 p-8 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <ShieldAlert className="w-24 h-24 text-indigo-600" />
                    </div>

                    <div className="relative space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-zinc-900 leading-none">Security Alert</h4>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1.5">New Login Attempt</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                Someone is trying to log in to your account from a new device. Do you want to allow them?
                            </p>
                            
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                                    <span>Location/IP</span>
                                    <span className="text-zinc-900">{request.requesterIp || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                                    <span>Time</span>
                                    <span className="text-zinc-900">{new Date(request.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handleAction(request.id, "REJECTED")}
                                disabled={isProcessing}
                                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Deny
                            </button>
                            <button
                                onClick={() => handleAction(request.id, "APPROVED")}
                                disabled={isProcessing}
                                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Allow
                            </button>
                        </div>
                        
                        <p className="text-[10px] text-center font-bold text-zinc-300 uppercase tracking-tighter">
                            Allowing will automatically log you out.
                        </p>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
    )
}
