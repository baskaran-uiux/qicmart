"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Upload, Search, X, Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MediaItem {
    id: string
    url: string
    name: string
    type: string
    size: number
    createdAt: string
}

interface MediaPickerProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
    onSelectMultiple?: (urls: string[]) => void
    allowMultiple?: boolean
    title?: string
}

export default function MediaPicker({ 
    isOpen, 
    onClose, 
    onSelect, 
    onSelectMultiple, 
    allowMultiple = false,
    title = "Select Media"
}: MediaPickerProps) {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<string[]>([])
    const [tab, setTab] = useState<"library" | "upload">("library")
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    const fetchMedia = async () => {
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

            setLoading(true)
            const res = await fetch(url)
            const data = await res.json()
            setMedia(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch media", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchMedia()
            setSelected([])
            setTab("library")
            setSearch("")
        }
    }, [isOpen])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return
        
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

        setUploading(true)
        try {
            const uploadedUrls: string[] = []
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append("file", file)
                const res = await fetch(url, {
                    method: "POST",
                    body: formData,
                })
                if (res.ok) {
                    const data = await res.json()
                    uploadedUrls.push(data.url)
                }
            }
            
            // Auto select first uploaded if single, or all if multiple
            if (uploadedUrls.length > 0) {
                if (!allowMultiple) {
                    onSelect(uploadedUrls[0])
                    onClose()
                } else {
                    onSelectMultiple?.(uploadedUrls)
                    onClose()
                }
            }
            fetchMedia()
            setTab("library")
        } catch (error: any) {
            console.error("Upload error:", error)
        }
        setUploading(false)
    }

    const toggleSelect = (url: string) => {
        if (!allowMultiple) {
            onSelect(url)
            onClose()
            return
        }

        setSelected(prev => 
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        )
    }

    const handleConfirmSelection = () => {
        if (allowMultiple && onSelectMultiple) {
            onSelectMultiple(selected)
        }
        onClose()
    }

    const filtered = (Array.isArray(media) ? media : []).filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedMedia = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    if (!isOpen) return null

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">{title}</h3>
                            <p className="text-[11px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">Select assets for your product</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                            <X size={24} className="text-zinc-400" />
                        </button>
                    </div>

                    {/* Tabs & Search */}
                    <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="flex p-1 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 w-full sm:w-fit">
                            <button 
                                onClick={() => setTab("library")}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === "library" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-800"}`}
                            >
                                Media Library
                            </button>
                            <button 
                                onClick={() => setTab("upload")}
                                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === "upload" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:text-zinc-800"}`}
                            >
                                Upload New
                            </button>
                        </div>
                        
                        {tab === "library" && (
                            <div className="relative group flex-1 w-full sm:w-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                    placeholder="Search your library..." 
                                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[12px] font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all" 
                                />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar min-h-[400px]">
                        {tab === "library" ? (
                            loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest italic">Indexing your library...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-8 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] text-zinc-300">
                                        <ImageIcon size={48} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-black dark:text-white uppercase tracking-tight">No assets found</p>
                                        <p className="text-[11px] text-zinc-400 font-bold mt-1 max-w-[200px]">Try a different search or upload a new file.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {paginatedMedia.map(item => (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleSelect(item.url)}
                                            className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer border-2 transition-all ${selected.includes(item.url) ? "border-indigo-600 shadow-xl scale-[0.98]" : "border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-600"}`}
                                        >
                                            <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className={`absolute inset-0 bg-indigo-600/10 transition-opacity ${selected.includes(item.url) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                                            
                                            {selected.includes(item.url) && (
                                                <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-200">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                            
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] text-white font-black uppercase tracking-widest truncate">{item.name}</p>
                                                <p className="text-[8px] text-white/70 font-bold">{formatSize(item.size)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center">
                                <label className="w-full max-w-md aspect-video border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/20 hover:border-indigo-500/50 transition-all group group-hover:scale-[1.01]">
                                    {uploading ? (
                                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    ) : (
                                        <div className="p-8 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-300 group-hover:scale-110 transition-transform">
                                            <Upload size={48} />
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-lg font-black text-black dark:text-white uppercase tracking-tight">{uploading ? "Uploading..." : "Drop files to upload"}</p>
                                        <p className="text-xs text-zinc-400 mt-2 font-bold px-8">Select files from your computer to add to the library.</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/30 dark:bg-zinc-950/20">
                        {tab === "library" ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-[10px] font-black text-zinc-400 mx-2 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                
                                {allowMultiple && (
                                    <div className="flex items-center gap-6">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selected.length} items selected</p>
                                        <button 
                                            onClick={handleConfirmSelection}
                                            disabled={selected.length === 0}
                                            className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                        >
                                            Confirm Selection
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full flex justify-end">
                                <button onClick={() => setTab("library")} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Back to library</button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
