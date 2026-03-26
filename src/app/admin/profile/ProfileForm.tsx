"use client"

import { useState, useRef } from "react"
import { User, Mail, Shield, Camera, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { updateAdminProfile } from "./actions"
import Image from "next/image"
import { toast } from "sonner"

interface ProfileFormProps {
    admin: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

export default function ProfileForm({ admin }: ProfileFormProps) {
    const [name, setName] = useState(admin.name || "")
    const [email, setEmail] = useState(admin.email || "")
    const [image, setImage] = useState(admin.image || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateAdminProfile(admin.id, { name, email })
            if (result.success) {
                toast.success("Profile updated successfully")
            } else {
                toast.error(result.error || "Failed to update profile")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/admin/profile/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()

            if (data.success) {
                setImage(data.imageUrl)
                toast.success("Profile image updated")
            } else {
                toast.error(data.error || "Failed to upload image")
            }
        } catch (error) {
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Profile Avatar Card */}
            <div className="lg:col-span-1">
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 text-center shadow-xl">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="w-full h-full rounded-[32px] bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden">
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{name?.charAt(0) || "A"}</span>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute -bottom-2 -right-2 p-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl border-4 border-white dark:border-zinc-900 hover:scale-110 transition-transform disabled:opacity-50"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{name || "Super Admin"}</h3>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1 italic">Platform Administrator</p>
                    
                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                            <span>Security Level</span>
                            <span className="text-emerald-500">Tier 1</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[95%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Details Form */}
            <div className="lg:col-span-2 space-y-8">
                <div className="p-10 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Full Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-10 w-full md:w-auto px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl dark:shadow-white/10 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>

                <div className="p-10 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Security Settings</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-400 border border-zinc-200 dark:border-white/5 shadow-sm">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-black text-zinc-900 dark:text-white uppercase tracking-tight">Two-Factor Authentication</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Enhance your account security</div>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
                            </div>
                        </div>

                        <button className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline ml-2">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
