"use client"

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
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone. Do you want to continue?",
    loading = false,
    confirmText = "Yes, delete it!",
    cancelText = "No, cancel!"
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    {/* Warning Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full border-4 border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500 animate-bounce-subtle">
                            <span className="text-5xl font-light">!</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                        {title}
                    </h3>
                    
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Deleting..." : confirmText}
                        </button>
                    </div>
                </div>

                {/* Close corner button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <style jsx>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
