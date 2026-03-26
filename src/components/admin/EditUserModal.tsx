"use client"

import { useState } from "react"
import { X, Loader2, Save, Store, Mail, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function EditUserModal({ user, isOpen, onClose }: { user: any, isOpen: boolean, onClose: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    if (!isOpen) return null

    const primaryStore = user.ownedStores?.[0]

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            storeName: formData.get("storeName"),
        }

        try {
            const res = await fetch("/api/admin/users/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, action: "UPDATE", payload }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || "Failed to update user")
            }

            onClose()
            router.refresh()
            alert("Updated successfully!")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Modify Profile</h3>
                        <p className="text-xs text-zinc-500 font-bold mt-1">Update owner and business identity.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                            <X size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4 mb-1 block">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    name="name"
                                    type="text"
                                    defaultValue={user.name || ""}
                                    placeholder="Full Name"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4 mb-1 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input 
                                    name="email"
                                    type="email"
                                    defaultValue={user.email || ""}
                                    placeholder="Email Address"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4 mb-1 block">Business Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Store size={18} />
                                    </div>
                                    <input 
                                        name="storeName"
                                        type="text"
                                        defaultValue={primaryStore?.name || ""}
                                        placeholder="Business Name"
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <><Save size={16} /> Save Changes</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
