"use client"

import { useState, useEffect, useRef } from "react"
import { 
    ExternalLink, Check, Loader2, RefreshCw, X, Layout, 
    Link as LinkIcon, FolderOpen, Tag, Image as ImageIcon,
    Edit2, Copy, Save, Plus, Trash2, GripVertical, AlertCircle
} from "lucide-react"

import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import PremiumButton from "@/components/dashboard/PremiumButton"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToFirstScrollableAncestor, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useMemo, useCallback } from "react"

interface MenuItem {
    id: string
    label: string
    href: string
    type: "CATEGORY" | "CUSTOM" | "PAGE"
    isVisible: boolean
    image?: string
    children?: MenuItem[]
    bannerImage?: string
    bannerTitle?: string
    bannerLink?: string
    depth?: number
}

// Move utility functions to top level
const flattenTree = (items: MenuItem[], depth = 0): MenuItem[] => {
    return items.reduce((acc: MenuItem[], item) => {
        acc.push({ ...item, depth })
        if (item.children && item.children.length > 0) {
            acc.push(...flattenTree(item.children, depth + 1))
        }
        return acc
    }, [])
}

const buildTree = (flatItems: MenuItem[]): MenuItem[] => {
    const root: MenuItem[] = []
    const stack: { item: MenuItem, depth: number }[] = []

    flatItems.forEach(flatItem => {
        const item = { ...flatItem, children: [] }
        while (stack.length > 0 && stack[stack.length - 1].depth >= (flatItem.depth || 0)) {
            stack.pop()
        }
        if (stack.length === 0) {
            root.push(item)
        } else {
            stack[stack.length - 1].item.children!.push(item)
        }
        stack.push({ item, depth: flatItem.depth || 0 })
    })
    return root
}

const SortableMenuItem = ({ 
    item, 
    onEdit, 
    onRemove, 
    onToggle, 
    onAddSub, 
    onImageChange 
}: { 
    item: MenuItem, 
    onEdit: (item: MenuItem) => void,
    onRemove: (id: string) => void,
    onToggle: (id: string) => void,
    onAddSub: (item: MenuItem) => void,
    onImageChange: (item: MenuItem) => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        marginLeft: `${(item.depth || 0) * 40}px`,
    }

    const isSystemPage = item.href === "/" || item.href === "/products"

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`relative group ${isDragging ? "z-50 opacity-50" : "z-0"}`}
        >
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-[20px] border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-zinc-300 hover:text-indigo-500">
                    <GripVertical size={16} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize tracking-tight truncate">{item.label}</span>
                        <span className="text-[8px] font-semibold capitalize px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-full shrink-0">{item.type}</span>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5 break-all line-clamp-2">{item.href}</p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                        onClick={() => onAddSub(item)}
                        className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                        title="Add Sub-item"
                    >
                        <Plus size={16} />
                    </button>
                    <button onClick={() => onEdit(item)} className="p-2 text-zinc-400 hover:text-indigo-500 rounded-lg transition-all"><Edit2 size={16} /></button>
                    {!isSystemPage && <button onClick={() => onRemove(item.id)} className="p-2 text-zinc-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>}
                </div>
            </div>
            
            {(item.depth || 0) > 0 && (
                <div className="absolute top-0 -left-6 bottom-0 w-4 border-l-2 border-dashed border-zinc-100 dark:border-zinc-800 -z-10" />
            )}
        </div>
    )
}

