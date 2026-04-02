"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Mail, Phone, Loader2, PlusCircle, CheckCircle2 } from "lucide-react"

interface AddCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    ownerId: string | null
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess, ownerId }: AddCustomerModalProps) {
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = ownerId ? `/api/dashboard/customers?ownerId=${ownerId}` : "/api/dashboard/customers"
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setDone(true)
                setTimeout(() => {
                    onSuccess()
                    onClose()
                    setDone(false)
                    setFormData({ firstName: "", lastName: "", email: "", phone: "" })
                }, 1500)
            } else {
                const err = await res.json()
                alert(err.error || "Failed to add customer")
            }
        } catch (error) {
            console.error("Error adding customer:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                    >
                        {/* Status Overlay */}
                        <AnimatePresence>
                            {done && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                                >
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                        <CheckCircle2 size={80} className="text-emerald-500" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Customer Added!</h3>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="px-8 py-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-600/10">
                                            <PlusCircle size={24} />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">New Customer</h2>
                                    </div>
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 opacity-80">Add a shopper to your database manually.</p>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-2xl transition-all active:scale-90"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">First Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                            <input 
                                                required
                                                type="text"
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                placeholder="John"
                                                className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-600/30 rounded-2xl text-sm font-semibold outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Last Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                            <input 
                                                required
                                                type="text"
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                placeholder="Doe"
                                                className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-600/30 rounded-2xl text-sm font-semibold outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                        <input 
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john.doe@example.com"
                                            className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-600/30 rounded-2xl text-sm font-semibold outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                        <input 
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-indigo-600/30 rounded-2xl text-sm font-semibold outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                                    {loading ? "Adding Customer..." : "Add Customer"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
