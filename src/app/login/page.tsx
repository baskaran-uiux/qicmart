"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react"

const GRAIN_URL = "https://grainy-gradients.vercel.app/noise.svg"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
    const [approvalStatus, setApprovalStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")

    // Cleanup: Removed test-mode auto-login helpers to ensure production security.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setLoading(false)
            if (res.error.startsWith("PENDING_APPROVAL:")) {
                const requestId = res.error.split(":")[1]
                setPendingRequestId(requestId)
            } else {
                setError("Invalid email or password")
            }
        } else {
            handleLoginSuccess()
        }
    }

    const handleLoginSuccess = async () => {
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()
        const role = session?.user?.role

        if (role === "SUPER_ADMIN") {
            router.push("/admin")
        } else if (role === "STORE_OWNER" || role === "STAFF") {
            router.push("/dashboard")
        } else {
            router.push("/")
        }
    }

    // Polling for Approval
    useEffect(() => {
        if (!pendingRequestId || approvalStatus !== "PENDING") return

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/auth/login-request/status/${pendingRequestId}`)
                const data = await res.json()
                
                if (data.status === "APPROVED") {
                    setApprovalStatus("APPROVED")
                    clearInterval(interval)
                    // Complete login after approval
                    await signIn("credentials", { email, password, redirect: false })
                    handleLoginSuccess()
                } else if (data.status === "REJECTED") {
                    setApprovalStatus("REJECTED")
                    clearInterval(interval)
                    setError("Login request was denied by the account owner.")
                    setPendingRequestId(null)
                    setLoading(false)
                }
            } catch (err) {
                console.error("Polling error:", err)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [pendingRequestId, approvalStatus, email, password])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            } as const
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 } as const
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-indigo-100 selection:text-indigo-900 font-sans">
            {/* Left: Login Form */}
            <div className="flex flex-col p-8 sm:p-12 lg:p-20 relative overflow-hidden bg-white">
                {/* Logo Header */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="mb-16 flex items-center gap-3 group cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="w-11 h-11 bg-indigo-600 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                         <img src="/logo.png" alt="QICMART Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight italic uppercase text-zinc-900">
                        Qic<span className="text-indigo-600">Mart</span>
                    </span>
                </motion.div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        <header className="space-y-3">
                            <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight text-zinc-900">
                                Welcome back!
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-zinc-500 font-medium text-base">
                                Enter your email & password to continue.
                            </motion.p>
                        </header>

                        {error && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants} className="space-y-4">
                                <div className="group space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 group-focus-within:text-indigo-600 transition-colors pl-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-zinc-900 font-medium text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-300"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-sm font-semibold text-zinc-700 group-focus-within:text-indigo-600 transition-colors pl-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-zinc-900 font-medium text-sm focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-zinc-300"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-indigo-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <AnimatePresence>
                            {pendingRequestId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/80 backdrop-blur-md"
                                >
                                    <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl border border-zinc-100 space-y-8 text-center">
                                        <div className="relative mx-auto w-20 h-20">
                                            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-40" />
                                            <div className="relative flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full border-2 border-indigo-100">
                                                <ShieldCheck className="w-10 h-10 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-bold text-zinc-900">Waiting for Approval</h3>
                                            <p className="text-zinc-500 font-medium leading-relaxed">
                                                Someone is currently using this account. We've sent them a request to allow your login.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-indigo-600"
                                                    animate={{ width: ["0%", "100%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => { setPendingRequestId(null); setLoading(false); }}
                                                className="text-sm font-bold text-zinc-400 hover:text-red-500 transition-colors pt-2"
                                            >
                                                Cancel Request
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <footer className="mt-12">
                    <div className="flex items-center gap-3 mb-6 opacity-30">
                        <div className="h-px flex-1 bg-zinc-200" />
                        <ShieldCheck className="w-4 h-4 text-zinc-400" />
                        <div className="h-px flex-1 bg-zinc-200" />
                    </div>
                    <p className="text-xs font-bold text-zinc-500 text-center">
                        © {new Date().getFullYear()} Qicmart Global • All Rights Reserved.
                    </p>
                </footer>
            </div>

            {/* Right: Video Background Section */}
            <div className="hidden lg:flex flex-col bg-zinc-950 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-90"
                    >
                        <source src="/login-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03060b] via-[#03060b]/30 to-transparent" />
                    
                    {/* Grain Layer over video */}
                    <div 
                        className="absolute inset-0 opacity-10 mix-blend-soft-light pointer-events-none" 
                        style={{ backgroundImage: `url(${GRAIN_URL})`, backgroundRepeat: 'repeat', backgroundSize: '128px' }}
                    />
                </div>

                <div className="relative z-10 flex flex-col h-full items-center justify-center p-12 lg:p-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="space-y-10"
                    >
                        <motion.div 
                             className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden"
                             whileHover={{ scale: 1.05 }}
                        >
                             <img src="/logo.png" alt="Qicmart" className="w-14 h-14 relative z-10" />
                        </motion.div>
                        
                        <div className="space-y-6">
                            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white leading-tight uppercase">
                                Optimize Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Success</span>
                            </h2>
                            <p className="text-zinc-500 text-lg max-w-md mx-auto font-medium leading-relaxed tracking-tight">
                                Empowering retail giants with the next generation of intuitive sales technology.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-10 pt-10 border-t border-white/[0.05]">
                             <div className="flex flex-col items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Systems Operational</span>
                             </div>
                             <div className="flex flex-col items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Enterprise Ready</span>
                             </div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-difference bg-black" />
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Initializing...</div>}>
            <LoginForm />
        </Suspense>
    )
}
