"use client"

import { useState, useEffect } from "react"
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Search, X, Grid, List, Loader2, Link as LinkIcon, FileVideo, HardDrive, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"

interface MediaItem {
    id: string
    url: string
    name: string
    type: string
    size: number
    createdAt: string
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [search, setSearch] = useState("")
    const [view, setView] = useState<"grid" | "list">("grid")
    const [copied, setCopied] = useState<string | null>(null)
    const [preview, setPreview] = useState<MediaItem | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 50
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchMedia = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

        setLoading(true)
        const res = await fetch(url)
        const data = await res.json()
        setMedia(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => { fetchMedia() }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files?.length) return
        
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/media?ownerId=${ownerId}` : "/api/dashboard/media"

        setUploading(true)
        for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append("file", file)
            await fetch(url, {
                method: "POST",
                body: formData,
            })
        }
        fetchMedia()
        setUploading(false)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        setDeleting(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = `/api/dashboard/media?id=${itemToDelete}${ownerId ? `&ownerId=${ownerId}` : ""}`
            
            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                fetchMedia()
                setShowDeleteModal(false)
                setItemToDelete(null)
                if (preview?.id === itemToDelete) setPreview(null)
            }
        } catch (e) {
            console.error("Failed to delete media", e)
        }
        setDeleting(false)
    }

    const deleteMedia = (id: string) => {
        setItemToDelete(id)
        setShowDeleteModal(true)
    }

    const copyUrl = (url: string) => {
        const fullUrl = `${window.location.origin}${url}`
        navigator.clipboard.writeText(fullUrl)
        setCopied(url)
        setTimeout(() => setCopied(null), 2000)
    }

    const filtered = (Array.isArray(media) ? media : []).filter(m => m.name.toLowerCase().includes(search.toLowerCase()))

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedMedia = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Media Library</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Manage your store's visual assets and documents.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setView("grid")} 
                            className={`p-2.5 rounded-xl transition-all ${view === "grid" ? "bg-indigo-600 dark:bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-indigo-600"}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => setView("list")} 
                            className={`p-2.5 rounded-xl transition-all ${view === "list" ? "bg-indigo-600 dark:bg-zinc-800 text-white shadow-lg" : "text-zinc-400 hover:text-indigo-600"}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:opacity-90 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-2xl text-[10px] capitalize font-semibold tracking-wide cursor-pointer transition-all shadow-xl active:scale-95">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        {uploading ? "Uploading..." : "Add Media"}
                        <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>
            </div>

            {/* Library Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search media..." 
                        className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm" 
                    />
                </div>
                <div className="flex items-center gap-4 px-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-500 text-sm shadow-sm font-semibold">
                    <HardDrive size={16} className="text-indigo-500" />
                    <span>{media.length} Assets</span>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-slate-900 dark:text-white">{formatSize(media.reduce((acc, m) => acc + (m.size || 0), 0))}</span>
                </div>
            </div>

            {/* Media Content */}
            {loading ? (
                <div className="py-24 text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-zinc-500 font-semibold">Indexing your assets...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-32 bg-white dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px] text-center shadow-inner">
                    <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-zinc-100 dark:border-zinc-700 shadow-xl">
                        <ImageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-300">No assets found</h3>
                    <p className="text-zinc-500 mt-3 max-w-xs mx-auto text-sm">
                        {search ? `Searching for "${search}" yielded no results. Try a different term.` : "Your media library is pristine. Upload images or videos to populate it."}
                    </p>
                </div>
            ) : view === "grid" ? (
                <div className="space-y-8 pb-20">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {paginatedMedia.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[28px] overflow-hidden cursor-pointer hover:border-indigo-500/50 dark:hover:border-purple-500/50 transition-all shadow-sm hover:shadow-xl dark:hover:shadow-purple-500/5"
                            onClick={() => setPreview(item)}
                        >
                            <div className="aspect-square bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                {item.type === "VIDEO" ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className="absolute inset-0 bg-black/40 z-10" />
                                        <FileVideo className="w-12 h-12 text-white/50 z-20 animate-pulse" />
                                    </div>
                                ) : (
                                    <img 
                                        src={item.url} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        onError={(e) => { e.currentTarget.style.display = "none" }} 
                                    />
                                )}
                            </div>
                            
                            <div className="absolute inset-x-3 top-3 transition-all flex items-center justify-end gap-2 z-30">
                                <button onClick={e => { e.stopPropagation(); copyUrl(item.url) }} className="p-2.5 bg-white/90 dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-white rounded-xl backdrop-blur-md shadow-xl transition-all scale-90 group-hover:scale-100">
                                    {copied === item.url ? <Check size={16} /> : <LinkIcon size={16} />}
                                </button>
                                <button onClick={e => { e.stopPropagation(); deleteMedia(item.id) }} className="p-2.5 bg-rose-500/90 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md shadow-xl transition-all scale-90 group-hover:scale-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-300 truncate">{item.name}</p>
                                <p className="text-[12px] text-zinc-500 capitalize">{item.type.split('/')[1]}</p>
                                <p className="text-[12px] text-zinc-500">{formatSize(item.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] font-semibold capitalize tracking-wide text-zinc-400">
                            Showing <span className="font-bold text-indigo-600">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-indigo-600">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-bold text-indigo-600">{filtered.length}</span> assets
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50 active:scale-95"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div className="flex items-center gap-1.5 mx-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 || 
                                        pageNum === totalPages || 
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button 
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-semibold transition-all ${currentPage === pageNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500"}`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    }
                                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="text-zinc-400 font-bold px-1">...</span>
                                    }
                                    return null
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50 active:scale-95"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-xl">
                    <table className="w-full text-sm text-zinc-500">
                        <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-400 dark:text-zinc-500 text-[10px] capitalize font-bold tracking-wide border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-6 text-left">Internal Asset</th>
                                <th className="px-6 py-6 text-left">Format</th>
                                <th className="px-6 py-6 text-left">Storage</th>
                                <th className="px-6 py-6 text-left">Modified</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {paginatedMedia.map(item => (
                                <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shrink-0 shadow-sm">
                                            {item.type === "VIDEO" ? (
                                                <div className="w-full h-full flex items-center justify-center text-indigo-500"><FileVideo size={20} /></div>
                                            ) : (
                                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-purple-400 transition-colors truncate max-w-xs">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-5 shrink-0"><span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] capitalize font-semibold text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700">{item.type}</span></td>
                                    <td className="px-6 py-5 text-xs font-semibold text-slate-700 dark:text-zinc-400">{formatSize(item.size)}</td>
                                    <td className="px-6 py-5 text-xs text-zinc-400 font-semibold">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 transition-all">
                                            <button onClick={() => copyUrl(item.url)} className="p-2.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all" title="Copy URL">
                                                {copied === item.url ? <Check size={18} /> : <LinkIcon size={18} />}
                                            </button>
                                            <button onClick={() => deleteMedia(item.id)} className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls Table View */}
                    {totalPages > 1 && (
                        <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950/20">
                            <div className="text-[10px] font-semibold capitalize tracking-wide text-zinc-400">
                                Page <span className="text-indigo-600">{currentPage}</span> of <span className="text-indigo-600">{totalPages}</span> — {filtered.length} total
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {preview && (
                <div className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setPreview(null)}>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] overflow-hidden max-w-3xl w-full shadow-2xl scale-in-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-900 dark:text-white leading-none tracking-tighter">{preview.name}</h3>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3 font-semibold capitalize tracking-wide">{preview.type} • {formatSize(preview.size)} • {new Date(preview.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setPreview(null)} className="p-3 text-zinc-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"><X size={28} /></button>
                        </div>
                        <div className="p-10">
                            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-[32px] overflow-hidden flex items-center justify-center p-4 min-h-[350px] border border-zinc-100 dark:border-zinc-800 shadow-inner">
                                {preview.type === "VIDEO" ? (
                                    <video src={preview.url} controls className="max-h-[450px] w-full rounded-2xl" />
                                ) : (
                                    <img src={preview.url} alt={preview.name} className="max-h-[450px] object-contain transition-transform duration-700 hover:scale-105" />
                                )}
                            </div>
                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <button onClick={() => copyUrl(preview.url)} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-semibold capitalize hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-indigo-500/10">
                                    {copied === preview.url ? <Check size={20} /> : <Copy size={20} />}
                                    {copied === preview.url ? "Copied Link" : "Copy Direct URL"}
                                </button>
                                <button onClick={() => deleteMedia(preview.id)} className="flex items-center justify-center gap-3 px-8 py-5 bg-rose-50 dark:bg-red-500/10 hover:bg-rose-500 dark:hover:bg-red-500 text-rose-500 dark:text-red-500 hover:text-white font-semibold rounded-2xl border border-rose-200 dark:border-red-500/20 transition-all active:scale-95">
                                    <Trash2 size={20} /> Delete Asset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setItemToDelete(null)
                    }
                }}
                onConfirm={confirmDelete}
                loading={deleting}
                title="Delete Media File?"
                description="This file will be permanently removed from your storage. This action cannot be undone."
            />
        </div>
    )
}
