"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, Upload, Check, Save } from "lucide-react"
import { MediaLibraryModal } from "@/components/MediaLibraryModal"
import { FormSkeleton } from "@/components/dashboard/DashboardSkeletons"
import PremiumButton from "@/components/dashboard/PremiumButton"

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        image: "",
        address: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: ""
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/profile?ownerId=${ownerId}` : "/api/dashboard/profile"

        fetch(url)
            .then(r => r.json())
            .then(data => {
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    image: data.image || "",
                    address: data.address || "",
                    area: data.area || "",
                    landmark: data.landmark || "",
                    city: data.city || "",
                    state: data.state || "",
                    pincode: data.pincode || ""
                })
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/profile?ownerId=${ownerId}` : "/api/dashboard/profile"

        setSaving(true)
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
        })
        setSaving(false)
        if (res.ok) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
    }

    const update = (key: keyof typeof profile, val: string) => setProfile(p => ({ ...p, [key]: val }))

    const handleMediaSelect = (url: string, item: any) => {
        update("image", url)
        setIsModalOpen(false)
    }


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize truncate">Profile Summary</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Last updated on {new Date().toLocaleDateString()}</p>
                </div>
                <PremiumButton
                    onClick={handleSave}
                    isLoading={saving}
                    isSaved={saved}
                    icon={saved ? Check : Save}
                >
                    Save Changes
                </PremiumButton>
            </div>
            {loading ? (
                <FormSkeleton />
            ) : (
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm p-6 sm:p-10 space-y-10">
                    
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950 shadow-xl flex items-center justify-center">
                                {profile.image ? (
                                    <img src={profile.image} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <User size={48} className="text-zinc-300" />
                                )}
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform shadow-indigo-500/10"
                            >
                                <Upload size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 flex-1 w-full">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Full Name</label>
                                <input 
                                    value={profile.name} 
                                    onChange={e => update("name", e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input 
                                    type="email"
                                    value={profile.email} 
                                    onChange={e => update("email", e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input 
                                    type="tel"
                                    value={profile.phone} 
                                    onChange={e => update("phone", e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Street Address</label>
                            <input 
                                value={profile.address} 
                                onChange={e => update("address", e.target.value)}
                                placeholder="123 Main St"
                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Area / Home</label>
                                <input 
                                    value={profile.area} 
                                    onChange={e => update("area", e.target.value)}
                                    placeholder="Sector 45"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Landmark</label>
                                <input 
                                    value={profile.landmark} 
                                    onChange={e => update("landmark", e.target.value)}
                                    placeholder="Near Central Park"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">City</label>
                                <input 
                                    value={profile.city} 
                                    onChange={e => update("city", e.target.value)}
                                    placeholder="New Delhi"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">State</label>
                                <input 
                                    value={profile.state} 
                                    onChange={e => update("state", e.target.value)}
                                    placeholder="Delhi"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-[10px] font-semibold text-zinc-400 capitalize tracking-wide">Pincode</label>
                                <input 
                                    value={profile.pincode} 
                                    onChange={e => update("pincode", e.target.value)}
                                    placeholder="110001"
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-black dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                </section>
            )}

            <MediaLibraryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSelect={handleMediaSelect}
                title="Select Profile Photo"
            />
        </div>
    )
}
