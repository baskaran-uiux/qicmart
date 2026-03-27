"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, FolderOpen, X, Check, Upload, Image as ImageIcon, Loader2, Search, AlertCircle } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface Category {
    id: string
    name: string
    slug: string
    description?: string | null
    image?: string | null
    parentId?: string | null
    _count?: { products: number }
}

export default function CategoriesPage() {
    const { t } = useDashboardStore()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [mediaModalOpen, setMediaModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: "", description: "", image: "", parentId: "" })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [initialForm, setInitialForm] = useState<any>(null)
    const [lastSaved, setLastSaved] = useState<string | null>(null)

    const buildTree = (items: Category[]) => {
        const map = new Map<string, any>()
        const roots: any[] = []
        items.forEach(item => map.set(item.id, { ...item, children: [] }))
        items.forEach(item => {
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId).children.push(map.get(item.id))
            } else {
                roots.push(map.get(item.id))
            }
        })
        return roots
    }

    const flattenTree = (tree: any[], depth = 0): any[] => {
        return tree.reduce((acc: any[], item) => {
            acc.push({ ...item, depth })
            if (item.children && item.children.length > 0) {
                acc.push(...flattenTree(item.children, depth + 1))
            }
            return acc
        }, [])
    }

    const hierarchicalCategories = flattenTree(buildTree(Array.isArray(categories) ? categories : []))

    const filtered = hierarchicalCategories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description?.toLowerCase() || "").includes(search.toLowerCase())
    )

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"
            
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            
            const data = await res.json()
            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    const openAdd = () => {
        setEditingId(null)
        const initial = { name: "", description: "", image: "", parentId: "" }
        setForm(initial)
        setInitialForm(initial)
        setIsDirty(false)
        setModalOpen(true)
    }

    const openEdit = (cat: Category) => {
        setEditingId(cat.id)
        const initial = {
            name: cat.name,
            description: cat.description || "",
            image: cat.image || "",
            parentId: cat.parentId || ""
        }
        setForm(initial)
        setInitialForm(initial)
        setIsDirty(false)
        setModalOpen(true)
    }

    const closeForm = () => {
        setModalOpen(false)
        setEditingId(null)
        setForm({ name: "", description: "", image: "", parentId: "" })
    }

    const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    const handleAutoSave = async () => {
        if (!editingId || !form.name.trim()) return
        if (JSON.stringify(form) === JSON.stringify(initialForm)) return

        setSaving(true)
        setError(null)
        
        const body = {
            id: editingId,
            name: form.name.trim(),
            slug: slugify(form.name.trim()),
            description: form.description,
            image: form.image || null,
            parentId: form.parentId || null
        }
        
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (res.ok) {
                setInitialForm({ ...form })
                setIsDirty(false)
                setLastSaved(new Date().toLocaleTimeString())
                // Refresh list in background
                const cRes = await fetch(url)
                const cData = await cRes.json()
                setCategories(Array.isArray(cData) ? cData : [])
            }
        } catch (e) {
            console.error("Auto-save failed:", e)
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (!modalOpen || !editingId) return
        
        const hasChanged = JSON.stringify(form) !== JSON.stringify(initialForm)
        setIsDirty(hasChanged)

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleAutoSave()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [form, modalOpen, editingId])

    const saveCategory = async () => {
        if (!form.name.trim()) {
            setError(t('nameRequired'))
            return
        }

        if (editingId) {
            await handleAutoSave()
            closeForm()
            return
        }

        setSaving(true)
        setError(null)
        
        const body = {
            name: form.name.trim(),
            slug: slugify(form.name.trim()),
            description: form.description,
            image: form.image || null,
            parentId: form.parentId || null
        }
        
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            
            if (res.ok) {
                closeForm()
                fetchCategories()
            } else {
                setError(data.error || t('categoryError'))
            }
        } catch (e: any) {
            setError("Network error. Please try again.")
        }
        setSaving(false)
    }

    const confirmDelete = async () => {
        if (!categoryToDelete) return
        setDeleting(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/categories?id=${categoryToDelete}&ownerId=${ownerId}` : `/api/dashboard/categories?id=${categoryToDelete}`
            
            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                fetchCategories()
                setShowDeleteModal(false)
                setCategoryToDelete(null)
            }
        } catch (e) {
            console.error("Failed to delete category", e)
        }
        setDeleting(false)
    }

    const deleteCategory = (id: string) => {
        setCategoryToDelete(id)
        setShowDeleteModal(true)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">{t('categories')}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{t('categoriesDesc')}</p>
                </div>
                <button
                    onClick={openAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-semibold capitalize hover:opacity-90 transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
                >
                    <Plus size={18} /> {t('createCategory')}
                </button>
            </div>

            <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder={t('searchCategories')} 
                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm md:w-64" 
                />
            </div>

            {/* Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-[40px] p-6 sm:p-8 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[92vh]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-black dark:text-white tracking-tighter italic">{editingId ? t('editCategory') : t('newCategory')}</h3>
                            <button onClick={closeForm} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize">{t('categoryName')}</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('placeholderCategoryName')} className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-black/5 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize">{t('description')}</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('placeholderCategoryDesc')} rows={3} className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-black/5 outline-none resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize">{t('parentCategory')}</label>
                                <select 
                                    value={form.parentId} 
                                    onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                                    className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-black/5 outline-none appearance-none"
                                >
                                    <option value="">{t('noneTopLevel')}</option>
                                    {categories
                                        .filter(c => c.id !== editingId)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize">{t('featuredImage')}</label>
                                <div onClick={() => setMediaModalOpen(true)} className="group relative h-40 bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 transition-all overflow-hidden shrink-0">
                                    {form.image ? (
                                        <>
                                            <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all">
                                                <span className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-bold capitalize shadow-2xl">{t('change')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-300">
                                            <Upload size={32} />
                                            <span className="text-[10px] font-bold capitalize mt-2">{t('selectImage')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        {saving ? (
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <Loader2 size={12} className="animate-spin" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('saving')}</span>
                                            </div>
                                        ) : lastSaved ? (
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <Check size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('saved')} {lastSaved}</span>
                                            </div>
                                        ) : isDirty ? (
                                            <div className="flex items-center gap-2 text-amber-500">
                                                <AlertCircle size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('unsavedChanges')}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                    <button onClick={saveCategory} disabled={saving} className="px-8 py-3 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 disabled:opacity-50">
                                        {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                        {editingId ? t('done') : t('create')}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-shake bg-rose-500/5 py-2 rounded-lg">{error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Table */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-24 text-center text-zinc-400 font-semibold italic capitalize tracking-wide">{t('scanningCategoryTree')}</div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-zinc-50 dark:bg-zinc-950 rounded-[40px] border border-zinc-100 dark:border-zinc-800">
                        <FolderOpen size={64} className="text-zinc-200 dark:text-zinc-800 mb-6" />
                        <p className="font-bold text-zinc-300 capitalize italic">{t('noCategoriesYet')}</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                            <table className="w-full text-[12px] sm:text-[14px] text-left">
                                <thead className="bg-[#F8FAFC] dark:bg-zinc-950 text-[#334155] dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 sm:px-10 py-6 text-left">{t('category')}</th>
                                        <th className="px-6 py-6 text-left">{t('description')}</th>
                                        <th className="px-6 sm:px-10 py-6 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                                    {filtered.map((c) => (
                                        <tr key={c.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all">
                                            <td className="px-6 sm:px-10 py-6">
                                                <div className="flex items-center gap-4" style={{ marginLeft: `${c.depth * 32}px` }}>
                                                    {c.depth > 0 && <div className="w-4 h-px bg-zinc-200 dark:bg-zinc-700" />}
                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                                                        {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
                                                    </div>
                                                     <div className="flex flex-col">
                                                         <span className="font-medium text-black dark:text-white group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">{c.name}</span>
                                                         {c.depth > 0 && <span className="text-[8px] font-semibold text-zinc-400 capitalize mt-0.5">{t('subCategory')}</span>}
                                                     </div>
                                                </div>
                                            </td>
                                             <td className="px-6 py-6 text-zinc-500 text-xs font-medium leading-relaxed truncate max-w-[200px]">{c.description || t('noDescriptionSet')}</td>
                                            <td className="px-6 sm:px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 transition-all">
                                                    <button onClick={() => openEdit(c)} className="p-2.5 text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"><Pencil size={18} /></button>
                                                    <button onClick={() => deleteCategory(c.id)} disabled={deletingId === c.id} className="p-2.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <MediaLibraryModal 
                isOpen={mediaModalOpen}
                onClose={() => setMediaModalOpen(false)}
                onSelect={(url) => {
                    setForm(f => ({ ...f, image: url }))
                    setMediaModalOpen(false)
                }}
                title={t('selectCategoryImage')}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setCategoryToDelete(null)
                    }
                }}
                onConfirm={confirmDelete}
                loading={deleting}
                title={t('deleteCategoryTitle')}
                description={t('deleteCategoryDesc')}
            />
        </div>
    )
}