export default function MenuManagerPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [initialMenuItems, setInitialMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSaved, setLastSaved] = useState<string | null>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const [offsetLeft, setOffsetLeft] = useState(0)
    
    const [showAddItem, setShowAddItem] = useState(false)
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [pendingParentId, setPendingParentId] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [activeImageItemId, setActiveImageItemId] = useState<string | null>(null)
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [newItem, setNewItem] = useState<Partial<MenuItem>>({
        label: "",
        href: "",
        type: "CUSTOM",
        isVisible: true,
    })

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const modifiers = useMemo(() => [
        restrictToFirstScrollableAncestor, 
        restrictToWindowEdges
    ], [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search)
                const ownerId = params.get("ownerId")
                
                const settingsUrl = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
                const catsUrl = ownerId ? `/api/dashboard/categories?ownerId=${ownerId}` : "/api/dashboard/categories"
                const productsUrl = ownerId ? `/api/dashboard/products?ownerId=${ownerId}` : "/api/dashboard/products"

                const [settingsRes, catsRes, productsRes] = await Promise.all([
                    fetch(settingsUrl),
                    fetch(catsUrl),
                    fetch(productsUrl)
                ])
                const settings = await settingsRes.json()
                const cats = await catsRes.json()
                const prods = await productsRes.json()
                
                setCategories(cats)
                setProducts(prods)
                
                if (settings.menuItems && Array.isArray(settings.menuItems) && settings.menuItems.length > 0) {
                    setMenuItems(settings.menuItems)
                    setInitialMenuItems(settings.menuItems)
                } else {
                    const defaultItems: MenuItem[] = [
                        { id: "1", label: "Home", href: "/", type: "PAGE", isVisible: true, children: [] },
                        { id: "2", label: "Shop", href: "/products", type: "PAGE", isVisible: true, children: [] }
                    ]
                    setMenuItems(defaultItems)
                    setInitialMenuItems(defaultItems)
                }
            } catch (err) {
                console.error("Failed to fetch data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        if (JSON.stringify(menuItems) === JSON.stringify(initialMenuItems)) return

        setSaving(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"
            
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menuItems: menuItems }),
            })

            if (res.ok) {
                setInitialMenuItems([...menuItems])
                setIsDirty(false)
                setSaved(true)
                setLastSaved(new Date().toLocaleTimeString())
                setTimeout(() => setSaved(false), 3000)
            }
        } catch (err) {
            console.error("Failed to save menu:", err)
        }
        setSaving(false)
    }

    useEffect(() => {
        if (loading || menuItems.length === 0) return
        
        const hasChanged = JSON.stringify(menuItems) !== JSON.stringify(initialMenuItems)
        setIsDirty(hasChanged)

        if (hasChanged) {
            const timer = setTimeout(() => {
                handleSave()
            }, 2500)
            return () => clearTimeout(timer)
        }
    }, [menuItems, initialMenuItems, loading])

    const flatItems = useMemo(() => flattenTree(menuItems), [menuItems])

    const addItem = () => {
        if (!newItem.label || !newItem.href) {
            alert("Please provide both a label and a URL");
            return;
        }
        
        const itemToAdd: MenuItem = {
            ...newItem as MenuItem,
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            children: [],
            isVisible: true,
            type: newItem.type || "CUSTOM",
            depth: 0
        }

        if (editingItemId) {
            const updatedItems = flatItems.map(item => 
                item.id === editingItemId ? { ...item, ...newItem } as MenuItem : item
            )
            setMenuItems(buildTree(updatedItems))
            setEditingItemId(null)
        } else if (pendingParentId) {
            const parentIndex = flatItems.findIndex(i => i.id === pendingParentId)
            const parentDepth = flatItems[parentIndex]?.depth ?? 0
            const newItemHierarchical = { ...itemToAdd, depth: parentDepth + 1 }
            
            // Insert after parent (and its current children)
            const newFlatItems = [...flatItems]
            let insertAt = parentIndex + 1
            while (insertAt < newFlatItems.length && newFlatItems[insertAt].depth! > parentDepth) {
                insertAt++
            }
            newFlatItems.splice(insertAt, 0, newItemHierarchical)
            setMenuItems(buildTree(newFlatItems))
            setPendingParentId(null)
        } else {
            setMenuItems(prev => [...prev, itemToAdd])
        }
        setShowAddItem(false)
        setNewItem({ label: "", href: "", type: "CUSTOM", isVisible: true })
        setSaved(false)
    }

    const editItem = useCallback((item: MenuItem) => {
        setNewItem({ 
            label: item.label, 
            href: item.href, 
            type: item.type, 
            isVisible: item.isVisible,
            bannerImage: item.bannerImage,
            bannerTitle: item.bannerTitle,
            bannerLink: item.bannerLink,
            image: item.image
        })
        setEditingItemId(item.id)
        setShowAddItem(true)
    }, [])

    const confirmRemove = async () => {
        if (!itemToDelete) return
        setDeleting(true)
        // No API call needed here since it's client-side state until "Save Menu" is clicked
        setMenuItems(prev => {
            const flat = flattenTree(prev)
            const filtered = flat.filter(item => item.id !== itemToDelete)
            return buildTree(filtered)
        })
        setShowDeleteModal(false)
        setItemToDelete(null)
        setDeleting(false)
    }

    const removeItem = useCallback((id: string) => {
        setItemToDelete(id)
        setShowDeleteModal(true)
    }, [])

    const toggleVisibility = useCallback((id: string) => {
        setMenuItems(prev => {
            const flat = flattenTree(prev)
            const updated = flat.map(item => 
                item.id === id ? { ...item, isVisible: !item.isVisible } : item
            )
            return buildTree(updated)
        })
    }, [])

    const setItemImage = useCallback((itemId: string, imageUrl: string) => {
        setMenuItems(prev => {
            const flat = flattenTree(prev)
            const updated = flat.map(item => 
                item.id === itemId ? { ...item, image: imageUrl } : item
            )
            return buildTree(updated)
        })
    }, [])

    const addSubItem = useCallback((item: MenuItem) => {
        setPendingParentId(item.id)
        setEditingItemId(null)
        setNewItem({ label: "", href: "", type: "CUSTOM", isVisible: true })
        setShowAddItem(true)
    }, [])

    const openImageModal = useCallback((item: MenuItem) => {
        setActiveImageItemId(item.id)
        setModalOpen(true)
    }, [])

    const restrictToElement = ({ transform, draggingNodeRect, containerNodeRect }: any) => {
        if (!draggingNodeRect || !containerNodeRect) return transform;

        return {
            ...transform,
            x: Math.max(
                containerNodeRect.left - draggingNodeRect.left,
                Math.min(
                    transform.x,
                    containerNodeRect.left + containerNodeRect.width - draggingNodeRect.left - draggingNodeRect.width
                )
            ),
            y: Math.max(
                containerNodeRect.top - draggingNodeRect.top,
                Math.min(
                    transform.y,
                    containerNodeRect.top + containerNodeRect.height - draggingNodeRect.top - draggingNodeRect.height
                )
            ),
        };
    };

    const handleDragStart = ({ active }: any) => {
        setActiveId(active.id)
        if (containerRef.current) {
            setContainerRect(containerRef.current.getBoundingClientRect())
        }
    }

    const handleDragOver = ({ over }: any) => {
        setOverId(over?.id ?? null)
    }

    const handleDragMove = ({ delta, active }: any) => {
        if (!containerRect || !active) {
            setOffsetLeft(delta.x)
            return
        }

        const activeItem = flatItems.find(i => i.id === active.id)
        if (!activeItem) {
            setOffsetLeft(delta.x)
            return
        }

        // Hard clamping: ensure the item (plus its current depth) doesn't exceed container bounds
        const indentationWidth = 40
        const startX = (activeItem.depth || 0) * indentationWidth
        
        // We'll leave about 200px minimum for the box width on the right
        const minX = -startX
        const maxX = containerRect.width - 320 - startX 
        
        const clampedX = Math.max(minX, Math.min(maxX, delta.x))
        setOffsetLeft(clampedX)
    }

    const handleDragEnd = ({ active, over }: any) => {
        if (over) {
            try {
                const activeIndex = flatItems.findIndex(i => i.id === active.id)
                const overIndex = flatItems.findIndex(i => i.id === over.id)
                
                if (activeIndex === -1 || overIndex === -1) return

                let newItems = [...flatItems]
                if (active.id !== over.id) {
                    newItems = arrayMove(flatItems, activeIndex, overIndex)
                }
                
                const targetIndex = active.id !== over.id ? overIndex : activeIndex
                const prevItem = newItems[targetIndex - 1]
                
                // Calculate projected depth
                const indentationWidth = 40
                const currentDepth = flatItems[activeIndex].depth ?? 0
                const maxPossibleDepth = prevItem ? prevItem.depth! + 1 : 0
                
                const projectedDepth = Math.max(0, Math.min(
                    maxPossibleDepth,
                    Math.round(offsetLeft / indentationWidth) + currentDepth
                ))
                
                newItems[targetIndex] = { ...newItems[targetIndex], depth: projectedDepth }
                
                const tree = buildTree(newItems)
                if (tree) setMenuItems(tree)
            } catch (err) {
                console.error("Drag end error:", err)
            }
        }

        resetState()
    }

    const resetState = useCallback(() => {
        setActiveId(null)
        setOverId(null)
        setOffsetLeft(0)
    }, [])


    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-zinc-500">
            <Loader2 className="animate-spin text-indigo-500" size={32} /> 
            <p className="text-sm font-semibold tracking-tight">Loading menu config...</p>
        </div>
    )

    const isTopLevel = !pendingParentId && (!editingItemId || flatItems.find(i => i.id === editingItemId)?.depth === 0)

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">Menu Manager</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Customize your store's navigation menu & mega menu.</p>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        {saving ? (
                            <div className="flex items-center gap-2 text-indigo-500">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saving...</span>
                            </div>
                        ) : lastSaved ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Check size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Saved {lastSaved}</span>
                            </div>
                        ) : isDirty ? (
                            <div className="flex items-center gap-2 text-amber-500">
                                <RefreshCw size={12} className="animate-spin-slow" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Unsaved</span>
                            </div>
                        ) : null}
                    </div>
                    <PremiumButton 
                        onClick={handleSave}
                        isLoading={saving}
                        isSaved={saved}
                        icon={saved ? Check : isDirty ? RefreshCw : Save}
                        loadingText="Saving..."
                    >
                        {isDirty ? "Sync Now" : "Published"}
                    </PremiumButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-semibold text-black dark:text-white capitalize tracking-wide">Menu Structure</h3>
                            <button 
                                onClick={() => { setEditingItemId(null); setNewItem({ label: "", href: "", type: "CUSTOM", isVisible: true }); setShowAddItem(true); }}
                                className="p-3 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div ref={containerRef} className="space-y-4 min-h-[400px] pr-10 md:pr-20">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={handleDragStart}
                                onDragMove={handleDragMove}
                                onDragEnd={handleDragEnd}
                                modifiers={modifiers}
                            >
                                <SortableContext items={flatItems} strategy={verticalListSortingStrategy}>
                                    {flatItems.map((item) => (
                                        <SortableMenuItem 
                                            key={item.id} 
                                            item={item}
                                            onEdit={editItem}
                                            onRemove={removeItem}
                                            onToggle={toggleVisibility}
                                            onAddSub={addSubItem}
                                            onImageChange={openImageModal}
                                        />
                                    ))}
                                </SortableContext>

                                <DragOverlay dropAnimation={null}>
                                    {activeId ? (() => {
                                        const activeItem = flatItems.find(i => i.id === activeId);
                                        if (!activeItem) return null;
                                        
                                        // Neutralize horizontal transform to fix "double-speed" issue
                                        const xOffset = (activeItem.depth || 0) * 40 + offsetLeft;
                                        
                                        return (
                                            <div 
                                                style={{ 
                                                    transform: `translate3d(0, 0, 0)`,
                                                    marginLeft: `${xOffset}px` 
                                                }}
                                                className="opacity-80 scale-105 cursor-grabbing"
                                            >
                                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-[20px] border-2 border-indigo-500 shadow-2xl">
                                                    <GripVertical size={16} className="text-indigo-500" />
                                                    <div className="flex-1">
                                                        <span className="text-sm font-semibold capitalize">{activeItem.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })() : null}
                                </DragOverlay>
                            </DndContext>

                            {menuItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[32px]">
                                    <LinkIcon size={32} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-semibold capitalize tracking-wide">Your menu is empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[40px] p-8">
                        <h3 className="text-xs font-semibold text-black dark:text-white capitalize tracking-wide">Quick Add</h3>
                         <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setMenuItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, label: "Shop", href: "/products", type: "PAGE", isVisible: true, children: [] } as MenuItem])}
                                className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><Layout size={16} /></div>
                                    <span className="text-xs font-semibold capitalize tracking-tight">Main Catalog</span>
                                </div>
                                <Plus size={14} className="text-zinc-300 group-hover:text-indigo-500" />
                            </button>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                                <p className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide mb-4">Categories</p>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map(cat => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => setMenuItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, label: cat.name, href: `/products?category=${encodeURIComponent(cat.name)}`, type: "CATEGORY", isVisible: true, children: [] }])}
                                            className="w-full flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:scale-[1.02] active:scale-95 transition-all text-left group"
                                        >
                                            <span className="text-[10px] font-semibold capitalize tracking-tight truncate max-w-[120px]">{cat.name}</span>
                                            <Plus size={12} className="text-zinc-300 group-hover:text-indigo-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddItem && (
                <div className="fixed inset-0 z-[70] bg-black/40 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-10 w-full ${isTopLevel ? "max-w-2xl" : "max-w-xl"} shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-black dark:text-white capitalize tracking-tight">
                                {editingItemId ? "Edit Menu Item" : pendingParentId ? "Add Sub-item" : "Add Custom Link"}
                            </h3>
                            <button onClick={() => { setShowAddItem(false); setEditingItemId(null); setPendingParentId(null); }} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"><X size={24} /></button>
                        </div>
                        
                        <div className={`grid grid-cols-1 ${isTopLevel ? "md:grid-cols-2" : ""} gap-10`}>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold text-indigo-500 capitalize tracking-wide">Quick Import</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setNewItem(f => ({ ...f, type: 'CATEGORY' }))} className={`px-2 py-1 text-[8px] font-semibold capitalize rounded ${newItem.type === 'CATEGORY' ? 'bg-indigo-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>Cats</button>
                                        <button onClick={() => setNewItem(f => ({ ...f, type: 'PAGE' }))} className={`px-2 py-1 text-[8px] font-semibold capitalize rounded ${newItem.type === 'PAGE' && !newItem.href?.startsWith('/product/') ? 'bg-indigo-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>Page</button>
                                        <button onClick={() => setNewItem(f => ({ ...f, type: 'PAGE' }))} className={`px-2 py-1 text-[8px] font-semibold capitalize rounded ${newItem.href?.startsWith('/product/') ? 'bg-indigo-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>Prod</button>
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                                    {newItem.type === 'CATEGORY' ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {categories.map(cat => (
                                                <button 
                                                    key={cat.id}
                                                    onClick={() => setNewItem(f => ({ ...f, label: cat.name, href: `/products?category=${encodeURIComponent(cat.name)}`, type: "CATEGORY", isVisible: true }))}
                                                    className="w-full text-left p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-indigo-500 transition-all flex items-center justify-between group/q"
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{cat.name}</span>
                                                    <Plus size={12} className="text-zinc-300 group-hover/q:text-indigo-500" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : newItem.href?.startsWith('/product/') ? (
                                        <div className="grid grid-cols-1 gap-2">
                                            {products.slice(0, 20).map(p => (
                                                <button 
                                                    key={p.id}
                                                    onClick={() => setNewItem(f => ({ ...f, label: p.name, href: `/product/${p.slug}`, type: "PAGE", isVisible: true }))}
                                                    className="w-full text-left p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-indigo-500 transition-all flex items-center justify-between group/q"
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">{p.name}</span>
                                                    <Plus size={12} className="text-zinc-300 group-hover/q:text-indigo-500" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { label: 'Home', href: '/' },
                                                { label: 'All Products', href: '/products' },
                                                { label: 'Cart', href: '/cart' },
                                                { label: 'My Account', href: '/login' }
                                            ].map(page => (
                                                <button 
                                                    key={page.href}
                                                    onClick={() => setNewItem(f => ({ ...f, label: page.label, href: page.href, type: "PAGE", isVisible: true }))}
                                                    className="w-full text-left p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 hover:border-indigo-50 transition-all flex items-center justify-between group/q"
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{page.label}</span>
                                                    <Plus size={12} className="text-zinc-300 group-hover/q:text-indigo-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Link Label</label>
                                        <input value={newItem.label} onChange={e => setNewItem(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Instagram" className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-black/5 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">URL / Extension</label>
                                        <input value={newItem.href} onChange={e => setNewItem(f => ({ ...f, href: e.target.value }))} placeholder="e.g. /custom-page or https://..." className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-black/5 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {isTopLevel && (
                                <div className="space-y-6">
                                    <p className="text-[10px] font-semibold text-indigo-600 capitalize tracking-wide">Mega Menu Banner</p>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Banner Title</label>
                                            <input value={newItem.bannerTitle || ""} onChange={e => setNewItem(f => ({ ...f, bannerTitle: e.target.value }))} placeholder="e.g. Premium Collection" className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-black/5 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Link to Product</label>
                                            <select 
                                                value={newItem.bannerLink || ""} 
                                                onChange={e => setNewItem(f => ({ ...f, bannerLink: e.target.value }))}
                                                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-black/5 outline-none"
                                            >
                                                <option value="">None / Custom</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={`/product/${p.slug}`}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Banner Image</label>
                                            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                                {newItem.bannerImage ? (
                                                    <img src={newItem.bannerImage} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400"><ImageIcon size={20} /></div>
                                                )}
                                                <button 
                                                    onClick={() => { setActiveImageItemId(`banner-${editingItemId || 'temp'}`); setModalOpen(true); }}
                                                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-semibold capitalize tracking-wide"
                                                >
                                                    Choose
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                            <button onClick={() => { setShowAddItem(false); setEditingItemId(null); setPendingParentId(null); }} className="py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl text-[10px] font-semibold capitalize tracking-wide hover:bg-zinc-200 transition-colors">Cancel</button>
                            <PremiumButton 
                                onClick={addItem}
                                className="py-4"
                            >
                                {editingItemId ? "Update Item" : "Add to Menu"}
                            </PremiumButton>
                        </div>
                    </div>
                </div>
            )}

            <MediaLibraryModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={(url, item) => {
                    if (activeImageItemId?.startsWith('banner-')) {
                        setNewItem(f => ({ ...f, bannerImage: url }))
                        setModalOpen(false)
                        setActiveImageItemId(null)
                    } else if (activeImageItemId) {
                        setItemImage(activeImageItemId, url)
                        setModalOpen(false)
                        setActiveImageItemId(null)
                    }
                }}
                title="Select Image"
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setItemToDelete(null)
                    }
                }}
                onConfirm={confirmRemove}
                loading={deleting}
                title="Delete Menu Item?"
                description="This item and its sub-menus (if any) will be removed from your navigation. You must click 'Save Menu' to persist these changes."
            />
        </div>
    )
}
