"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, Loader2 } from "lucide-react"

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
    loading?: boolean
    confirmText?: string
    cancelText?: string
    confirmationValue?: string // The value the user must type to confirm
    dangerText?: string // Text for the danger alert
    actionType?: "delete" | "reset" | "custom"
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone. Do you want to continue?",
    loading = false,
    confirmText = "Yes, delete it!",
    cancelText = "No, cancel!",
    confirmationValue,
    dangerText = "This action cannot be undone.",
    actionType = "delete"
}: DeleteConfirmationModalProps) {
    const [inputValue, setInputValue] = useState("")

    // Reset input when modal opens/closes
    useEffect(() => {
        if (isOpen) setInputValue("")
    }, [isOpen])

    if (!isOpen) return null

    const isConfirmDisabled = confirmationValue ? (inputValue !== confirmationValue || loading) : loading

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/50">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Warning Alert */}
                    <div className="flex items-center gap-4 p-4 mb-6 bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl">
                        <div className="p-2 bg-orange-500 text-white rounded-lg">
                            <AlertCircle size={18} />
                        </div>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-400">
                            {dangerText}
                        </p>
                    </div>

                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-8">
                        {description}
                    </p>

                    {confirmationValue && (
                        <div className="space-y-3 mb-8">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                                Type <span className="text-zinc-900 dark:text-white lowercase">{confirmationValue}</span> to confirm.
                            </label>
                            <input
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type the project name in here"
                                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={onConfirm}
                            disabled={isConfirmDisabled}
                            className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl ${
                                isConfirmDisabled 
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none" 
                                : actionType === 'delete' 
                                  ? "bg-rose-900 dark:bg-rose-900/80 text-white border border-rose-800/50 dark:border-rose-700/50 hover:bg-rose-950 dark:hover:bg-rose-800 shadow-rose-900/20"
                                  : "bg-amber-600 dark:bg-amber-600/80 text-white border border-amber-500/50 dark:border-amber-500 hover:bg-amber-700 shadow-amber-600/20"
                            }`}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                            {loading ? (actionType === 'delete' ? "Deleting..." : "Resetting...") : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
