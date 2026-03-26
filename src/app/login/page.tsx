"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const auto = searchParams.get("auto")
        if (auto === "google") {
            signIn("google", { callbackUrl: searchParams.get("callbackUrl") || "/" })
        }

        const testEmail = searchParams.get("test-email")
        if (testEmail) {
            signIn("credentials", { 
                email: testEmail, 
                otp: "dummy", 
                callbackUrl: searchParams.get("callbackUrl") || "/" 
            })
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        setLoading(false)

        if (res?.error) {
            setError("Invalid email or password")
        } else {
            // Fetch the session to determine role and redirect appropriately
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
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
            <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                        Platform Login
                    </h1>
                    <p className="text-zinc-400 mt-2">Sign in to your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-500"
                            placeholder="admin@platform.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl text-center text-sm text-zinc-500 border border-zinc-700/50">
                    <p className="font-semibold text-zinc-400 mb-2">Demo Accounts</p>
                    <p>Super Admin: <span className="text-purple-400">admin@platform.com</span></p>
                    <p>Store Owner: <span className="text-emerald-400">owner@store.com</span></p>
                    <p className="mt-1 text-zinc-600">Password: <span className="text-zinc-500">password123</span></p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading auth...</div>}>
            <LoginForm />
        </Suspense>
    )
}
