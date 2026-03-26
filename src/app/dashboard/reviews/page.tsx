"use client"

import { useState, useEffect } from "react"
import { Star, Check, X, Trash2, MessageSquare, Package, User, Search, AlertCircle } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface Review {
    id: string
    rating: number
    comment: string | null
    isApproved: boolean
    createdAt: string
    product: { name: string; slug: string }
    user: { name: string | null; email: string; image: string | null } | null
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const filtered = (Array.isArray(reviews) ? reviews : []).filter(r => 
        (r.product.name.toLowerCase().includes(search.toLowerCase())) ||
        (r.comment?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (r.user?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (r.user?.email.toLowerCase().includes(search.toLowerCase()))
    )

    const fetchReviews = async () => {
        setLoading(true)
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/reviews?ownerId=${ownerId}` : "/api/dashboard/reviews"
        
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            
            const data = await res.json()
            setReviews(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Failed to fetch reviews:", err)
        }
        setLoading(false)
    }

    useEffect(() => { fetchReviews() }, [])

    const toggleApproval = async (id: string, current: boolean) => {
        setActionId(id)
        try {
            const res = await fetch("/api/dashboard/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isApproved: !current })
            })
            if (res.ok) fetchReviews()
        } catch (err) {
            console.error(err)
        }
        setActionId(null)
    }

    const confirmDelete = async () => {
        if (!reviewToDelete) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/dashboard/reviews?id=${reviewToDelete}`, { method: "DELETE" })
            if (res.ok) {
                fetchReviews()
                setShowDeleteModal(false)
                setReviewToDelete(null)
            }
        } catch (err) {
            console.error(err)
        }
        setDeleting(false)
    }

    const deleteReview = (id: string) => {
        setReviewToDelete(id)
        setShowDeleteModal(true)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Product Reviews</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Manage customer feedback and ratings.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search reviews..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[11px] font-semibold capitalize focus:ring-2 focus:ring-indigo-500/20 outline-none text-black dark:text-white shadow-sm" 
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-24 text-center text-zinc-400 font-medium">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-100 dark:border-zinc-700 shadow-xl">
                            <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-slate-900 dark:text-zinc-400 font-semibold text-xl">No reviews yet</p>
                        <p className="text-zinc-500 text-sm mt-2">When customers leave reviews, they will appear here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-[12px] sm:text-[14px] text-left">
                            <thead className="bg-[#F8FAFC] dark:bg-zinc-950 text-[#334155] dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-5 text-left font-semibold">Customer</th>
                                    <th className="px-6 py-5 text-left font-semibold">Product</th>
                                    <th className="px-6 py-5 text-left font-semibold">Rating</th>
                                    <th className="px-6 py-5 text-left font-semibold">Review</th>
                                    <th className="px-6 py-5 text-left font-semibold">Status</th>
                                    <th className="px-6 py-5 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                    {r.user?.image ? (
                                                        <img src={r.user.image} alt="" className="w-full h-full object-cover" />
                                                    ) : <User size={16} className="text-zinc-400" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-zinc-900 dark:text-white truncate">{r.user?.name || "Anonymous"}</p>
                                                    <p className="text-[10px] text-zinc-500 truncate">{r.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-zinc-400 shrink-0" />
                                                <p className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">{r.product.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-indigo-500 text-indigo-500" : "text-zinc-200 dark:text-zinc-700"}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-[250px] font-medium italic">"{r.comment || "No comment"}"</p>
                                            <p className="text-[9px] text-zinc-400 mt-1 capitalize font-semibold tracking-wide">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            {r.isApproved ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">Approved</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    disabled={actionId === r.id}
                                                    onClick={() => toggleApproval(r.id, r.isApproved)}
                                                    className={`p-2 rounded-xl transition-all ${r.isApproved ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400"}`}
                                                    title={r.isApproved ? "Unapprove Review" : "Approve Review"}
                                                >
                                                    {r.isApproved ? <X size={16} /> : <Check size={16} />}
                                                </button>
                                                <button
                                                    disabled={actionId === r.id}
                                                    onClick={() => deleteReview(r.id)}
                                                    className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl transition-all"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setReviewToDelete(null)
                    }
                }}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Review?"
                description="This review will be permanently removed. This action cannot be undone."
            />
        </div>
    )
}
