"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShoppingBag, Rocket, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function OnboardingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [storeName, setStoreName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (status === "loading") return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    )

    if (status === "unauthenticated") {
        router.push("/")
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (storeName.length < 3) {
            setError("Store name is too short")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: storeName })
            })

            const data = await res.json()

            if (data.success) {
                // Refresh session to pick up new role/store status if needed
                // But simplified: just redirect to dashboard
                router.push("/dashboard")
                router.refresh()
            } else {
                setError(data.error || "Something went wrong")
            }
        } catch (err) {
            setError("Failed to create store. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles size={12} className="text-indigo-400" />
                        Complete Your Setup
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight mb-4 leading-none">
                        Welcome, <span className="text-indigo-400">{session?.user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">One last step to launch your commerce empire.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-6 mb-2 block">What should we call your store?</label>
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value)
                                    if (error) setError("")
                                }}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] px-8 py-6 text-2xl font-bold outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700"
                                placeholder="e.g. My Awesome Shop"
                                disabled={loading}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-indigo-500/50 transition-colors">
                                <ShoppingBag size={28} />
                            </div>
                        </div>
                        <AnimatePresence>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-sm font-bold mt-4 ml-6"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || storeName.length < 3}
                        className="w-full group relative overflow-hidden bg-white text-black py-6 rounded-[32px] font-black uppercase italic tracking-widest text-lg transition-all hover:bg-indigo-500 hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Launch My Store
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-12 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    By launching, you agree to our terms of service and privacy policy.
                </p>
            </motion.div>
        </div>
    )
}
