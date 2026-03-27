"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Users, Trash2, UserPlus, Mail, Phone, X, Check, Loader2, ShoppingCart, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal"
import { useDashboardStore } from "@/components/DashboardStoreProvider"

interface Customer {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    address?: string | null
    createdAt: string
    orderCount: number
    totalSpend: number
    aov: number
    lastActive?: string | null
    status: string
}

export default function CustomersPage() {
    const { t } = useDashboardStore()
    const searchParams = useSearchParams()
    const ownerId = searchParams.get("ownerId")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const filtered = (Array.isArray(customers) ? customers : []).filter(c => 
        c.firstName.toLowerCase().includes(search.toLowerCase()) ||
        (c.lastName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone?.toLowerCase() || "").includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedCustomers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const fetchCustomers = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/customers?ownerId=${ownerId}` : "/api/dashboard/customers"

        setLoading(true)
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            
            const data = await res.json()
            setCustomers(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error("Failed to fetch customers", e)
        }
        setLoading(false)
    }

    useEffect(() => { fetchCustomers() }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const save = async () => {
        if (!form.firstName || !form.email) return
        setSaving(true)
        
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/customers?ownerId=${ownerId}` : "/api/dashboard/customers"

        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
        setShowForm(false)
        setForm({ firstName: "", lastName: "", email: "", phone: "" })
        fetchCustomers()
        setSaving(false)
    }

    const confirmDelete = async () => {
        if (!customerToDelete) return
        setDeleting(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const ownerId = params.get("ownerId")
            const url = `/api/dashboard/customers?id=${customerToDelete}${ownerId ? `&ownerId=${ownerId}` : ""}`
            
            const res = await fetch(url, { method: "DELETE" })
            if (res.ok) {
                fetchCustomers()
                setShowDeleteModal(false)
                setCustomerToDelete(null)
            }
        } catch (e) {
            console.error("Failed to delete customer", e)
        }
        setDeleting(false)
    }

    const deleteCustomer = (id: string) => {
        setCustomerToDelete(id)
        setShowDeleteModal(true)
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Inactive": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
        }
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric"
        })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">{t('customersTitle')}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">{customers.length} {t('registeredCustomers')}. {t('manageRelationships') || "Manage your relationships."}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative group w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder={t('searchCustomers')} 
                            className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-black dark:text-white transition-all shadow-sm" 
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-semibold capitalize hover:opacity-90 transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
                    >
                        <UserPlus size={16} /> {t('addCustomer')}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">{t('newCustomerTitle')}</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder={t('firstName')} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                            <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder={t('lastName')} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder={t('emailAddress')} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                            <button onClick={save} disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                {saving ? t('savingCustomer') : t('createCustomer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-400">
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                        <span className="text-xs font-semibold capitalize">{t('initializing')}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-[12px] sm:text-[14px] text-left">
                            <thead className="bg-zinc-50/50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-bold capitalize border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="p-4 w-10"><input type="checkbox" className="rounded border-zinc-300" /></th>
                                    <th className="p-4 whitespace-nowrap">{t('customerInfo')}</th>
                                    <th className="p-4 whitespace-nowrap">{t('emailAddress')}</th>
                                    <th className="p-4 whitespace-nowrap">{t('lastActive')}</th>
                                    <th className="p-4 whitespace-nowrap">{t('dateRegistered')}</th>
                                    <th className="p-4 whitespace-nowrap">{t('orders')}</th>
                                    <th className="p-4 whitespace-nowrap text-center">{t('totalSpend')}</th>
                                    <th className="p-4 whitespace-nowrap text-center">{t('aov')}</th>
                                    <th className="p-4 whitespace-nowrap">{t('status')}</th>
                                    <th className="p-4 whitespace-nowrap text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {paginatedCustomers.map((c) => (
                                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4"><input type="checkbox" className="rounded border-zinc-300" /></td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">{c.firstName} {c.lastName || "Example"}</span>
                                                <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">{c.phone || "9724085963"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">{c.email}</td>
                                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{formatDate(c.lastActive) || "June 06, 2025"}</td>
                                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{formatDate(c.createdAt)}</td>
                                         <td className="p-4 text-center">
                                             <span className="inline-flex items-center px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                                                 {c.orderCount || 0}
                                             </span>
                                         </td>
                                         <td className="p-4 text-zinc-700 dark:text-zinc-300 text-center font-bold">{(c.totalSpend || 0).toLocaleString()}</td>
                                         <td className="p-4 text-zinc-700 dark:text-zinc-300 text-center font-bold">{Math.round(c.aov || 0).toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <div className={`w-10 h-5 rounded-full transition-colors ${c.status === "Active" ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`}>
                                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${c.status === "Active" ? "translate-x-5" : "translate-x-0"}`} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/customers/${c.id}${ownerId ? `?ownerId=${ownerId}` : ""}`} 
                                                    className="p-2.5 text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                                                    title={t('viewProfile')}
                                                >
                                                    <Search size={18} />
                                                </Link>
                                                 <button className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                                     <ShoppingCart size={18} />
                                                 </button>
                                                 <button 
                                                     onClick={() => deleteCustomer(c.id)}
                                                     className="p-2 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                                 >
                                                     <Trash2 size={18} />
                                                 </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                         {totalPages > 1 && (
                             <div className="px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                                 <div className="text-[10px] font-bold capitalize text-zinc-400">
                                     {t('showing')} <span className="text-indigo-600 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> {t('to')} <span className="text-indigo-600 font-bold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> {t('of')} <span className="text-indigo-600 font-bold">{filtered.length}</span> {t('customers')}
                                 </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1 mx-2">
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
                                                         className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${currentPage === pageNum ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500"}`}
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
                                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 disabled:opacity-30 transition-all hover:bg-zinc-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!deleting) {
                        setShowDeleteModal(false)
                        setCustomerToDelete(null)
                    }
                }}
                onConfirm={confirmDelete}
                loading={deleting}
                title={t('deleteCustomerTitle')}
                description={t('deleteCustomerDesc')}
            />
        </div>
    )
}
