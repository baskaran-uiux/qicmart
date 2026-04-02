"use client"

import { useState, useEffect } from "react"
import { Star, Plus, Trash2, ArrowLeft, Save, Search, User, ShieldCheck, Loader2, Check, Edit2, X, Image as ImageIcon, Upload, Copy } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import MediaPicker from "@/components/dashboard/MediaPicker"

interface Review {
    id: number
    author: string
    avatar?: string
    text: string
    rating: number
    date: string
}

export default function ManualReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [search, setSearch] = useState("")
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
    const [editingReview, setEditingReview] = useState<Review | null>(null)

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const url = new URL("/api/dashboard/settings", window.location.origin)
            const ownerId = params.get("ownerId")
            if (ownerId) url.searchParams.set("ownerId", ownerId)
            
            const res = await fetch(url.toString())
            const data = await res.json()
            if (data.manualReviews) {
                setReviews(data.manualReviews)
            }
        } catch (e) {
            console.error("Failed to fetch reviews", e)
        }
        setLoading(false)
    }

    useEffect(() => { fetchSettings() }, [])

    const handleSave = async (updatedReviews?: Review[]) => {
        setSaving(true)
        setSuccess(false)
        const reviewsToSave = updatedReviews || reviews
        try {
            const params = new URLSearchParams(window.location.search)
            const url = new URL("/api/dashboard/settings", window.location.origin)
            const ownerId = params.get("ownerId")
            if (ownerId) url.searchParams.set("ownerId", ownerId)

            const res = await fetch(url.toString(), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ manualReviews: reviewsToSave })
            })
            
            if (res.ok) {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch (e) {
            console.error("Failed to save reviews", e)
        }
        setSaving(false)
    }

    const openAddModal = () => {
        setEditingReview({
            id: Date.now(),
            author: "",
            avatar: "",
            text: "",
            rating: 5,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        })
        setIsModalOpen(true)
    }

    const openEditModal = (review: Review) => {
        setEditingReview({ ...review })
        setIsModalOpen(true)
    }

    const saveFromModal = () => {
        if (!editingReview) return
        
        const exists = reviews.find(r => r.id === editingReview.id)
        let updated: Review[]
        
        if (exists) {
            updated = reviews.map(r => r.id === editingReview.id ? editingReview : r)
        } else {
            updated = [editingReview, ...reviews]
        }
        
        setReviews(updated)
        setIsModalOpen(false)
        setEditingReview(null)
        handleSave(updated)
    }

    const deleteReview = (id: number) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return
        const updated = reviews.filter(r => r.id !== id)
        setReviews(updated)
        handleSave(updated)
    }

    const duplicateReview = (review: Review) => {
        const newReview = {
            ...review,
            id: Date.now(),
            author: `${review.author} (Copy)`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
        const updated = [newReview, ...reviews]
        setReviews(updated)
        handleSave(updated)
    }

    const filtered = reviews.filter(r => 
        r.author.toLowerCase().includes(search.toLowerCase()) || 
        r.text.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/dashboard/plugins/installed"
                        className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                    >
                        <ArrowLeft size={20} className="text-zinc-500" />
                    </Link>
                    <div>
                        <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Customer Testimonials</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[12px] sm:text-[14px] font-medium tracking-normal text-nowrap">Manage hand-picked guest reviews for your storefront.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl mr-2">
                        {saving ? (
                            <>
                                <Loader2 size={14} className="animate-spin text-indigo-500" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Auto-saving...</span>
                            </>
                        ) : success ? (
                            <>
                                <Check size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Changes Saved</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={14} className="text-zinc-300" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Auto-save Enabled</span>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Review
                    </button>
                </div>
            </div>

            {/* toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative group w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search testimonials..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white transition-all shadow-sm"
                    />
                </div>
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Total: {reviews.length} Testimonials
                </div>
            </div>

            {/* Compact List View */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">Customer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">Rating</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">Feedback</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            <AnimatePresence mode="popLayout">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <Star size={40} className="mx-auto text-zinc-100 dark:text-zinc-800 mb-3" />
                                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">No testimonials found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((review, idx) => (
                                        <motion.tr 
                                            key={review.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner">
                                                        {review.avatar ? (
                                                            <img src={review.avatar} className="w-full h-full object-cover" />
                                                        ) : <User size={16} className="text-zinc-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">{review.author || "Anonymous"}</p>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{review.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star 
                                                            key={s} 
                                                            size={12} 
                                                            fill={s <= review.rating ? "currentColor" : "none"} 
                                                            className={s <= review.rating ? "text-amber-400" : "text-zinc-200 dark:text-zinc-800"} 
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-[300px]">
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1 italic italic">"{review.text}"</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => duplicateReview(review)}
                                                        title="Duplicate"
                                                        className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openEditModal(review)}
                                                        title="Edit"
                                                        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteReview(review.id)}
                                                        title="Delete"
                                                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && editingReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] w-full max-w-xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                                            <Star size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                                {reviews.find(r => r.id === editingReview.id) ? "Edit Testimonial" : "New Testimonial"}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Fill in the customer details below</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                        <X size={20} className="text-zinc-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Avatar Selection */}
                                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                        <div 
                                            onClick={() => setIsMediaPickerOpen(true)}
                                            className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group overflow-hidden relative"
                                        >
                                            {editingReview.avatar ? (
                                                <>
                                                    <img src={editingReview.avatar} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black uppercase tracking-widest bg-black/40">
                                                        Change
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 text-zinc-300 group-hover:text-amber-500">
                                                    <Upload size={20} />
                                                    <span className="text-[9px] font-black uppercase tracking-tight">Upload</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer Avatar</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reviewer Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                                <input 
                                                    value={editingReview.author}
                                                    onChange={e => setEditingReview({ ...editingReview, author: e.target.value })}
                                                    placeholder="e.g. Arun Kumar"
                                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:border-amber-500 outline-none text-zinc-900 dark:text-white transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Star Rating</label>
                                            <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-inner h-[46px]">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => setEditingReview({ ...editingReview, rating: s })}
                                                        className="hover:scale-110 transition-transform"
                                                    >
                                                        <Star size={20} fill={s <= editingReview.rating ? "#fbbf24" : "none"} className={s <= editingReview.rating ? "text-amber-400" : "text-zinc-200 dark:text-zinc-800"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Testimonial Content</label>
                                        <textarea 
                                            value={editingReview.text}
                                            onChange={e => setEditingReview({ ...editingReview, text: e.target.value })}
                                            placeholder="Share the customer's shopping experience..."
                                            rows={4}
                                            className="w-full p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] text-sm font-medium leading-relaxed focus:border-amber-500 outline-none text-zinc-900 dark:text-white transition-all shadow-inner resize-none italic"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-zinc-50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 shrink-0">
                                <button 
                                    onClick={() => handleSave()}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Save Testimonials
                                </button>
                                <button 
                                    onClick={saveFromModal}
                                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Add Testimonial
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Media Picker */}
            <MediaPicker 
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(url) => {
                    if (editingReview) {
                        setEditingReview({ ...editingReview, avatar: url })
                    }
                    setIsMediaPickerOpen(false)
                }}
                title="Select Profile Avatar"
            />

        </div>
    )
}
