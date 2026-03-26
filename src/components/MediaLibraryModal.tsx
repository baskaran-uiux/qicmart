"use client"

import { useState, useEffect } from "react"
import { X, Upload, Search, Image as ImageIcon, Check, Loader2, Plus, Copy } from "lucide-react"

interface MediaItem {
    id: string
    url: string
    name: string
    type: string
}

interface MediaLibraryModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
    title?: string
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, title = "Select Media" }: MediaLibraryModalProps) {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const fetchMedia = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

        setLoading(true)
        try {
            const res = await fetch(url)
            const data = await res.json()
            setMedia(data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (isOpen) {
            fetchMedia()
            setSelectedUrl(null)
        }
    }, [isOpen])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

        setUploading(true)
        setUploadError(null)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch(url, {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (res.ok) {
                setMedia(prev => [data, ...prev])
                setSelectedUrl(data.url)
            } else {
                setUploadError(data.error || data.details || "Upload failed")
            }
        } catch (e: any) {
            setUploadError("Network error. Check your connection.")
        }
        setUploading(false)
    }

    const filteredMedia = media.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden scale-in-center">
                {/* Header */}
                <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 dark:bg-purple-500/10 rounded-2xl">
                            <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 text-zinc-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-5">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search your library..."
                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl text-sm font-black cursor-pointer transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {uploading ? "Uploading..." : "Upload Assets"}
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                        </label>
                        {uploadError && (
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-shake">{uploadError}</p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 min-h-[350px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
                            <Loader2 size={40} className="animate-spin text-indigo-500" />
                            <p className="font-bold">Fetching your library...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mb-8 border border-zinc-100 dark:border-zinc-700 shadow-xl">
                                <ImageIcon size={40} className="text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-slate-900 dark:text-zinc-400 font-black text-xl">{search ? "No matching files" : "Your library is empty"}</p>
                            <p className="text-zinc-500 text-sm mt-3">Upload files from your device to populate this view.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                            {filteredMedia.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setSelectedUrl(item.url)}
                                    className={`group relative aspect-square rounded-3xl overflow-hidden cursor-pointer transition-all border-4 ${
                                        selectedUrl === item.url ? "border-indigo-600 dark:border-purple-500 ring-4 ring-indigo-500/20" : "border-transparent bg-zinc-100 dark:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                                    }`}
                                >
                                    <img 
                                        src={item.url} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                        selectedUrl === item.url ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            selectedUrl === item.url ? "bg-indigo-600 dark:bg-purple-500 text-white shadow-xl" : "bg-white/20 backdrop-blur-md text-white"
                                        }`}>
                                            <Check size={24} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-5 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-black transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={!selectedUrl}
                        onClick={() => selectedUrl && onSelect(selectedUrl)}
                        className="px-8 py-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-sm"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    )
}
