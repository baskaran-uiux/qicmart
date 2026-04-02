"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Mail, Shield, Calendar, Store, ExternalLink, ShieldOff, Key, Trash2, Edit2, Loader2, Globe, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

import { EditUserModal } from "@/components/admin/EditUserModal"
import { ResetPasswordModal } from "@/components/admin/ResetPasswordModal"

export function UserCard({ user }: { user: any }) {
    const [showMenu, setShowMenu] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleAction = async (action: string) => {
        if (action === "DELETE" && !confirm("Are you sure? This will delete the user and all their stores.")) return

        setShowMenu(false)
        setLoading(true)
        try {
            const res = await fetch("/api/admin/users/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, action })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)

            alert(result.message)
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getBaseDomain = () => {
        if (typeof window === "undefined") return "localhost:3000"
        const h = window.location.host, hn = h.split(':')[0], p = h.includes(':') ? ':' + h.split(':')[1] : '';
        if (hn.endsWith('.localhost') || hn === 'localhost') return 'localhost' + p;
        const parts = hn.split('.');
        return (parts.length > 2 ? parts.slice(-2).join('.') : hn) + p;
    }

    const store1 = user.ownedStores?.[0]

    const store1Url = store1 ? `/s/${store1.slug}` : null

    const dashboard1Url = `/dashboard?ownerId=${user.id}`

    return (
        <>
            <div className="group relative bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 p-8 hover:border-indigo-500/30 transition-all shadow-sm hover:shadow-2xl flex flex-col h-full overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Header Actions */}
                <div className="absolute top-6 right-6" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-3 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all active:scale-95"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                            <div className="space-y-1">
                                {store1 && (
                                    <>
                                        <a
                                            href={store1Url || "#"}
                                            target="_blank"
                                            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-2xl transition-colors"
                                        >
                                            <Globe size={14} /> View Store
                                        </a>
                                        <button
                                            onClick={() => window.open(dashboard1Url, "_blank")}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-600 rounded-2xl transition-colors"
                                        >
                                            <LayoutDashboard size={14} /> Dashboard
                                        </button>
                                    </>
                                )}
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-4"></div>
                                <button
                                    onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                                >
                                    <Edit2 size={14} /> Edit Details
                                </button>
                                <button
                                    onClick={() => { setShowResetModal(true); setShowMenu(false); }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-amber-500/10 hover:text-amber-600 rounded-2xl transition-colors"
                                >
                                    <Key size={14} /> Reset Password
                                </button>
                                <button
                                    onClick={() => handleAction("TOGGLE_STATUS")}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-colors ${user.isPlatformDisabled ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-rose-600 hover:bg-rose-500/10'}`}
                                >
                                    <ShieldOff size={14} /> {user.isPlatformDisabled ? 'Enable Login' : 'Disable Login'}
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-4"></div>
                                <button
                                    onClick={() => handleAction("DELETE")}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all"
                                >
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-[32px] bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white border-2 border-white dark:border-zinc-900 shadow-xl shadow-indigo-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                            {user.image ? <img src={user.image} className="w-full h-full rounded-[32px] object-cover" /> : user.name?.charAt(0) || user.email.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-lg ${user.isPlatformDisabled ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                            <Shield className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {user.name || "Anonymous"}
                        </h3>
                        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${user.role === 'SUPER_ADMIN' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' :
                                user.role === 'STORE_OWNER' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                    'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                            }`}>
                            {user.role}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-5 flex-1">
                    <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <Mail size={16} />
                        </div>
                        <span className="text-xs font-bold truncate">{user.email}</span>
                    </div>

                    {store1 && (
                        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <Store size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stores</span>
                                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">
                                    {store1.name}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Member Since</span>
                            <span className="text-xs font-black text-zinc-900 dark:text-white italic tracking-tighter">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isPlatformDisabled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
                            {user.isPlatformDisabled ? 'Account Frozen' : 'Live Status'}
                        </span>
                    </div>
                    {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                </div>
            </div>
            <EditUserModal
                user={user}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
            />
            <ResetPasswordModal
                userId={user.id}
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
            />
        </>
    )
}
