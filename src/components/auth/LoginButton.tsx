"use client"

import { signIn, useSession } from "next-auth/react"
import { Chrome, ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"

export default function LoginButton() {
    const { status } = useSession()
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        try {
            await signIn("google", { callbackUrl: "/" })
        } catch (error) {
            console.error("Login failed:", error)
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading" || loading) {
        return (
            <button disabled className="px-6 py-3 bg-zinc-800 text-zinc-400 rounded-2xl font-bold flex items-center gap-3 opacity-50 cursor-not-allowed">
                <Loader2 size={20} className="animate-spin" />
                <span>Redirecting...</span>
            </button>
        )
    }

    return (
        <button 
            onClick={handleLogin}
            className="px-6 py-3 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5 group"
        >
            <Chrome size={20} />
            <span>Continue with Google</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
    )
}
