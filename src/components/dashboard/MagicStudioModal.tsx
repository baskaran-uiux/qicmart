"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Image as ImageIcon, Check, Loader2, Wand2, RefreshCw, Layers, Zap } from "lucide-react"
import { toast } from "sonner"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface MagicStudioModalProps {
    isOpen: boolean
    onClose: () => void
    initialImage?: string
    onSave: (processedImageUrl: string) => void
}

const PRO_THEMES = [
    { id: "luxury", name: "Luxury Studio", icon: "💎", description: "Marble, gold accents, soft lighting" },
    { id: "nature", name: "Natural Soft", icon: "🌿", description: "Sunlight, wood, garden bokeh" },
    { id: "urban", name: "Urban Minimal", icon: "🏙️", description: "Concrete, neon, modern vibe" },
    { id: "pop", name: "Pop Art", icon: "🎨", description: "Vibrant colors, high contrast" }
]

export default function MagicStudioModal({ isOpen, onClose, initialImage, onSave }: MagicStudioModalProps) {
    const { id: storeId, t, updateCredits } = useDashboardStore()
    const [step, setStep] = useState<"upload" | "processing" | "result">("upload")
    const [originalImage, setOriginalImage] = useState<string | null>(initialImage || null)
    const [selectedTheme, setSelectedTheme] = useState(PRO_THEMES[0])
    const [resultUrl, setResultUrl] = useState<string | null>(null)
    const [analysis, setAnalysis] = useState<any>(null)

    // Sync image when modal opens
    useEffect(() => {
        if (isOpen && initialImage) {
            setOriginalImage(initialImage)
            setStep("upload")
            setResultUrl(null)
        }
    }, [isOpen, initialImage])

    const generateMagic = async () => {
        if (!originalImage) return
        setStep("processing")

        try {
            const res = await fetch("/api/ai/studio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image: originalImage, 
                    storeId,
                    theme: selectedTheme.name 
                })
            })

            const data = await res.json()
            if (data.success) {
                setResultUrl(data.resultUrl)
                setAnalysis(data.analysis)
                if (data.creditsRemaining !== undefined) {
                    updateCredits(data.creditsRemaining)
                }
                setStep("result")
                toast.success("AI Studio Magic Complete!")
            } else {
                throw new Error(data.error || "Generation failed")
            }
        } catch (error: any) {
            console.error("Magic Studio Error:", error)
            toast.error(error.message || "Failed to generate mockup")
            setStep("upload")
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-[48px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-3xl shadow-xl shadow-indigo-600/20">
                                <Zap size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-semibold text-black dark:text-white tracking-tight flex items-center gap-3">
                                    {t("aiStudio")} Pro
                                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[11px] font-medium border border-indigo-500/20">Generative AI</span>
                                </h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">High-quality professional mockups</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-[24px] transition-all"><X size={28} /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-10 sm:p-14 no-scrollbar">
                        {step === "upload" && (
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-center">
                                <div className="space-y-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-6 bg-indigo-500/10 rounded-[56px] blur-3xl opacity-0 group-hover:opacity-100 transition-all"></div>
                                        <div className="relative aspect-video rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 shadow-inner">
                                            {originalImage ? (
                                                <img src={originalImage} className="w-full h-full object-contain p-8" />
                                            ) : (
                                                <ImageIcon size={64} className="text-zinc-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-3xl font-black text-black dark:text-white tracking-tight">Generate Professional Mockup</h4>
                                        <p className="text-base text-zinc-500 font-semibold leading-relaxed">Our AI will automatically remove the background and generate a realistic, high-end lifestyle scene around your product. One click, 10 credits.</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h5 className="text-[12px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            <Layers size={16} /> Choose Style Theme
                                        </h5>
                                        <div className="grid grid-cols-1 gap-4">
                                            {PRO_THEMES.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setSelectedTheme(theme)}
                                                    className={`group flex items-center gap-5 p-5 rounded-[28px] border-2 transition-all text-left ${selectedTheme.id === theme.id ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/5" : "border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800"}`}
                                                >
                                                    <span className="text-3xl">{theme.icon}</span>
                                                    <div>
                                                        <p className={`text-[13px] font-black uppercase tracking-tight ${selectedTheme.id === theme.id ? "text-indigo-600" : "text-black dark:text-white"}`}>{theme.name}</p>
                                                        <p className="text-[11px] font-bold text-zinc-400">{theme.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={generateMagic}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-base font-semibold shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Wand2 size={20} />
                                        Launch AI Wizard
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === "processing" && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-16">
                                <div className="relative">
                                    <div className="w-32 h-32 border-8 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles size={48} className="text-indigo-600 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-2xl font-semibold text-black dark:text-white tracking-tight animate-pulse">Generating your studio mockup...</h4>
                                    <div className="flex items-center gap-2.5 justify-center px-5 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                                        <Loader2 size={16} className="animate-spin text-zinc-500" />
                                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400 font-medium">Applying AI generative scene</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === "result" && (
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    <div className="relative aspect-square rounded-[48px] overflow-hidden bg-zinc-900 shadow-2xl border-4 border-white dark:border-zinc-800">
                                        <img src={resultUrl!} className="w-full h-full object-cover" />
                                        <div className="absolute top-6 left-6 px-4 py-2.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/20 text-white flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                            <span className="text-[13px] font-medium">Studio image ready</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep("upload")} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-[13px] font-semibold hover:bg-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2">
                                            <RefreshCw size={16} /> Try Different Style
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {analysis && (
                                        <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                                            <div>
                                                <h5 className="text-[12px] font-bold text-indigo-600 tracking-wide mb-1">AI Insight</h5>
                                                <p className="text-xl font-semibold text-black dark:text-white tracking-tight">{analysis.productName}</p>
                                            </div>
                                            <div className="pt-4 border-t border-indigo-100 dark:border-indigo-500/10">
                                                <p className="text-[13px] font-medium text-zinc-500 italic leading-relaxed">"{analysis.bgPrompt}"</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 space-y-4">
                                        <button 
                                            onClick={() => resultUrl && onSave(resultUrl)}
                                            className="w-full py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-2xl text-base font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Check size={20} />
                                            Update Cover Image
                                        </button>
                                        <p className="text-center text-[12px] text-zinc-500 font-medium px-4">This will replace your current product imagery with the professional AI result.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
